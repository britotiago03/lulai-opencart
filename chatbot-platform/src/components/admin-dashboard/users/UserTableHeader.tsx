// src/components/admin-dashboard/users/UserTableHeader.tsx
import React from "react";

export default function UserTableHeader() {
    return (
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
    );
}