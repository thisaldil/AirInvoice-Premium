import React, { useState, useMemo, useCallback } from "react";
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon, TrashIcon } from "lucide-react";
import AsyncSelect from "react-select/async";
import debounce from "lodash.debounce";
import airports from '../../data/airports.json'
import airlines from '../../data/airlines.json'

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
    <div className="text-gray-800 dark:text-white">
      <h1 className="text-3xl font-bold mb-6 sm:text-left text-center">Create a Quotation</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 space-y-6">
        {/* Passenger Info */}
        <div>
          <label className="block text-sm font-medium mb-1">Passenger Name</label>
          <input
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
            placeholder="e.g., Some One"
            required
            value={invoice.passengerName}
            onChange={(e) => updateInvoiceField("passengerName", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
              placeholder="e.g., someone@gmail.com"
              required
              value={invoice.email}
              onChange={(e) => updateInvoiceField("email", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
              placeholder="e.g., +94xxxxxxxxx"
              required
              value={invoice.phone}
              onChange={(e) => updateInvoiceField("phone", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
            placeholder="e.g., No123 Colombo, Sri Lanka"
            value={invoice.address}
            onChange={(e) => updateInvoiceField("address", e.target.value)}
          />
        </div>

        {/* Flight Details */}
        <div className="space-y-4">
          <h2 className="font-semibold">Flight Details</h2>
          {invoice.flightDetails.map((flight, idx) => (
            <div
              key={idx}
              className="border border-gray-200 dark:border-gray-700 p-4 rounded-md bg-gray-50 dark:bg-gray-900 space-y-4"
            >
              {invoice.flightDetails.length > 1 && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveFlight(idx)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Origin</label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={loadAirportOptions}
                    onChange={(s) => handleFlightFieldChange(idx, "origin", s)}
                    value={selectValue(flight.origin)}
                    placeholder="Search airport..."
                    isClearable
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Destination</label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={loadAirportOptions}
                    onChange={(s) => handleFlightFieldChange(idx, "destination", s)}
                    value={selectValue(flight.destination)}
                    placeholder="Search airport..."
                    isClearable
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Airline</label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={loadAirlineOptions}
                    onChange={(s) => handleFlightFieldChange(idx, "airline", s?.label || "")}
                    value={selectAirline(flight.airline)}
                    placeholder="Search airline..."
                    isClearable
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Flight Number</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                    placeholder="e.g., G xxx"
                    value={flight.flightNumber}
                    onChange={(e) => handleFlightFieldChange(idx, "flightNumber", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Class</label>
                  <select
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
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
                  <label className="block text-sm font-medium mb-1">Terminal</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                    placeholder="e.g., Main T"
                    value={flight.terminal}
                    onChange={(e) => handleFlightFieldChange(idx, "terminal", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Departure Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                    value={flight.departureDate}
                    onChange={(e) => handleFlightFieldChange(idx, "departureDate", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Departure Time</label>
                  <input
                    type="time"
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                    value={flight.departureTime}
                    onChange={(e) => handleFlightFieldChange(idx, "departureTime", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Arrival Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                    value={flight.arrivalDate}
                    onChange={(e) => handleFlightFieldChange(idx, "arrivalDate", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Arrival Time</label>
                  <input
                    type="time"
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                    value={flight.arrivalTime}
                    onChange={(e) => handleFlightFieldChange(idx, "arrivalTime", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Baggage Allowance</label>
                  <input
                    type="text"
                    placeholder="e.g., 30KG"
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                    value={flight.baggage}
                    onChange={(e) => handleFlightFieldChange(idx, "baggage", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Meals</label>
                  <input
                    type="text"
                    placeholder="e.g., Veg/Non-Veg/None"
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                    value={flight.meals}
                    onChange={(e) => handleFlightFieldChange(idx, "meals", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Additional Details</label>
                <textarea
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
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
            className="flex items-center text-sm text-blue-600 dark:text-blue-400"
            onClick={handleAddFlight}
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Add Flight
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Total Amount</label>
          <input
            type="text"
            placeholder="e.g., 45000.00"
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
            required
            value={invoice.totalAmount}
            onChange={(e) => updateInvoiceField("totalAmount", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
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
          className="flex items-center px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Submit
          <ArrowRightIcon className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default Quotation;