import React, { useEffect, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, TrashIcon, PlaneIcon, UserIcon, AlertCircleIcon, InboxIcon } from "lucide-react";

const inputBase =
  "w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 hover:border-slate-300 dark:hover:border-slate-500 read-only:bg-slate-50 dark:read-only:bg-slate-900/40 read-only:cursor-default";

const labelBase = "block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5";

function InvoicePreview({ invoice = {}, onContinue, onBack, onEdit }) {
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Fetch countries
    fetch("https://restcountries.com/v3.1/all?fields=name")
      .then((res) => res.json())
      .then((data) => {
        const countryList = data.map((c) => c.name.common).sort();
        setCountries(countryList);
      });

    // Fetch currencies and exchange rates
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => {
        if (data.result === "success") {
          setExchangeRates(data.rates);
          // Create currency list from rates
          const currencyList = Object.keys(data.rates).sort();
          setCurrencies(currencyList);
        }
      });
  }, []);

  useEffect(() => {
    // Check if all required fields have values
    const allPassengersValid =
      Array.isArray(invoice.passengerName) &&
      invoice.passengerName.length > 0 &&
      invoice.passengers &&
      invoice.passengers.length === invoice.passengerName.length &&
      invoice.passengers.every(
        (p) =>
          p.passportNumber?.trim() &&
          p.nationality?.trim() &&
          p.dob?.trim() &&
          p.gender?.trim()
      );

    const hasRequiredFields =
      allPassengersValid &&
      invoice.currency?.trim() &&
      invoice.paymentMethod?.trim() &&
      invoice.totalAmount?.toString().trim() &&
      !isNaN(invoice.totalAmount) &&
      parseFloat(invoice.totalAmount) > 0;

    // Check if we have flight details
    const hasFlightDetails =
      Array.isArray(invoice.flightDetails) && invoice.flightDetails.length > 0;

    // Set valid if both conditions are met
    setIsValid(hasRequiredFields && hasFlightDetails);
  }, [invoice]);

  const handleFieldEdit = (field, value) => {
    if (onEdit) {
      onEdit(field, value);
    }
  };

  const handleAmountChange = (value) => {
    // Validate that the value is a number and greater than 0
    if (value === "" || (!isNaN(value) && parseFloat(value) > 0)) {
      handleFieldEdit("totalAmount", value);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide-up { animation: fadeSlideUp 0.4s ease-out both; }
      `}</style>

      <div className="mb-7">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Review Extracted Data
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1.5">
          We've extracted the following information from the air ticket invoice.
          Please review and make any necessary corrections.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 md:p-7 mb-8">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">
          Ticket Information
        </h2>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label="Booking Reference"
              value={invoice.bookingReference}
              readOnly
            />
            <Field
              label="Ticket Number"
              value={invoice.transactionId || ""}
              placeholder="e.g., 1234567890"
              onEdit={(val) => handleFieldEdit("transactionId", val)}
            />
          </div>

          {/* Passengers */}
          {Array.isArray(invoice.passengerName) &&
            invoice.passengerName.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                    <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">Passengers</h3>
                </div>

                <div className="space-y-4">
                  {invoice.passengerName.map((name, idx) => (
                    <div
                      key={idx}
                      className="relative border border-slate-200 dark:border-slate-600 p-4 md:p-5 space-y-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 animate-fade-slide-up"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-2.5 py-1 rounded-full">
                          Passenger {idx + 1}
                        </span>
                        <button
                          onClick={() => {
                            const updated = [...invoice.passengerName];
                            updated.splice(idx, 1);
                            handleFieldEdit("passengerName", updated);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-all duration-200"
                          title="Remove Passenger"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field
                          label={`Passenger Name`}
                          value={name}
                          placeholder="e.g., John Doe"
                          onEdit={(val) => {
                            const updated = [...invoice.passengerName];
                            updated[idx] = val;
                            handleFieldEdit("passengerName", updated);
                          }}
                        />

                        <Field
                          label="Passport Number"
                          value={
                            invoice.passengers?.[idx]?.passportNumber || ""
                          }
                          required
                          placeholder="e.g., N1234567"
                          onEdit={(val) => {
                            const updated = [...(invoice.passengers || [])];
                            updated[idx] = {
                              ...updated[idx],
                              passportNumber: val,
                            };
                            handleFieldEdit("passengers", updated);
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={labelBase}>
                            Nationality <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={invoice.passengers?.[idx]?.nationality || ""}
                            onChange={(e) => {
                              const updated = [...(invoice.passengers || [])];
                              updated[idx] = {
                                ...updated[idx],
                                nationality: e.target.value,
                              };
                              handleFieldEdit("passengers", updated);
                            }}
                            className={`${inputBase} appearance-none`}
                            required
                          >
                            <option value="">Select Country</option>
                            {countries.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={labelBase}>
                            Date of Birth <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            max={new Date().toISOString().split("T")[0]}
                            value={invoice.passengers?.[idx]?.dob || ""}
                            onChange={(e) => {
                              const updated = [...(invoice.passengers || [])];
                              updated[idx] = {
                                ...updated[idx],
                                dob: e.target.value,
                              };
                              handleFieldEdit("passengers", updated);
                            }}
                            className={inputBase}
                            required
                          />
                        </div>

                        <div>
                          <label className={labelBase}>
                            Gender <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={invoice.passengers?.[idx]?.gender || ""}
                            onChange={(e) => {
                              const updated = [...(invoice.passengers || [])];
                              updated[idx] = {
                                ...updated[idx],
                                gender: e.target.value,
                              };
                              handleFieldEdit("passengers", updated);
                            }}
                            className={`${inputBase} appearance-none`}
                            required
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Flight details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10">
                <PlaneIcon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white">Flight Details</h3>
            </div>

            {invoice?.flightDetails?.length > 0 ? (
              <div className="space-y-3">
                {invoice.flightDetails.map((flight, index) => (
                  <div
                    key={index}
                    className="bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-600 p-4 md:p-5 rounded-2xl"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-slate-800 dark:text-white">
                        {flight.flightNumber || `Flight #${index + 1}`}
                      </h4>
                      {flight.class && (
                        <span className="text-xs font-medium text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 px-2.5 py-1 rounded-full">
                          {flight.class}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">
                          From
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {flight.from}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {flight.departureDate} at {flight.departureTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">
                          To
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {flight.to}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {flight.arrivalDate} at {flight.arrivalTime}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                      Airline: {flight.airline || "-"} &nbsp;|&nbsp; Terminal:{" "}
                      {flight.departureTerminal || "-"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10 border border-dashed border-slate-200 dark:border-slate-600 rounded-2xl">
                <InboxIcon className="w-6 h-6 text-slate-300 dark:text-slate-500 mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No flight details available.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelBase}>
                  Currency <span className="text-rose-500">*</span>
                </label>
                <select
                  value={invoice.currency || ""}
                  onChange={(e) => handleFieldEdit("currency", e.target.value)}
                  className={`${inputBase} appearance-none`}
                  required
                >
                  <option value="">Select Currency</option>
                  {currencies.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelBase}>
                  Payment Method <span className="text-rose-500">*</span>
                </label>
                <select
                  value={invoice.paymentMethod || ""}
                  onChange={(e) =>
                    handleFieldEdit("paymentMethod", e.target.value)
                  }
                  className={`${inputBase} appearance-none`}
                  required
                >
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelBase}>
                Total Amount <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-semibold text-sm">
                  {invoice.currency}
                </span>
                <input
                  type="text"
                  value={invoice.totalAmount || ""}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="e.g., 45000.00"
                  className={inputBase}
                  required
                />
              </div>
              {invoice.totalAmount &&
                (isNaN(invoice.totalAmount) ||
                  parseFloat(invoice.totalAmount) <= 0) && (
                  <p className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-sm mt-2">
                    <AlertCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    Amount must be a number greater than 0
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all duration-200"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </button>
        <button
          onClick={onContinue}
          disabled={!isValid}
          className={`flex items-center px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
            isValid
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-300/50 active:scale-[0.98]"
              : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
          }`}
        >
          Continue
          <ArrowRightIcon className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}

const Field = ({ label, value, onEdit, readOnly, placeholder, required }) => (
  <div>
    <label className={labelBase}>
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onEdit?.(e.target.value)}
      readOnly={readOnly}
      required={required}
      placeholder={placeholder}
      className={inputBase}
    />
  </div>
);

export default InvoicePreview;