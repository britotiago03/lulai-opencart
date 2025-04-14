// src/app/admin/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User, Plus, MoreHorizontal, Filter } from "lucide-react";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
    chatbotCount: number;
    lastActive: string;
}

export default function UsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<UserData[]>([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all"); // "all", "admin", "client"
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        if (status === "authenticated" && session?.user?.role !== "admin") {
            router.push("/dashboard");
            return;
        }

        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/admin/users');

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data = await response.json();
                setUsers(data);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError("Failed to load users. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [session, status, router]);

    // Filter users based on search and role filter
    const filteredUsers = users.filter(user => {
        const matchesSearch = search === "" ||
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());

        const matchesFilter = filter === "all" || user.role === filter;

        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">User Management</h1>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-[#1b2539] border border-gray-700 rounded-md text-white"
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>

                    <div className="relative">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full sm:w-32 appearance-none pl-10 pr-4 py-2 bg-[#1b2539] border border-gray-700 rounded-md text-white"
                        >
                            <option value="all">All</option>
                            <option value="admin">Admin</option>
                            <option value="client">Client</option>
                        </select>
                        <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>

                    <button
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors flex items-center justify-center sm:justify-start"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add User
                    </button>
                </div>
            </div>

            {error ? (
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6 text-center">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </CardContent>
                </Card>
            ) : filteredUsers.length === 0 ? (
                <Card className="bg-[#1b2539] border-0">
                    <CardContent className="p-6 text-center">
                        <User className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-medium mb-2">
                            No users found
                        </h3>
                        <p className="text-gray-400">
                            Try adjusting your search or filter criteria
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-[#1b2539] border-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-700">
                                <th className="py-3 px-4 text-left">Name</th>
                                <th className="py-3 px-4 text-left">Email</th>
                                <th className="py-3 px-4 text-left">Role</th>
                                <th className="py-3 px-4 text-left">Chatbots</th>
                                <th className="py-3 px-4 text-left">Created</th>
                                <th className="py-3 px-4 text-left">Last Active</th>
                                <th className="py-3 px-4 text-left">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="border-b border-gray-800 hover:bg-[#232b3c] transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                                                {user.name[0]}
                                            </div>
                                            {user.name}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-300">{user.email}</td>
                                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === "admin"
                              ? "bg-purple-900/30 text-purple-400"
                              : "bg-blue-900/30 text-blue-400"
                      }`}>
                        {user.role}
                      </span>
                                    </td>
                                    <td className="py-3 px-4">{user.chatbotCount}</td>
                                    <td className="py-3 px-4 text-gray-300">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4 text-gray-300">
                                        {new Date(user.lastActive).toLocaleString(undefined, {
                                            dateStyle: "short",
                                            timeStyle: "short",
                                        })}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex space-x-2">
                                            <button className="text-blue-500 hover:text-blue-400 transition-colors">
                                                Edit
                                            </button>
                                            <button className="text-red-500 hover:text-red-400 transition-colors">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}