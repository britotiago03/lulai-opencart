"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function GoogleSigninButton() {
  const { data: session } = useSession();

  const handleSignIn = async () => {
    try {
      const result = await signIn("google", {redirect: false});

      if(result?.ok) {
        const response = await fetch("/api/users/data");
        
        if (!response.ok) {
          console.error("Failed to fetch user data");
          return;
        }

        const userData = await response.json();

        // Redirect logic
        if(userData?.subscription_status === 'none') {
          window.location.href = "/subscriptions";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        console.error("Google sign-in failed");
      }
    } catch(error) {
      console.error("Error during sign-in", error);
    }
  }

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
          onClick={handleSignIn}>
          <Image
            src="/google_icon.png"
            alt="Next.js logo"
            width={48}
            height={48}
            priority
            className="mr-2"
          />  
          Sign in with Google
        </button>
      )}
    </div>
  );
}
