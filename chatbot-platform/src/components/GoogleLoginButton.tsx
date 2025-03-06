import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function GoogleLoginButton() {
  const { data: session } = useSession();

  return (
    <div>
      
      {session ? (
        <div>
          <p>Welcome, {session.user?.name}</p>
          <button 
            className="px-6 py-3 text-gray-500 border-2 border-black rounded-lg"
            onClick={() => signOut()}>Sign Out
          </button>
        </div>
      ) : (
        <button 
          className="flex items-center pl-2 pr-6 py-3 text-gray-500 border-2 border-black rounded-lg"
          onClick={() => signIn("google", {callbackUrl: "/"})}>
          <Image
            src="/google_icon.png"
            alt="Next.js logo"
            width={48}
            height={48}
            priority
            className="mr-2"
          />  
          Sign In with Google
        </button>
      )}
    </div>
  );
}
