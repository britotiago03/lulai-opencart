// src/components/admin-dashboard/users/AddUserButton.tsx
import React from "react";
import { Plus } from "lucide-react";

export default function AddUserButton() {
    return (
        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors flex items-center justify-center sm:justify-start">
            <Plus className="h-5 w-5 mr-2" />
            Add User
        </button>
    );
}
