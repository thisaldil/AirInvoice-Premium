import React, { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import RegisterGoogle from "./RegisterGoogle";
import { GoogleOAuthProvider } from "@react-oauth/google";

const RegistrationModal = ({ isOpen, onClose }) => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "Employee",
    });

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("https://air-invoice-server.vercel.app/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Registration failed");
                return;
            }

            toast.success("User registered successfully");
            onClose();
        } catch (err) {
            toast.error("Server error. Please try again.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                {/* X Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-4">Register New User</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded"
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded"
                    />
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                    >
                        <option value="Employee">Employee</option>
                        <option value="Admin">Admin</option>
                    </select>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Register
                    </button>
                </form>

                <div className="my-4 text-center text-sm text-gray-400">or register with Google</div>

                <div className="flex justify-center mb-4">
                    <GoogleOAuthProvider clientId="536656085214-lflgf5vpabtlh57mt6jj5f4v2qpdu6o0.apps.googleusercontent.com">
                        <RegisterGoogle />
                    </GoogleOAuthProvider>
                </div>
            </div>
        </div>
    );
};

export default RegistrationModal;