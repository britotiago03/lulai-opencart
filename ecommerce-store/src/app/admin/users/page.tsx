"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface AdminUser {
    id: number;
    name: string;
    email: string;
    is_super_admin: boolean;
    is_active: boolean;
    created_at: string;
    last_login: string | null;
}

export default function AdminUsersPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        is_super_admin: false
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const isSuperAdmin = session?.user?.isSuperAdmin;

    useEffect(() => {
        // Define the fetch function
        async function fetchUsers() {
            try {
                const response = await fetch("/api/admin/users");

                if (!response.ok) {
                    setError("Failed to fetch admin users");
                    console.error("Error response:", response.status, response.statusText);
                    return;
                }

                const data = await response.json();
                setUsers(data.users);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        }

        // Call the fetch function
        fetchUsers().catch(err => {
            console.error("Unexpected error in fetchUsers:", err);
            setError("An unexpected error occurred");
            setLoading(false);
        });
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newUser),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    type: "success",
                    text: "New admin user added successfully. They will receive an email with setup instructions.",
                });
                setUsers([...users, data.user]);
                setNewUser({
                    name: "",
                    email: "",
                    is_super_admin: false
                });
                setShowAddForm(false);
            } else {
                setMessage({
                    type: "error",
                    text: data.error || "Failed to add admin user"
                });
            }
        } catch (err) {
            setMessage({
                type: "error",
                text: err instanceof Error ? err.message : "An error occurred",
            });
            console.error("Error adding admin user:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleUserStatus = async (userId: number, newStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ is_active: newStatus }),
            });

            const data = await response.json();

            if (response.ok) {
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, is_active: newStatus } : user
                ));
                setMessage({
                    type: "success",
                    text: `User ${newStatus ? "activated" : "deactivated"} successfully`,
                });
            } else {
                setMessage({
                    type: "error",
                    text: data.error || "Failed to update user status"
                });
            }
        } catch (err) {
            setMessage({
                type: "error",
                text: err instanceof Error ? err.message : "An error occurred",
            });
            console.error("Error updating user status:", err);
        }
    };

    const toggleSuperAdminStatus = async (userId: number, newStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ is_super_admin: newStatus }),
            });

            const data = await response.json();

            if (response.ok) {
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, is_super_admin: newStatus } : user
                ));
                setMessage({
                    type: "success",
                    text: `User ${newStatus ? "promoted to" : "demoted from"} super admin successfully`,
                });
            } else {
                setMessage({
                    type: "error",
                    text: data.error || "Failed to update user permissions"
                });
            }
        } catch (err) {
            setMessage({
                type: "error",
                text: err instanceof Error ? err.message : "An error occurred",
            });
            console.error("Error updating user permissions:", err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setNewUser(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex justify-center my-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-800 text-white p-4 rounded-md">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Admin Users</h1>

                {isSuperAdmin && (
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        {showAddForm ? "Cancel" : "Add Admin User"}
                    </button>
                )}
            </div>

            {message && (
                <div
                    className={`p-4 rounded-md ${
                        message.type === "success" ? "bg-green-800 text-green-100" : "bg-red-800 text-red-100"
                    }`}
                >
                    {message.text}
                </div>
            )}

            {showAddForm && isSuperAdmin && (
                <div className="bg-gray-800 p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Add New Admin User</h2>

                    <form onSubmit={handleAddUser} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={newUser.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={newUser.email}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_super_admin"
                                name="is_super_admin"
                                checked={newUser.is_super_admin}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_super_admin" className="ml-2 block text-sm text-gray-300">
                                Super Admin (can manage other admins)
                            </label>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                disabled={submitting}
                            >
                                {submitting ? "Adding..." : "Add User"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Last Login
                        </th>
                        {isSuperAdmin && (
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        )}
                    </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_super_admin ? "bg-purple-700 text-purple-100" : "bg-blue-700 text-blue-100"
                  }`}>
                    {user.is_super_admin ? "Super Admin" : "Admin"}
                  </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_active ? "bg-green-700 text-green-100" : "bg-red-700 text-red-100"
                  }`}>
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {formatDate(user.last_login)}
                            </td>
                            {isSuperAdmin && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => toggleUserStatus(user.id, !user.is_active)}
                                            className={`text-xs px-2 py-1 rounded ${
                                                user.is_active
                                                    ? "bg-red-700 hover:bg-red-800 text-white"
                                                    : "bg-green-700 hover:bg-green-800 text-white"
                                            }`}
                                        >
                                            {user.is_active ? "Deactivate" : "Activate"}
                                        </button>

                                        <button
                                            onClick={() => toggleSuperAdminStatus(user.id, !user.is_super_admin)}
                                            className={`text-xs px-2 py-1 rounded ${
                                                user.is_super_admin
                                                    ? "bg-yellow-700 hover:bg-yellow-800 text-white"
                                                    : "bg-purple-700 hover:bg-purple-800 text-white"
                                            }`}
                                        >
                                            {user.is_super_admin ? "Remove Super Admin" : "Make Super Admin"}
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}