// src/components/admin-dashboard/users/UserTable.tsx
import React from "react";
import { UserData } from "@/types/user";
import UserTableHeader from "./UserTableHeader";
import UserTableRow from "./UserTableRow";

interface UserTableProps {
    users: UserData[];
}

export default function UserTable({ users }: UserTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <UserTableHeader />
                <tbody>
                {users.map((user) => (
                    <UserTableRow key={user.id} user={user} />
                ))}
                </tbody>
            </table>
        </div>
    );
}