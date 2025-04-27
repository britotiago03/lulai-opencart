// src/components/dashboard/DashboardHeader.tsx
import Link from "next/link";

export default function DashboardHeader() {
    return (
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex flex-wrap gap-2">
                <Link
                    href={`/dashboard/analytics`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                    Analytics
                </Link>
            </div>
        </div>
    );
}