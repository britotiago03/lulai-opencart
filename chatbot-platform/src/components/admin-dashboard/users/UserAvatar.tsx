// src/components/admin-dashboard/users/UserAvatar.tsx
import React from "react";

interface UserAvatarProps {
    name: string;
}

export default function UserAvatar({ name }: UserAvatarProps) {
    return (
        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
            {name[0]}
        </div>
    );
}