"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

export default function GoogleSigninButton() {
  const handleGoogleSignIn = async () => {
    await signIn("google", { 
      redirect: true,
      callbackUrl: '/api/auth/check-subscription' 
    });
  };

  return (
    <button 
      className="flex items-center pl-2 pr-6 py-3 text-gray-500 border-2 border-black rounded-lg"
      onClick={handleGoogleSignIn}
    >
      <Image
        src="/google_icon.png"
        alt="Google icon"
        width={48}
        height={48}
        priority
        className="mr-2"
      />  
      Sign in with Google
    </button>
  );
}