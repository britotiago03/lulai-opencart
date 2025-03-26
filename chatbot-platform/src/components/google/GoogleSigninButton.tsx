"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function GoogleSigninButton() {
  const { data: session } = useSession();
  const [endpoint, setEndpoint] = useState("");
  const [buttonText, setButtonText] = useState("");
  const pathname = usePathname();

  if (pathname === "/auth/signup") {
    setButtonText("Sign up with Google");
  } else if (pathname === "/auth/signin") {
    setButtonText("Sign in with Google");
  } 

  // Determine callback URL based on subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (session) {
        try {
          const response = await fetch("/api/users/data");

          if (!response.ok) {
            console.error("Failed to fetch user data");
            return;
          }

          const userData = await response.json();
          if (userData.subscription_status === "none") {
            setEndpoint("/subscriptions");
          } else {
            setEndpoint("/dashboard");
          }
        } catch (error) {
          console.error("Error fetching subscription status:", error);
        }
      } else {
        setEndpoint("/home"); // Default for non-logged-in users
      }
    };

    fetchSubscriptionStatus();
  }, [session]);

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
          onClick={() => signIn("google", {callbackUrl: endpoint})}>
          <Image
            src="/google_icon.png"
            alt="Next.js logo"
            width={48}
            height={48}
            priority
            className="mr-2"
          />  
          {buttonText}
        </button>
      )}
    </div>
  );
}
