// app/[...adminRoute]/page.tsx
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import AdminLoginPage from "@/components/admin/AdminLoginPage";

export default async function AdminRoute({ params }: { params: { adminRoute?: string[] } }) {
    // Safely destructure params 
    const awaitedParams = await Promise.resolve(params);
    const adminRouteParts = awaitedParams.adminRoute ?? [];

    if (adminRouteParts.length === 0) {
        console.error("Invalid or missing adminRouteParts:", adminRouteParts);
        return redirect("/404");
    }

    // Construct the secure path
    const path = `/${adminRouteParts.join("/")}`;

    // Validate admin path format
    const isSecurePattern = /^\/secure-admin-\d{4}$/.test(path);
    if (!isSecurePattern) {
        console.warn("Unauthorized admin path attempted:", path);
        return redirect("/404");
    }

    try {
        // Check if path exists in the database
        const result = await pool.query(
            "SELECT 1 FROM admin_access_tokens WHERE url_path = $1 AND is_active = true AND expires_at > NOW()",
            [path]
        );

        if (result.rows.length === 0) {
            console.warn("Admin access token not found or expired for path:", path);
            return redirect("/404");
        }

        // Render login page with the secure path
        return <AdminLoginPage securePath={path} />;
    } catch (error) {
        console.error("Error processing admin route:", error);
        return redirect("/admin/error");
    }
}