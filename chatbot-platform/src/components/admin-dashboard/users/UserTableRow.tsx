// src/components/admin-dashboard/users/UserTableRow.tsx
import React from "react";
import { UserData } from "@/types/user";
import UserAvatar from "./UserAvatar";
import RoleBadge from "./RoleBadge";

interface UserTableRowProps {
    user: UserData;
}

export default function UserTableRow({ user }: UserTableRowProps) {
    return (
        <tr className="border-b border-gray-800 hover:bg-[#232b3c] transition-colors">
            <td className="py-3 px-4">
                <div className="flex items-center">
                    <UserAvatar name={user.name} />
                    {user.name}
                </div>
            </td>
            <td className="py-3 px-4 text-gray-300">{user.email}</td>
            <td className="py-3 px-4">
                <RoleBadge role={user.role} />
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
    );
}