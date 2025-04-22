// src/app/admin/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { UserData } from "@/types/user";
import UserTable from "@/components/admin-dashboard/users/UserTable";
import UserControls from "@/components/admin-dashboard/users/UserControls";
import EmptyUserState from "@/components/admin-dashboard/users/EmptyUserState";
import ErrorState from "@/components/admin-dashboard/users/ErrorState";

export default function UsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<UserData[]>([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
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
                    setError('Failed to fetch users');
                    return;
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

        void fetchUsers();
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
                <UserControls
                    search={search}
                    setSearch={setSearch}
                    filter={filter}
                    setFilter={setFilter}
                />
            </div>

            {error ? (
                <ErrorState message={error} />
            ) : filteredUsers.length === 0 ? (
                <EmptyUserState />
            ) : (
                <Card className="bg-[#1b2539] border-0">
                    <UserTable users={filteredUsers} />
                </Card>
            )}
        </div>
    );
}