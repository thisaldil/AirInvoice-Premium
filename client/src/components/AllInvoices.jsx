import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { SearchIcon, TrashIcon, TriangleAlertIcon } from "lucide-react";
import toast from 'react-hot-toast';

const AllInvoices = ({ setGeneratedInvoice }) => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [duplicateRefs, setDuplicateRefs] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [category, setCategory] = useState(() => {
    return localStorage.getItem("invoiceCategory") || "invoice";
  });

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get(
          `https://air-invoice-server.vercel.app/invoice/getAllInvoices`
        );
        const sortedInvoices = res.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setInvoices(sortedInvoices);
        setFilteredInvoices(sortedInvoices);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load invoices:", err);
      }
      finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [userId]);

  useEffect(() => {
    const bookingRefCounts = {};
    invoices.forEach((inv) => {
      const ref = inv.invoiceDetails?.bookingReference;
      if (ref) {
        bookingRefCounts[ref] = (bookingRefCounts[ref] || 0) + 1;
      }
    });
    setDuplicateRefs(new Set(Object.keys(bookingRefCounts).filter(ref => bookingRefCounts[ref] > 1)));
  }, [invoices]);

  useEffect(() => {
    const term = search.toLowerCase();

    const filtered = invoices.filter((inv) => {
      const typeMatch = inv?.invoiceDetails?.type === category;

      const names = inv?.invoiceDetails?.passengerName || [];
      const passport = inv?.invoiceDetails?.passengers?.map(p => p.passportNumber) || [];

      const nameMatch = Array.isArray(names)
        ? names.some((name) => name.toLowerCase().includes(term))
        : names?.toLowerCase().includes(term);

      const passportMatch = Array.isArray(passport)
        ? passport.some((p) => p.toLowerCase().includes(term))
        : passport?.toLowerCase().includes(term);

      return typeMatch && (term === "" || nameMatch || passportMatch);
    });

    setFilteredInvoices(filtered);
    setCurrentPage(1);
  }, [search, invoices, category]);


  const handleClick = (invoice) => {
    if (!invoice) return;

    setGeneratedInvoice({
      template: {
        _id: invoice.template?._id,
        company: {
          name: invoice.template?.company?.name,
          logo: invoice.template?.company?.logo,
          address: invoice.template?.company?.address,
        },
      },
      invoiceId: invoice._id,
      invoiceDetails: {
        ...invoice.invoiceDetails,
        ...invoice.priceDetails,
        pdfUrl: invoice.pdfUrl,
      },
    });

    navigate(`/dashboard/send`);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await axios.delete(
          `https://air-invoice-server.vercel.app/invoice/deleteInvoice/${invoiceId}`
        );
        setInvoices((prev) =>
          prev.filter((invoice) => invoice._id !== invoiceId)
        );
        toast.success("Invoice deleted.");
      } catch (err) {
        console.error("Failed to delete invoice:", err);
        toast.error("Failed to delete invoice. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-white">
          All {category === "quotation" ? "Quotations" : "Invoices"}
        </h1>

        <div className="flex justify-between items-center mb-6">
          <div className="w-full max-w-md h-10 bg-gray-200 dark:bg-gray-700 rounded-md" />
          <div className="w-32 max-w-md h-8 bg-gray-200 dark:bg-gray-700 rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-md p-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-10 w-24 bg-gray-300 dark:bg-gray-600 rounded-md" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-white sm:text-left text-center">
        All {category === "quotation" ? "Quotations" : "Invoices"}
      </h1>

      <div className="mb-6 flex items-center sm:justify-between justify-center flex-wrap gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by name or passport no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md pl-10 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
        <div className="flex border rounded-md overflow-hidden shadow-sm transition-all bg-gray-100 dark:bg-gray-700">
          {["invoice", "quotation"].map((type) => (
            <button
              key={type}
              onClick={() => {
                setCategory(type);
                localStorage.setItem("invoiceCategory", type);
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-300 ${category === type
                ? "bg-blue-600 text-white border border-blue-400"
                : "bg-gray-100 hover:bg-blue-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
            >
              {type === "invoice" ? "Invoices" : "Quotations"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedInvoices.map((invoice) => (
          <div
            key={invoice._id}
            onClick={() => handleClick(invoice)}
            className="relative h-64 overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:border-blue-500 hover:shadow-lg transition"
          >
            <div className="p-2 px-4 flex items-center border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-row justify-between items-center w-full">
                {invoice.template?.company?.logo ? (
                  <img
                    src={invoice.template.company.logo}
                    alt="logo"
                    className="w-16 h-16 mr-3 object-contain"
                  />
                ) : (
                  <div className="w-10 h-10 mr-3 bg-gray-200 dark:bg-gray-600 rounded" />
                )}

                <div className="flex flex-row justify-end space-x-4 items-center w-full">
                  <span className="text-sm text-gray-500 dark:text-white">
                    {new Date(invoice.date).toISOString().split("T")[0]}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteInvoice(invoice._id);
                    }}
                    className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 text-sm text-gray-500 space-y-1 min-h-48 dark:text-white">
              <div className="mb-2 border-b justify-between items-center w-full dark:text-white">
                <p>{category === "quotation" ? "Quotation" : "Invoice"} ID: {invoice._id}</p>
              </div>
              <div className="space-y-1">
                {Array.isArray(invoice.invoiceDetails.passengerName) ? (
                  invoice.invoiceDetails.passengerName.map((name, idx) => (
                    <div key={idx}>
                      <p className="font-semibold text-gray-800 dark:text-white">{name}</p>
                      {category !== 'quotation' && (
                        <p className="text-gray-500 mb-2 dark:text-white">
                          <strong>Passport No:</strong>{" "}
                          {invoice.invoiceDetails.passengers?.[idx]?.passportNumber || "--"}
                        </p>
                      )}
                      {idx < invoice.invoiceDetails.passengerName.length - 1 && <hr />}
                    </div>
                  ))
                ) : (
                  <>
                    <p className="font-semibold text-gray-800 dark:text-white">{invoice.invoiceDetails.passengerName}</p>
                    {category !== 'quotation' && (
                      <p className="text-gray-500 dark:text-white">
                        <strong>Passport No:</strong>{" "}
                        {invoice.invoiceDetails.passportNumber || "--"}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none" />
            {duplicateRefs.has(invoice.invoiceDetails?.bookingReference) && (
              <div className="absolute bottom-2 right-2 bg-yellow-100 border border-yellow-400 text-yellow-700 text-xs font-medium px-2 py-1 rounded shadow-sm">
                <div className="flex gap-2">
                  <TriangleAlertIcon size={14} /> Duplicate {category === "quotation" ? 'quotation' : 'invoice'}
                </div>
                Ref: {category === "quotation" ? invoice.invoiceDetails?.passengerName : invoice.invoiceDetails?.bookingReference}
              </div>
            )}
          </div>
        ))}

        {filteredInvoices.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center col-span-full">
            No invoices found.
          </p>
        )}
      </div>

      {filteredInvoices.length > itemsPerPage && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Previous
          </button>
          <span className="px-2 text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AllInvoices;
