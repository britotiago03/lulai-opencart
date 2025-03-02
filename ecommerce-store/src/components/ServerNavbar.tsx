import Link from "next/link";
import dynamic from "next/dynamic";

const DynamicNavbar = dynamic(() => import("@/components/DynamicNavbar"), { ssr: false });

export default function ServerNavbar() {
    return (
        <nav className="flex justify-between p-4 bg-gray-800 text-white">
            <Link href="/" className="text-lg font-bold">My App</Link>
            <div className="flex gap-4 items-center">
                <Link href={{ pathname: "/products" }} className="px-4 py-2 bg-gray-700 rounded">Products</Link>
                <DynamicNavbar /> {/* ✅ Lazy-loaded only when needed */}
            </div>
        </nav>
    );
}
