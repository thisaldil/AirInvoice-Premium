const path = require('path');
const fs = require('fs');
const { extractTextFromPdf, extractStructuredData } = require('../services/huggingFaceService');

exports.handleOCR = async (req, res) => {
  let filePath;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF ticket file.' });
    }

    filePath = path.join("/tmp/uploads", req.file.filename);

    let rawText;
    try {
      rawText = await extractTextFromPdf(filePath);
    } catch (err) {
      console.error('PDF text extraction failed:', err);
      return res.status(422).json({
        error: 'Could not read text from this PDF.',
        detail: 'Please upload a text-based air ticket PDF. Scanned image PDFs may need OCR before uploading.',
      });
    }

    if (!rawText.trim()) {
      return res.status(422).json({
        error: 'Could not read text from this PDF.',
        detail: 'Please upload a text-based ticket PDF or try another file.',
      });
    }

    let mappedInvoice;
    let aiError;

    if (process.env.OPENROUTER_API_KEY) {
      try {
        const structured = await extractStructuredData(rawText);
        mappedInvoice = mapStructuredInvoice(structured);
      } catch (err) {
        aiError = err;
        console.warn('AI ticket extraction failed, using local parser:', err.message);
      }
    } else {
      console.warn('OPENROUTER_API_KEY is missing. Using local ticket parser only.');
    }

    if (!mappedInvoice) {
      mappedInvoice = parseTicketTextLocally(rawText);
    }

    if (!hasExtractedTicketData(mappedInvoice)) {
      return res.status(422).json({
        error: 'Could not extract ticket details from this PDF.',
        detail: aiError?.message || 'Please check that the uploaded file is a valid air ticket PDF.',
      });
    }

    res.json(mappedInvoice);
  } catch (err) {
    console.error('Ticket OCR processing failed:', err);
    res.status(422).json({
      error: 'Could not process this ticket PDF.',
      detail: err.message || 'Please check that the uploaded file is a valid air ticket PDF.',
    });
  } finally {
    if (filePath) {
      fs.unlink(filePath, () => {});
    }
  }
};

function mapStructuredInvoice(structured) {
  return {
    bookingReference: structured.bookingReference || '',
    passengerName: normalizePassengerNames(structured.passengerName),
    transactionId: structured.transactionId || '',
    flightDetails: (structured.flights || []).map(f => {
      const [depDate, depTime] = splitDateTime(f.departure);
      const [arrDate, arrTime] = splitDateTime(f.arrival);
      return {
        flightNumber: f.flightNumber || '',
        from: f.from || '',
        to: f.to || '',
        departureDate: depDate,
        departureTime: depTime,
        arrivalDate: arrDate,
        arrivalTime: arrTime,
        class: f.class || '',
        airline: f.airline || '',
        departureTerminal: f.terminal || '',
        status: f.status || '',
      };
    }),
  };
}

function parseTicketTextLocally(rawText) {
  const normalizedText = rawText.replace(/\r/g, '');
  const lines = normalizedText.split('\n').map(line => line.trim()).filter(Boolean);
  const bookingReference =
    matchFirst(normalizedText, [
      /BOOKING\s+REF(?:ERENCE)?\s*:?\s*([A-Z0-9]{5,10})/i,
      /BOOKING\s+REF\s*\n\s*([A-Z0-9]{5,10})/i,
      /PNR\s*:?\s*([A-Z0-9]{5,10})/i,
      /RECORD\s+LOCATOR\s*:?\s*([A-Z0-9]{5,10})/i,
    ]) || '';
  const transactionId =
    matchFirst(normalizedText, [
      /TICKET\s+(?:NUMBER|NO)\s*:?\s*(\d{10,14})/i,
      /TICKET\s+(?:NUMBER|NO)\s*\n\s*(\d{10,14})/i,
      /E[-\s]?TICKET\s*:?\s*(\d{10,14})/i,
      /\b(\d{3}[-\s]?\d{10})\b/,
    ])?.replace(/\D/g, '') || '';
  const passengerName = extractPassengerNames(normalizedText, lines);

  return {
    bookingReference,
    passengerName,
    transactionId,
    flightDetails: extractFlightDetails(normalizedText, lines),
  };
}

function extractPassengerNames(text, lines) {
  const names = [];
  const labeledName = matchFirst(text, [
    /PASSENGER(?:\s+NAME)?\s*:?\s*([A-Z][A-Z\s/.'-]+?)(?=\n|BOOKING|TICKET|FLIGHT|$)/i,
    /ITINERARY\s+PREPARED\s+FOR:\s*\n\s*([A-Z][A-Z\s/.'-]+?)(?=\n)/i,
  ]);

  if (labeledName) names.push(cleanPassengerName(labeledName));

  const slashNamePattern = /\b([A-Z]{2,}(?:\s+[A-Z]{2,})*\/[A-Z]{2,}(?:\s+[A-Z]{2,})*(?:\s+(?:MR|MRS|MS|MISS|MSTR))?)\b/g;
  let match;
  while ((match = slashNamePattern.exec(text)) !== null) {
    names.push(cleanPassengerName(match[1]));
  }

  if (!names.length) {
    const preparedIndex = lines.findIndex(line => /ITINERARY\s+PREPARED\s+FOR/i.test(line));
    const candidate = preparedIndex >= 0 ? lines[preparedIndex + 1] : '';
    if (candidate && /^[A-Z][A-Z\s/.'-]+$/.test(candidate)) {
      names.push(cleanPassengerName(candidate));
    }
  }

  return uniqueValues(names).filter(Boolean);
}

function extractFlightDetails(text, lines) {
  const flightDetails = [];
  const airlineCodes = 'G9|AA|AC|AF|AI|AY|AZ|BA|BR|CA|CX|DL|EK|EY|GA|JL|KE|KL|LH|LO|LX|MH|MS|NH|NZ|OS|PK|QF|QR|SA|SK|SQ|SU|TG|TK|UA|UL|VN|VS|WY|ZH';
  const flightNumberPattern = new RegExp(`\\b(${airlineCodes})\\s?(\\d{1,4}[A-Z]?)\\b`, 'g');
  let match;

  while ((match = flightNumberPattern.exec(text)) !== null) {
    const flightNumber = `${match[1]} ${match[2]}`;
    const contextStart = Math.max(0, match.index - 300);
    const contextEnd = Math.min(text.length, match.index + 500);
    const context = text.slice(contextStart, contextEnd);
    const route = extractRoute(context, lines);
    const dateTimes = extractDateTimes(context);

    flightDetails.push({
      flightNumber,
      airline: match[1],
      from: route.from,
      to: route.to,
      departureDate: dateTimes[0]?.date || '',
      departureTime: dateTimes[0]?.time || '',
      arrivalDate: dateTimes[1]?.date || dateTimes[0]?.date || '',
      arrivalTime: dateTimes[1]?.time || '',
      departureTerminal: matchFirst(context, [/TERMINAL\s*:?\s*([A-Z0-9]+)/i]) || '',
      class: matchFirst(context, [/\b(ECONOMY|PREMIUM ECONOMY|BUSINESS|FIRST)\b/i]) || '',
      status: matchFirst(context, [/\b(CONFIRMED|OK|HK|PENDING|CANCELLED)\b/i]) || '',
    });
  }

  return dedupeFlights(flightDetails).filter(flight =>
    flight.flightNumber || flight.from || flight.to || flight.departureDate || flight.departureTime
  );
}

function extractRoute(context, lines) {
  const cityCodeMatches = [...context.matchAll(/\b([A-Z]{3})\b/g)]
    .map(match => match[1])
    .filter(code => !['PDF', 'PNR', 'UTC', 'GMT', 'TKT', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].includes(code));

  const fromToMatch = context.match(/\bFROM\s+([A-Z]{3})\b[\s\S]{0,120}?\bTO\s+([A-Z]{3})\b/i);
  if (fromToMatch) {
    return { from: fromToMatch[1], to: fromToMatch[2] };
  }

  const routeLine = lines.find(line => /\b[A-Z]{3}\b.*\b[A-Z]{3}\b/.test(line));
  if (routeLine) {
    const routeCodes = [...routeLine.matchAll(/\b([A-Z]{3})\b/g)].map(match => match[1]);
    if (routeCodes.length >= 2) {
      return { from: routeCodes[0], to: routeCodes[1] };
    }
  }

  return {
    from: cityCodeMatches[0] || '',
    to: cityCodeMatches.find((code, index) => index > 0 && code !== cityCodeMatches[0]) || '',
  };
}

function extractDateTimes(context) {
  const dateTimePatterns = [
    /(\d{1,2}\s+[A-Z]{3}\s+\d{4})\s+(\d{1,2}:\d{2})/gi,
    /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s+(\d{1,2}:\d{2})/g,
  ];
  const results = [];

  for (const pattern of dateTimePatterns) {
    let match;
    while ((match = pattern.exec(context)) !== null) {
      if (match.length === 4) {
        results.push({ date: `${match[1]} ${new Date().getFullYear()}`, time: formatTime(match[2]) });
      } else {
        results.push({ date: match[1], time: formatTime(match[2]) });
      }
    }
  }

  const compactTimes = [...context.matchAll(/\b([01]\d|2[0-3])([0-5]\d)\b/g)].map(match => formatTime(match[0]));
  for (const time of compactTimes) {
    if (!results.some(result => result.time === time)) {
      results.push({ date: '', time });
    }
  }

  return results;
}

function matchFirst(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return '';
}

function cleanPassengerName(name) {
  return name
    .replace(/\s+/g, ' ')
    .replace(/\b(MR|MRS|MS|MISS|MSTR)\b$/i, '')
    .trim();
}

function normalizePassengerNames(passengerName) {
  if (Array.isArray(passengerName)) {
    return uniqueValues(passengerName.map(name =>
      typeof name === 'string' ? cleanPassengerName(name) : cleanPassengerName(name?.name || '')
    )).filter(Boolean);
  }

  return cleanPassengerName(passengerName || '') ? [cleanPassengerName(passengerName)] : [];
}

function hasExtractedTicketData(invoice) {
  return Boolean(
    invoice?.bookingReference ||
    invoice?.transactionId ||
    invoice?.passengerName?.length ||
    invoice?.flightDetails?.length
  );
}

function dedupeFlights(flights) {
  const seen = new Set();
  return flights.filter(flight => {
    const key = `${flight.flightNumber}-${flight.from}-${flight.to}-${flight.departureDate}-${flight.departureTime}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueValues(values) {
  return [...new Set(values.map(value => String(value || '').trim()).filter(Boolean))];
}

function formatTime(time) {
  return time?.replace(/^(\d{2})(\d{2})$/, '$1:$2') || '';
}

function splitDateTime(str) {
  if (!str || typeof str !== 'string') return ['', ''];
  const match = str.match(/(\d{1,2}\s\w{3}\s\d{4})\s+(\d{2}:\d{2})/);
  return match ? [match[1], match[2]] : ['', str];
}
