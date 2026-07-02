import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Trash2, ChevronDown, UserCog } from "lucide-react";
import RegistrationModal from "./auth/RegistrationModal";
import avatar from '../images/default-avatar.png'

const API_BASE = "https://air-invoice-server.vercel.app/user";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [updatingId, setUpdatingId] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const userId = localStorage.getItem("userId");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const loggedInUserId = localStorage.getItem("userId");

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE}/getAllUsers`);
            setUsers(res.data || []);
        } catch (err) {
            toast.error("Failed to load users");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChangeRole = async (userId, newRole) => {
        try {
            setUpdatingId(userId);
            await axios.patch(`${API_BASE}/updateUser/${userId}/role`, { role: newRole });
            toast.success("Role updated");
            fetchUsers();
        } catch (err) {
            toast.error("Failed to update role");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`${API_BASE}/deleteUser/${userId}`);
            toast.success("User deleted");
            fetchUsers();
        } catch (err) {
            toast.error("Failed to delete user");
        }
    };

    return (
        <div className="dark:bg-gray-900 min-h-screen text-gray-800 dark:text-white">
            <div className="flex sm:flex-row flex-col justify-between items-center mb-5 sm:mb-0">
                <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                    <UserCog className="w-6 h-6" />
                    Admin Dashboard
                </h1>

                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="sm:w-1/5 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                >
                    Create a New user
                </button>
            </div>
            <div className="overflow-x-auto rounded-lg shadow border dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {users
                            .filter((u) => u._id !== loggedInUserId)
                            .map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 flex items-center space-x-3">
                                        <img
                                            src={user.picture || avatar}
                                            alt="avatar"
                                            className="w-10 h-10 rounded-full border dark:border-gray-700"
                                        />
                                        <span className="font-medium">{user.name || "No Name"}</span>
                                    </td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4 capitalize">{user.role}</td>
                                    <td className="px-6 py-4 relative">
                                        <div className="inline-flex items-center">
                                            <button
                                                onClick={() =>
                                                    setDropdownOpen(dropdownOpen === user._id ? null : user._id)
                                                }
                                                className="px-2 py-1 text-sm border rounded flex items-center dark:border-gray-600"
                                            >
                                                Role
                                                <ChevronDown className="w-4 h-4 ml-1" />
                                            </button>
                                            {dropdownOpen === user._id && (
                                                <div className="absolute z-10 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-lg">
                                                    {["Admin", "Employee"].map((role) => (
                                                        <button
                                                            key={role}
                                                            onClick={() => {
                                                                handleChangeRole(user._id, role);
                                                                setDropdownOpen(null);
                                                            }}
                                                            disabled={updatingId === user._id}
                                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            {role}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="ml-4 text-red-500 hover:text-red-700"
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-6 text-gray-500 dark:text-gray-400">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <RegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

export default AdminDashboard;
