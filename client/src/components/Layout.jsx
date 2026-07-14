import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  HomeIcon,
  FileTextIcon,
  SettingsIcon,
  LogOutIcon,
  BoxIcon,
  FilesIcon,
  Menu,
  X,
  QuoteIcon
} from "lucide-react";
import logo from "../images/logo.png";
import darklogo from "../images/drklogo.png";
import OnboardingGuide from "./onboarding/OnboardingGuide";
import PageTourManager from "./onboarding/PageTourManager";
import {
  clearGuidePreference,
  shouldShowGuide,
} from "../utils/onboarding";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(() => shouldShowGuide());

  useEffect(() => {
    if (location.pathname === "/dashboard" && shouldShowGuide()) {
      setGuideOpen(true);
    }
  }, [location.pathname]);

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: HomeIcon },
    { path: "/dashboard/upload", label: "New Invoice", icon: FileTextIcon },
    { path: "/dashboard/quotation", label: "New Quotation", icon: QuoteIcon },
    { path: "/dashboard/templates", label: "Templates", icon: BoxIcon },
    { path: "/dashboard/invoices", label: "Invoices & Quotations", icon: FilesIcon },
    // { path: "/dashboard/crm", label: "CRM", icon: Users },
    { path: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    clearGuidePreference();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.35s ease-out both;
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-overlay-in {
          animation: overlayIn 0.25s ease-out both;
        }
      `}</style>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 shadow-sm px-4 py-3 flex justify-between items-center">
        <img src={logo} alt="logo" className="h-9 dark:hidden" />
        <img src={darklogo} alt="logo" className="h-9 hidden dark:block" />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all duration-200"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] animate-overlay-in"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed pt-16 md:pt-0 md:relative z-40 top-0 left-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 shadow-xl md:shadow-none flex flex-col transform transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="hidden md:flex items-center p-6 border-b border-slate-100 dark:border-slate-700">
          <img src={logo} alt="logo" className="max-w-32 block dark:hidden" />
          <img src={darklogo} alt="dark logo" className="max-w-32 hidden dark:block" />
        </div>

        {/* navigations */}
        <nav className="mt-4 flex-1 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    data-tour={item.path === "/dashboard/settings" ? "settings" : undefined}
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                    className={`group flex items-center w-full px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <item.icon
                      className={`w-[18px] h-[18px] mr-3 flex-shrink-0 transition-colors duration-200 ${
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-all duration-200"
          >
            <LogOutIcon className="w-[18px] h-[18px] mr-3 text-slate-400 group-hover:text-rose-500 transition-colors duration-200" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-16 md:pt-0 bg-slate-50 dark:bg-slate-900">
        <div className="p-4 md:p-8 animate-fade-in">
          <Outlet />
        </div>
      </div>

      {guideOpen && <OnboardingGuide onClose={() => setGuideOpen(false)} />}
      <PageTourManager disabled={guideOpen} />
    </div>
  );
}

export default Layout;