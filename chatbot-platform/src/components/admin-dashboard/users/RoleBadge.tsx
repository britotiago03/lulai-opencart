// src/components/admin-dashboard/users/RoleBadge.tsx
import React from "react";

interface RoleBadgeProps {
    role: string;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
    return (
        <span className={`px-2 py-1 text-xs rounded-full ${
            role === "admin"
                ? "bg-purple-900/30 text-purple-400"
                : "bg-blue-900/30 text-blue-400"
        }`}>
      {role}
    </span>
    );
}