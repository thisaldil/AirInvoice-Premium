const fs = require('fs');
const pdfParse = require('pdf-parse');
const axios = require('axios');
require('dotenv').config();
const validateInvoiceSchema = require('../utils/invoiceValidator');

async function extractTextFromPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
}

function safeParseJSON(text) {
  try {
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();

    // Extract only the JSON object portion
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) throw new Error('No JSON braces found');

    const jsonString = cleaned.substring(firstBrace, lastBrace + 1);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse structured data:", error);
    throw new Error("Invalid JSON format returned from model");
  }
}


async function extractStructuredData(text) {
  const prompt = `
Extract this flight ticket text into **strict valid JSON**. 
Only return the JSON object, no explanation, no markdown, no comments. 
Format:
{
  "bookingReference": "...",
  "passengerName": ["..."],
  "transactionId": "...",
  "flights": [
    {
      "flightNumber": "...",
      "from": "...",
      "to": "...",
      "departure": "...",
      "arrival": "...",
      "status": "...",
      "terminal": "...",
      "airline": "...",
      "class": "..."
    }
  ]
}

TEXT:
${text}
`;

  let response;

  try {
    response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are a strict extractor that returns only valid JSON with no extra text.',
          },
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
  } catch (error) {
    const upstreamMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'OpenRouter extraction request failed';
    throw new Error(upstreamMessage);
  }

  const content = response.data?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenRouter returned an empty extraction response");
  }

  const parsed = safeParseJSON(content);

  if (!parsed.bookingReference || !parsed.passengerName || !parsed.flights) {
    throw new Error("Parsed data missing required fields");
  }

  return validateInvoiceSchema(parsed);
}

module.exports = { extractTextFromPdf, extractStructuredData };
