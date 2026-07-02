import React, { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import AdminDashboard from "./AdminDashboard";
import axios from "axios";
import toast from "react-hot-toast";
import avatar from '../images/default-avatar.png'

const API_BASE = "https://air-invoice-server.vercel.app/user";

const Settings = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system");
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem('userId')
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const html = document.documentElement;
    const applyTheme = (mode) => {
      if (mode === "dark") html.classList.add("dark");
      else if (mode === "light") html.classList.remove("dark");
      else {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        html.classList.toggle("dark", prefersDark);
      }
    };
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_BASE}/getUserDetails/${userId}`);
      setUser(res.data || null);
      setLoading(false)
    } catch (err) {
      toast.error("Failed to load user");
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const themeOptions = [
    { label: "System", value: "system", icon: <Monitor className="w-6 h-6" /> },
    { label: "Light", value: "light", icon: <Sun className="w-6 h-6" /> },
    { label: "Dark", value: "dark", icon: <Moon className="w-6 h-6" /> },
  ];

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-10 dark:bg-gray-900 min-h-screen">
        {/* Profile & Theme section */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="sm:col-span-2 bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center gap-6">
            <div className="w-28 h-28 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="space-y-2 w-full">
              <div className="h-5 w-2/3 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-600 rounded" />
              <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-600 rounded" />
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mx-auto mb-6" />
            <div className="flex justify-center space-x-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700" />
              ))}
            </div>
          </div>
        </div>

        {/* Admin Dashboard Heading */}
        <div className="flex flex-row justify-between items-center">
          <div className="h-8 w-52 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-8 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>

        {/* Skeleton Table */}
        <div className="overflow-x-auto rounded-lg shadow border dark:border-gray-700">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 flex justify-between">
            <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
          {[...Array(5)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded" />
              </div>
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-600 rounded" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded" />
              <div className="flex space-x-2">
                <div className="w-16 h-8 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="w-8 h-8 bg-red-300 dark:bg-red-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="grid sm:grid-cols-3 gap-6">
          {/* Profile Card */}
          {user && (
            <div className="sm:col-span-2 bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col sm:flex-row items-center gap-6">
              <img
                src={
                  user?.picture
                    ? user.picture.replace("=s96-c", "").replace("http://", "https://")
                    : avatar
                }
                alt={user.name}
                className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-700 shadow-md"
              />
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                <p className="text-gray-400 text-sm mt-1">{user.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
              </div>
            </div>
          )}

          {/* Theme Settings with Icons */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4 text-center">Theme Settings</h2>
            <div className="flex justify-center space-x-4">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`p-3 rounded-full border-2 transition-all
                  ${theme === option.value
                      ? "bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  title={option.label}
                >
                  {option.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Admin dashboard */}
        {user?.role === "Admin" && <AdminDashboard />}
      </div>
    </div>
  );
};

export default Settings;
