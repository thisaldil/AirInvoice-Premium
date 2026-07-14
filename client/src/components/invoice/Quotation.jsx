import React, { useState, useMemo, useCallback } from "react";
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon, TrashIcon, PlaneIcon, UserIcon } from "lucide-react";
import AsyncSelect from "react-select/async";
import debounce from "lodash.debounce";
import airports from '../../data/airports.json'
import airlines from '../../data/airlines.json'

// Visual-only overrides for react-select so it matches the rest of the form.
// No behavior, props, or handlers are changed — only colors/spacing/radius.
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "42px",
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#6366f1" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
    backgroundColor: "transparent",
    "&:hover": { borderColor: "#a5b4fc" },
    transition: "all 150ms ease",
  }),
  placeholder: (base) => ({ ...base, color: "#94a3b8", fontSize: "0.875rem" }),
  singleValue: (base) => ({ ...base, fontSize: "0.875rem" }),
  input: (base) => ({ ...base, fontSize: "0.875rem" }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.75rem",
    overflow: "hidden",
    boxShadow: "0 10px 30px -5px rgba(15,23,42,0.15)",
    border: "1px solid #f1f5f9",
    zIndex: 20,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.875rem",
    backgroundColor: state.isSelected
      ? "#4f46e5"
      : state.isFocused
        ? "#eef2ff"
        : "transparent",
    color: state.isSelected ? "#fff" : "#1e293b",
    cursor: "pointer",
  }),
};

const inputBase =
  "w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 hover:border-slate-300 dark:hover:border-slate-500";

const labelBase = "block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5";

const Quotation = ({ onBack, onSubmit }) => {
  const [invoice, setInvoice] = useState({
    type: "quotation",
    passengerName: "",
    email: "",
    phone: "",
    address: "",
    flightDetails: [
      {
        flightNumber: "",
        airline: "",
        class: "",
        origin: "",
        destination: "",
        departureDate: "",
        departureTime: "",
        arrivalDate: "",
        arrivalTime: "",
        terminal: "",
        baggage: "",
        meals: "",
        notes: "",
      },
    ],
    totalAmount: "",
  });

  const updateInvoiceField = (field, value) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  };

  const handleFlightFieldChange = (idx, field, value) => {
    console.log(`[Flight ${idx}] Updating field "${field}" with:`, value);
    const updated = [...invoice.flightDetails];
    updated[idx] = { ...updated[idx], [field]: value };
    updateInvoiceField("flightDetails", updated);
  };

  const handleAddFlight = () => {
    updateInvoiceField("flightDetails", [
      ...invoice.flightDetails,
      {
        flightNumber: "",
        airline: "",
        class: "",
        origin: "",
        destination: "",
        departureDate: "",
        departureTime: "",
        arrivalDate: "",
        arrivalTime: "",
        terminal: "",
        baggage: "",
        meals: "",
        notes: "",
      },
    ]);
  };

  const fetchAirports = (query) => {
    if (!query || query.length < 2) {
      return [];
    }
    return Object.values(airports)
      .filter((a) =>
        `${a.iata} ${a.name} ${a.city}`.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 100)
      .map((a) => ({ label: `${a.name}, ${a.city} (${a.iata})`, value: a.iata }));
  };

  const fetchAirlines = (query) => {
    return airlines
      .filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))
      .map((a) => ({ label: a.name, value: a.id }));
  };

  const loadAirportOptions = useMemo(() =>
    debounce((inputValue, callback) => {
      callback(fetchAirports(inputValue));
    }, 300),
    []);

  const loadAirlineOptions = useCallback((inputValue, callback) => {
    const timeout = setTimeout(() => {
      const results = fetchAirlines(inputValue);
      callback(results);
    }, 200);
    return () => clearTimeout(timeout);
  }, []);

  const selectValue = (val) => (val ? val : null);
  const selectAirline = (val) => (val ? { label: val, value: val } : null);

  const handleRemoveFlight = (idx) => {
    if (invoice.flightDetails.length === 1) return;
    const updated = invoice.flightDetails.filter((_, i) => i !== idx);
    updateInvoiceField("flightDetails", updated);
  };

  const combineFlightTimestamps = (flights) => {
    return flights.map(f => ({
      ...f,
      from: f.origin?.value || "",
      to: f.destination?.value || "",
      departureTime: f.departureDate && f.departureTime
        ? `${f.departureDate}T${f.departureTime}`
        : "",
      arrivalTime: f.arrivalDate && f.arrivalTime
        ? `${f.arrivalDate}T${f.arrivalTime}`
        : "",
      departureTerminal: f.terminal || "",
    }));
  };

  return (
    <div className="text-slate-800 dark:text-white max-w-5xl mx-auto">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide-up { animation: fadeSlideUp 0.4s ease-out both; }
      `}</style>

      <div className="mb-7 text-center sm:text-left">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Create a Quotation</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Fill in passenger and flight details to generate a quotation.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 md:p-7 mb-8 space-y-8">
        {/* Passenger Info */}
        <div className="space-y-5" data-tour="quotation-customer-details">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
              <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="font-semibold text-slate-800 dark:text-white">Passenger Details</h2>
          </div>

          <div>
            <label className={labelBase}>Passenger Name</label>
            <input
              className={inputBase}
              placeholder="e.g., Some One"
              required
              value={invoice.passengerName}
              onChange={(e) => updateInvoiceField("passengerName", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelBase}>Email</label>
              <input
                className={inputBase}
                placeholder="e.g., someone@gmail.com"
                required
                value={invoice.email}
                onChange={(e) => updateInvoiceField("email", e.target.value)}
              />
            </div>
            <div>
              <label className={labelBase}>Phone</label>
              <input
                className={inputBase}
                placeholder="e.g., +94xxxxxxxxx"
                required
                value={invoice.phone}
                onChange={(e) => updateInvoiceField("phone", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelBase}>Address</label>
            <input
              className={inputBase}
              placeholder="e.g., No123 Colombo, Sri Lanka"
              value={invoice.address}
              onChange={(e) => updateInvoiceField("address", e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700" />

        {/* Flight Details */}
        <div className="space-y-4" data-tour="quotation-flight-details">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10">
              <PlaneIcon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <h2 className="font-semibold text-slate-800 dark:text-white">Flight Details</h2>
          </div>

          {invoice.flightDetails.map((flight, idx) => (
            <div
              key={idx}
              className="relative border border-slate-200 dark:border-slate-600 p-4 md:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 space-y-5 animate-fade-slide-up"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-2.5 py-1 rounded-full">
                  Flight {idx + 1}
                </span>
                {invoice.flightDetails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFlight(idx)}
                    title="Remove flight"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-all duration-200"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelBase}>Origin</label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={loadAirportOptions}
                    onChange={(s) => handleFlightFieldChange(idx, "origin", s)}
                    value={selectValue(flight.origin)}
                    placeholder="Search airport..."
                    isClearable
                    styles={selectStyles}
                  />
                </div>
                <div>
                  <label className={labelBase}>Destination</label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={loadAirportOptions}
                    onChange={(s) => handleFlightFieldChange(idx, "destination", s)}
                    value={selectValue(flight.destination)}
                    placeholder="Search airport..."
                    isClearable
                    styles={selectStyles}
                  />
                </div>
                <div>
                  <label className={labelBase}>Airline</label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={loadAirlineOptions}
                    onChange={(s) => handleFlightFieldChange(idx, "airline", s?.label || "")}
                    value={selectAirline(flight.airline)}
                    placeholder="Search airline..."
                    isClearable
                    styles={selectStyles}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelBase}>Flight Number</label>
                  <input
                    type="text"
                    className={inputBase}
                    placeholder="e.g., G xxx"
                    value={flight.flightNumber}
                    onChange={(e) => handleFlightFieldChange(idx, "flightNumber", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelBase}>Class</label>
                  <select
                    className={`${inputBase} appearance-none`}
                    value={flight.class}
                    onChange={(e) => handleFlightFieldChange(idx, "class", e.target.value)}
                  >
                    <option value="">Select Class</option>
                    <option value="Economy">Economy</option>
                    <option value="Business">Business</option>
                    <option value="First Class">First Class</option>
                  </select>
                </div>
                <div>
                  <label className={labelBase}>Terminal</label>
                  <input
                    type="text"
                    className={inputBase}
                    placeholder="e.g., Main T"
                    value={flight.terminal}
                    onChange={(e) => handleFlightFieldChange(idx, "terminal", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelBase}>Departure Date</label>
                  <input
                    type="date"
                    className={inputBase}
                    value={flight.departureDate}
                    onChange={(e) => handleFlightFieldChange(idx, "departureDate", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelBase}>Departure Time</label>
                  <input
                    type="time"
                    className={inputBase}
                    value={flight.departureTime}
                    onChange={(e) => handleFlightFieldChange(idx, "departureTime", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelBase}>Arrival Date</label>
                  <input
                    type="date"
                    className={inputBase}
                    value={flight.arrivalDate}
                    onChange={(e) => handleFlightFieldChange(idx, "arrivalDate", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelBase}>Arrival Time</label>
                  <input
                    type="time"
                    className={inputBase}
                    value={flight.arrivalTime}
                    onChange={(e) => handleFlightFieldChange(idx, "arrivalTime", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelBase}>Baggage Allowance</label>
                  <input
                    type="text"
                    placeholder="e.g., 30KG"
                    className={inputBase}
                    value={flight.baggage}
                    onChange={(e) => handleFlightFieldChange(idx, "baggage", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelBase}>Meals</label>
                  <input
                    type="text"
                    placeholder="e.g., Veg/Non-Veg/None"
                    className={inputBase}
                    value={flight.meals}
                    onChange={(e) => handleFlightFieldChange(idx, "meals", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={labelBase}>Additional Details</label>
                <textarea
                  className={`${inputBase} resize-none`}
                  rows={3}
                  value={flight.notes}
                  placeholder="e.g., Layovers, Delaying times & etc..."
                  onChange={(e) => handleFlightFieldChange(idx, "notes", e.target.value)}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            className="flex items-center justify-center gap-1.5 w-full text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-dashed border-indigo-300 dark:border-indigo-500/40 rounded-xl py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-400 transition-all duration-200"
            onClick={handleAddFlight}
          >
            <PlusIcon className="w-4 h-4" />
            Add Flight
          </button>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700" />

        <div>
          <label className={labelBase}>Total Amount</label>
          <input
            type="text"
            placeholder="e.g., 45000.00"
            className={inputBase}
            required
            value={invoice.totalAmount}
            onChange={(e) => updateInvoiceField("totalAmount", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between" data-tour="quotation-submit-area">
        <button
          onClick={onBack}
          className="flex items-center px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all duration-200"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </button>
        <button
          onClick={() => {
            const updatedInvoice = {
              ...invoice,
              flightDetails: combineFlightTimestamps(invoice.flightDetails),
            };
            onSubmit(updatedInvoice);
          }}
          className="flex items-center px-6 py-2.5 text-sm font-medium rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-300/50 active:scale-[0.98] transition-all duration-200"
        >
          Submit
          <ArrowRightIcon className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default Quotation;