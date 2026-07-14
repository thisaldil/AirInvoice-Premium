import React, { useEffect, useState } from "react";
import {
  FileTextIcon,
  FileUpIcon,
  SendIcon,
  BoxIcon,
  QuoteIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  InboxIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import avatar from '../images/default-avatar.png'

function Dashboard({ setGeneratedInvoice }) {
  const userId = localStorage.getItem("userId");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [allInvoices, setAllInvoices] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [monthlyInvoices, setMonthlyInvoices] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [lastMonthInvoices, setLastMonthInvoices] = useState([]);
  const [lastMonthRevenue, setLastMonthRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get(
          `https://air-invoice-server.vercel.app/invoice/getAllInvoices`
        );

        const allInvoices = res.data.map(inv => ({
          ...inv,
          date: inv.date ? new Date(inv.date).toISOString().split("T")[0] : "N/A",
        }));

        const sortedInvoices = allInvoices.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setRecentInvoices(sortedInvoices.slice(0, 5));

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentMonthInvoices = allInvoices.filter((inv) => {
          const invoiceDate = new Date(inv.date);
          return (
            invoiceDate.getFullYear() === currentYear &&
            invoiceDate.getMonth() === currentMonth
          );
        });

        const lastMonthInvoicesFiltered = allInvoices.filter((inv) => {
          const invoiceDate = new Date(inv.date);
          return (
            invoiceDate.getFullYear() === lastMonthYear &&
            invoiceDate.getMonth() === lastMonth
          );
        });

        const currentRevenue = currentMonthInvoices
          .filter(inv => inv.invoiceDetails?.type === "invoice")
          .reduce((sum, inv) => sum + parseFloat(inv.priceDetails?.totalAmount || 0), 0);

        const previousRevenue = lastMonthInvoicesFiltered
          .filter(inv => inv.invoiceDetails?.type === "invoice")
          .reduce((sum, inv) => sum + parseFloat(inv.priceDetails?.totalAmount || 0), 0);

        setAllInvoices(allInvoices);
        setMonthlyInvoices(currentMonthInvoices);
        setLastMonthInvoices(lastMonthInvoicesFiltered);
        setMonthlyRevenue(currentRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        setLastMonthRevenue(previousRevenue);
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

  // Local, lightweight keyframes — no external animation library required.
  const motionStyles = `
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fade-slide-up {
      animation: fadeSlideUp 0.5s ease-out both;
    }
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out both;
    }
  `;

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-8 md:space-y-10 animate-pulse">
        <style>{motionStyles}</style>
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="flex items-center space-x-3">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-md" />
            <div className="h-10 w-10 bg-slate-300 dark:bg-slate-600 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 space-y-4 border border-slate-100 dark:border-slate-700">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-600 rounded-md" />
          <div className="h-10 w-full bg-slate-100 dark:bg-slate-700 rounded-lg" />
          <div className="h-10 w-full bg-slate-100 dark:bg-slate-700 rounded-lg" />
          <div className="h-10 w-full bg-slate-100 dark:bg-slate-700 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        </div>
      </div>
    );
  }

  const invoiceChange =
    lastMonthInvoices.length > 0
      ? (((monthlyInvoices.length - lastMonthInvoices.length) / lastMonthInvoices.length) * 100).toFixed(1)
      : "N/A";

  const revenueChange =
    lastMonthRevenue > 0
      ? (((parseFloat(monthlyRevenue.replace(/,/g, "")) - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
      : "N/A";

  const handleSend = (invoice) => {
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

    navigate("/dashboard/send");
  };

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <style>{motionStyles}</style>

      {/* Header */}
      <div
        className="flex justify-between items-center mb-8"
        data-tour="dashboard"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening with your invoices today.
          </p>
        </div>
        {user && (
          <div className="flex items-center space-x-3">
            <span className="hidden md:block text-slate-700 font-medium dark:text-slate-200">
              {user.name}
            </span>
            <img
              src={
                user?.picture
                  ? user.picture.replace("=s96-c", "").replace("http://", "https://")
                  : avatar
              }
              alt={user.name}
              className="w-10 h-10 object-cover rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10"
        data-tour="create-template"
      >
        <Link
          to={`/dashboard/upload`}
          className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-500 text-white p-6 rounded-2xl shadow-md shadow-indigo-200/60 dark:shadow-none hover:shadow-xl hover:shadow-indigo-300/50 dark:hover:shadow-none transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center relative z-10">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
              <FileUpIcon className="w-6 h-6" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-lg font-semibold">Create a New Invoice</h3>
              <p className="text-sm text-indigo-100">
                Create a new invoice from airline ticket
              </p>
            </div>
          </div>
          <ArrowUpRightIcon className="absolute top-5 right-5 w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
        </Link>

        <Link
          to={`/dashboard/quotation`}
          className="group relative overflow-hidden bg-gradient-to-br from-sky-600 to-sky-500 text-white p-6 rounded-2xl shadow-md shadow-sky-200/60 dark:shadow-none hover:shadow-xl hover:shadow-sky-300/50 dark:hover:shadow-none transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center relative z-10">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
              <QuoteIcon className="w-6 h-6" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-lg font-semibold">Create New Quotation</h3>
              <p className="text-sm text-sky-100">
                Create a new quotation for customers
              </p>
            </div>
          </div>
          <ArrowUpRightIcon className="absolute top-5 right-5 w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
        </Link>

        <Link
          to={`/dashboard/templates`}
          className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 text-white p-6 rounded-2xl shadow-md shadow-slate-300/60 dark:shadow-none hover:shadow-xl hover:shadow-slate-400/40 dark:hover:shadow-none transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center relative z-10">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-colors duration-300">
              <BoxIcon className="w-6 h-6" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-lg font-semibold">Manage Templates</h3>
              <p className="text-sm text-slate-300">
                Manage the created templates
              </p>
            </div>
          </div>
          <ArrowUpRightIcon className="absolute top-5 right-5 w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
        </Link>
      </div>

      {/* Recent invoices table */}
      <div
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 dark:bg-slate-800 dark:border-slate-700 animate-fade-slide-up"
        data-tour="invoice-section"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Invoices & Quotations
          </h2>
          <Link
            to={'/dashboard/invoices'}
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium transition-colors duration-200"
          >
            View All
            <ArrowUpRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14">
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full mb-4">
              <InboxIcon className="w-7 h-7 text-slate-400 dark:text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
              No invoices yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              Create your first invoice to see it show up here.
            </p>
            <Link
              to="/dashboard/upload"
              className="mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors duration-200"
            >
              <FileUpIcon className="w-4 h-4" />
              Create Invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Type
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Customer
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Date
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Amount
                  </th>
                  <th className="py-3 px-6 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((invoice) => (
                  <tr
                    key={invoice._id}
                    className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150"
                  >
                    <td className="py-4 px-6 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          invoice.invoiceDetails.type === 'invoice'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                            : 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300'
                        }`}
                      >
                        {invoice.invoiceDetails.type === 'invoice' ? 'Invoice' : 'Quotation'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-700 dark:text-slate-200">
                      {invoice.invoiceDetails.passengerName[0]}...
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">
                      {invoice.date}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-900 font-semibold dark:text-white">
                      {invoice.priceDetails.totalAmount}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSend(invoice)}
                          title="View"
                          className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 transition-all duration-200"
                        >
                          <FileTextIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSend(invoice)}
                          title="Send"
                          className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 transition-all duration-200"
                        >
                          <SendIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            label: "Invoices & Quotations This Month",
            value: `${monthlyInvoices.length}`,
            change: invoiceChange === "N/A" ? "N/A" : `${invoiceChange}%`,
            isPositive: invoiceChange !== "N/A" && parseFloat(invoiceChange) >= 0,
          },
          {
            label: "This Month Revenue",
            value: `$${monthlyRevenue}`,
            change: revenueChange === "N/A" ? "N/A" : `${revenueChange}%`,
            isPositive: revenueChange !== "N/A" && parseFloat(revenueChange) >= 0,
          },
          {
            label: "All Invoices & Quotations",
            value: `${allInvoices.length}`,
            change: "",
            isPositive: true,
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 animate-fade-slide-up"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              {stat.label}
            </p>
            <div className="flex justify-between items-end">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </h3>
              {stat.change !== "" && (
                <span
                  className={`inline-flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full ${
                    stat.change === "N/A"
                      ? "text-slate-400 bg-slate-100 dark:bg-slate-700 dark:text-slate-400"
                      : stat.isPositive
                        ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "text-rose-700 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400"
                  }`}
                >
                  {stat.change !== "N/A" && (
                    stat.isPositive
                      ? <ArrowUpRightIcon className="w-3.5 h-3.5" />
                      : <ArrowDownRightIcon className="w-3.5 h-3.5" />
                  )}
                  {stat.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Dashboard;