// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { userAuthOptions } from "@/lib/auth-config";

// Use regular user auth options
const handler = NextAuth(userAuthOptions);

export { handler as GET, handler as POST };