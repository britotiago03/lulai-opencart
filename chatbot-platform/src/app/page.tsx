import ToSigninButton from "@/components/ToSigninButton";
import { SessionProvider } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-100">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-center">
        <Image
          src="/lulAI_logo.png"
          alt="Next.js logo"
          width={180 * 2}
          height={38 * 2}
          priority
        />
        <p className="font-[family-name:var(--font-geist-mono)] text-center text-gray-500 max-w-2xl">
           Our AI-powered chatbot is designed to revolutionize your in-store 
           shopping experience. With a wide range of capabilities, it serves 
           as your virtual in-store expert, providing valuable assistance 
           to both retailers and customers.
        </p>
        <p className="font-[family-name:var(--font-geist-mono)] text-center text-gray-500 max-w-2xl">
           To get started, please sign in using the button below.
        </p>
        <ToSigninButton/>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-black">
        <p>LulAI Inc. &copy;</p>
      </footer>
    </div>
  );
}
