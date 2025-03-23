// app/api/admin-auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { adminAuthOptions } from "@/lib/auth-config";

// Use admin auth options
const handler = NextAuth(adminAuthOptions);

export { handler as GET, handler as POST };