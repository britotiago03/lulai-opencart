// app/api/admin-auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { adminAuthOptions } from "@/lib/auth-config";

// Use the admin authentication options
const handler = NextAuth(adminAuthOptions);

export { handler as GET, handler as POST };