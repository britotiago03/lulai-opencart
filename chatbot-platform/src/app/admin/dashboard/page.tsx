"use client";
import AdminComponent from "@/components/admin/AdminComponent";
import { SessionProvider } from "next-auth/react";

export default function AdminDashboard() {
  return (
    <SessionProvider>
      <AdminComponent/>
    </SessionProvider>
  )
}
