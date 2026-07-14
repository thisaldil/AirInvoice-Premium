import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  DownloadIcon,
  MailIcon,
  PhoneIcon,
  ArrowLeftIcon,
  CheckIcon,
  Loader2Icon,
  FileTextIcon,
} from "lucide-react";
import toast from 'react-hot-toast';

const selectInputBase =
  "p-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 hover:border-slate-300 dark:hover:border-slate-500";

function SendOptions({ invoice, onBack }) {
  const [invoiceData, setInvoiceData] = useState(null);
  const [sendMethod, setSendMethod] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [countryCodes, setCountryCodes] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axios.get(
          `https://air-invoice-server.vercel.app/invoice/getInvoiceDetailsByInvoiceId/${invoice.invoiceId}`
        );
        setInvoiceData(res.data);
      } catch (err) {
        console.error("Failed to load invoice preview", err);
      }
    };

    if (invoice?.invoiceId) {
      fetchInvoice();
    }
  }, [invoice?.invoiceId]);

  const handleSend = async () => {
    setIsSending(true);
    try {
      if (sendMethod === "email") {
        await axios.post("https://air-invoice-server.vercel.app/invoice/sendInvoiceEmail", {
          email,
          pdfUrl: invoiceData?.pdfUrl,
        });
      }
      if (sendMethod === "whatsapp") {
        const message = `Dear Customer,\n\nThis is ${invoice.template.company.name}. Please find your invoice below:\n\n${invoiceData?.pdfUrl}\n\nThank you for your business.`;
        const sanitizedPhone = `${selectedCode}${phone.replace(/\D/g, "")}`;
        const whatsappLink = `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(
          message
        )}`;
        window.open(whatsappLink, "_blank");
      }
      setIsSent(true);
      setTimeout(() => setIsSent(false), 3000);
      toast.success("Invoice sent successfully!");
    } catch (err) {
      toast.error("Failed to send invoice. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(invoiceData.pdfUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const isQuotation = invoiceData?.invoiceDetails.type === "quotation";
      const ref = invoiceData?.invoiceDetails.bookingReference;

      const baseName = isQuotation
        ? `${invoiceData._id}-Quotation`
        : `${ref}-Invoice`;

      const currentDate = new Date().toISOString().split("T")[0];
      const fileName = `${baseName}-${currentDate}.pdf`;

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const fetchCountryCodes = async () => {
      try {
        const res = await axios.get("https://restcountries.com/v3.1/all?fields=name,idd");
        const data = res.data;

        const codes = data
          .map((country) => ({
            name: country.name.common,
            code:
              country.idd?.root && country.idd?.suffixes
                ? `${country.idd.root}${country.idd.suffixes[0]}`
                : null,
          }))
          .filter((c) => c.code);

        const sortedCodes = codes.sort((a, b) => a.name.localeCompare(b.name));
        setCountryCodes(sortedCodes);

        const sriLanka = sortedCodes.find((c) => c.code === "+94");
        if (sriLanka) {
          setSelectedCode(sriLanka.code);
        }
      } catch (error) {
        console.error("Error fetching country codes:", error);
      }
    };

    fetchCountryCodes();
  }, []);

  const isSendDisabled =
    !sendMethod ||
    (sendMethod === "email" && !email) ||
    (sendMethod === "whatsapp" && !phone) ||
    isSending;

  return (
    <div className="max-w-6xl mx-auto">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide-up { animation: fadeSlideUp 0.35s ease-out both; }
      `}</style>

      <div className="mb-7">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Send {invoiceData?.invoiceDetails.type === "quotation" ? 'Quotation' : 'Invoice'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1.5">
          Your {invoiceData?.invoiceDetails.type === "quotation" ? 'quotation' : 'invoice'} is ready!
          Preview it below and choose how you'd like to send it.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
        {/* Preview */}
        <div className="md:w-1/2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h2 className="font-semibold text-sm text-slate-800 dark:text-white">
              {invoiceData?.invoiceDetails.type === "quotation" ? 'Quotation' : 'Invoice'} Preview
            </h2>
            {invoiceData?.pdfUrl && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                ) : (
                  <DownloadIcon className="w-4 h-4" />
                )}
                {isDownloading ? "Downloading..." : "Download"}
              </button>
            )}
          </div>
          <div className="p-4 flex justify-center">
            {invoiceData?.pdfUrl ? (
              <iframe
                src={invoiceData.pdfUrl}
                title="PDF Preview"
                width="100%"
                height="500px"
                className="border border-slate-200 dark:border-slate-600 rounded-xl"
              />
            ) : (
              <div className="w-full h-[500px] flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/40 rounded-xl">
                <FileTextIcon className="w-8 h-8 animate-pulse" />
                <p className="text-sm">Loading preview...</p>
              </div>
            )}
          </div>
        </div>

        {/* Send options */}
        <div className="md:w-1/2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-sm text-slate-800 dark:text-white">
              Send Options
            </h2>
          </div>
          <div className="p-5 md:p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">
                  How would you like to send this?
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setSendMethod("email")}
                    className={`flex items-center w-full p-3.5 border rounded-xl text-left transition-all duration-200 ${
                      sendMethod === "email"
                        ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm"
                        : "border-slate-200 dark:border-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl mr-4 transition-colors duration-200 ${
                        sendMethod === "email"
                          ? "bg-indigo-100 dark:bg-indigo-500/20"
                          : "bg-slate-100 dark:bg-slate-700"
                      }`}
                    >
                      <MailIcon
                        className={`w-5 h-5 ${
                          sendMethod === "email"
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-slate-800 dark:text-white">
                        Send via Email
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Send directly to your client's email address
                      </p>
                    </div>
                    {sendMethod === "email" && (
                      <CheckIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    )}
                  </button>

                  <button
                    onClick={() => setSendMethod("whatsapp")}
                    className={`flex items-center w-full p-3.5 border rounded-xl text-left transition-all duration-200 ${
                      sendMethod === "whatsapp"
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm"
                        : "border-slate-200 dark:border-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl mr-4 transition-colors duration-200 ${
                        sendMethod === "whatsapp"
                          ? "bg-emerald-100 dark:bg-emerald-500/20"
                          : "bg-slate-100 dark:bg-slate-700"
                      }`}
                    >
                      <PhoneIcon
                        className={`w-5 h-5 ${
                          sendMethod === "whatsapp"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-slate-800 dark:text-white">
                        Send via WhatsApp
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Send through WhatsApp to your client's phone number
                      </p>
                    </div>
                    {sendMethod === "whatsapp" && (
                      <CheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              {sendMethod === "email" && (
                <div className="animate-fade-slide-up">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@example.com"
                    className={`w-full ${selectInputBase}`}
                  />
                </div>
              )}

              {sendMethod === "whatsapp" && (
                <div className="animate-fade-slide-up">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                    Recipient Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedCode}
                      onChange={(e) => setSelectedCode(e.target.value)}
                      className={`w-2/5 sm:w-1/3 ${selectInputBase} appearance-none`}
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.name})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="712345678"
                      className={`w-3/5 sm:w-2/3 ${selectInputBase}`}
                    />
                  </div>
                </div>
              )}

              {isSent && (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-500/20 p-3.5 rounded-xl flex items-center gap-2 animate-fade-slide-up">
                  <CheckIcon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">Invoice sent successfully!</span>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  onClick={onBack}
                  className="flex items-center px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all duration-200"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back
                </button>
                <button
                  onClick={handleSend}
                  disabled={isSendDisabled}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isSendDisabled
                      ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                      : "bg-indigo-600 text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-300/50 active:scale-[0.98]"
                  }`}
                >
                  {isSending && <Loader2Icon className="w-4 h-4 animate-spin" />}
                  {isSending ? "Sending..." : "Send Invoice"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SendOptions;