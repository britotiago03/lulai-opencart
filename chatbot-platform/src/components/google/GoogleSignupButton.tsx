"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function GoogleSignupButton() {
  const { data: session } = useSession();

  return (
    <div>
      {session ? (
        <div className="text-gray-500">
          <p>Welcome, {session.user?.name}</p>
          <button 
            className="px-6 py-3 text-gray-500 border-2 border-black rounded-lg"
            onClick={() => signOut()}>Sign Out
          </button>
        </div>
      ) : (
        <button 
          className="flex items-center pl-2 pr-6 py-3 text-gray-500 border-2 border-black rounded-lg"
          onClick={() => signIn("google", {callbackUrl: "/dashboard"})}>
          <Image
            src="/google_icon.png"
            alt="Next.js logo"
            width={48}
            height={48}
            priority
            className="mr-2"
          />  
          Sign up with Google
        </button>
      )}
    </div>
  );
}
