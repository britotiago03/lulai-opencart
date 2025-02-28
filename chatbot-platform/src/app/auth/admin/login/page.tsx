import Image from "next/image";

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center w-full md:w-1/2 p-4 md:mr-32">
                <Image
                    src="/lulAI_logo.png"
                    alt="Next.js logo"
                    width={180 * 2}
                    height={38 * 2}
                    priority
                />
                <p className="font-[family-name:var(--font-dm-sans)] text-center text-gray-500 max-w-4xl mt-16">
                    This is a placeholder admin login page and is currently under development.
                </p>
            </div>
        </div>
    )
}