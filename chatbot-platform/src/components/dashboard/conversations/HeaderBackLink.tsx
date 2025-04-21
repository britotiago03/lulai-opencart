import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function HeaderBackLink() {
    return (
        <Link href={`/dashboard/conversations`} className="flex items-center text-blue-500 hover:text-blue-400 mb-6">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Conversations
        </Link>
    );
}
