import { getServerSession } from "next-auth/next";
import { userAuthOptions } from "@/lib/auth-config";
import { SessionData } from "../types";

export async function getAuthenticatedSession(): Promise<SessionData | null> {
    return await getServerSession(userAuthOptions);
}

export function isAdmin(session: SessionData): boolean {
    return session.user.role === "admin";
}