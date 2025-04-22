// src/components/admin-dashboard/users/UserControls.tsx
import React from "react";
import SearchBar from "./SearchBar";
import RoleFilter from "./RoleFilter";
import AddUserButton from "./AddUserButton";

interface UserControlsProps {
    search: string;
    setSearch: (value: string) => void;
    filter: string;
    setFilter: (value: string) => void;
}

export default function UserControls({
                                         search,
                                         setSearch,
                                         filter,
                                         setFilter
                                     }: UserControlsProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <SearchBar value={search} onChange={setSearch} />
            <RoleFilter value={filter} onChange={setFilter} />
            <AddUserButton />
        </div>
    );
}