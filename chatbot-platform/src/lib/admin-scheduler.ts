// lib/admin-scheduler.ts
import pool from "@/lib/db";
import { setupInitialAdmin, updateAdminAccessToken } from "@/lib/adminSetup";
import { sendAdminAccessUpdateEmail } from "@/lib/emailService";

// Check if admin setup is needed
async function checkAndSetupAdmin() {
    try {
        console.log("Checking if admin setup is needed...");
        const setupResult = await pool.query(
            "SELECT setting_value FROM admin_settings WHERE setting_key = 'setup_completed'"
        );

        if (setupResult.rows.length === 0 ||
            setupResult.rows[0].setting_value === 'false') {
            console.log("Admin setup is needed, initiating setup...");
            await setupInitialAdmin();
        } else if (setupResult.rows[0].setting_value === 'in_progress') {
            console.log("Admin setup is in progress, waiting for completion...");
            // Setup is in progress, nothing to do
        } else {
            console.log("Admin setup already completed.");
        }
    } catch (error) {
        console.error("Error in checkAndSetupAdmin:", error);
    }
}

// Check and renew admin access tokens if needed
async function checkAndRenewAdminAccessTokens() {
    try {
        console.log("Checking admin access tokens...");

        // Check if setup is completed first
        const setupResult = await pool.query(
            "SELECT setting_value FROM admin_settings WHERE setting_key = 'setup_completed'"
        );

        if (setupResult.rows.length === 0 ||
            setupResult.rows[0].setting_value !== 'true') {
            console.log("Admin setup not completed, skipping token check.");
            return;
        }

        // Check renewal frequency setting
        const frequencyResult = await pool.query(
            "SELECT setting_value FROM admin_settings WHERE setting_key = 'access_token_renewal_frequency'"
        );

        const renewalFrequency = frequencyResult.rows.length > 0 ?
            frequencyResult.rows[0].setting_value : 'weekly';

        // Calculate the date threshold based on frequency
        const threshold = new Date();
        if (renewalFrequency === 'weekly') {
            threshold.setDate(threshold.getDate() + 2); // Renew if expiring in 2 days
        } else {
            threshold.setDate(threshold.getDate() + 7); // Renew if expiring in 7 days for monthly
        }

        // Check if any active tokens are expiring soon
        const tokenResult = await pool.query(
            `SELECT at.id, at.expires_at, at.created_by, au.email, au.name 
       FROM admin_access_tokens at
       JOIN admin_users au ON at.created_by = au.id
       WHERE at.is_active = true AND at.expires_at < $1`,
            [threshold]
        );

        if (tokenResult.rows.length === 0) {
            console.log("No tokens need renewal at this time.");
            return;
        }

        console.log(`Found ${tokenResult.rows.length} token(s) that need renewal.`);

        // Find a super admin to create the new token
        const adminResult = await pool.query(
            "SELECT id FROM admin_users WHERE is_super_admin = true AND is_active = true LIMIT 1"
        );

        if (adminResult.rows.length === 0) {
            console.error("No active super admin found to renew tokens.");
            return;
        }

        const adminId = adminResult.rows[0].id;

        // Create new token
        const newToken = await updateAdminAccessToken(adminId, renewalFrequency as 'weekly' | 'monthly');

        // Send email to all active admins
        const adminsResult = await pool.query(
            "SELECT email, name FROM admin_users WHERE is_active = true"
        );

        for (const admin of adminsResult.rows) {
            await sendAdminAccessUpdateEmail(
                admin.email,
                admin.name,
                newToken.path,
                newToken.key,
                newToken.expiresAt
            );
        }

        console.log("Access tokens renewed and emails sent.");
    } catch (error) {
        console.error("Error in checkAndRenewAdminAccessTokens:", error);
    }
}

// Schedule token renewal checks
export function startAdminScheduler() {
    // Check for admin setup on startup
    checkAndSetupAdmin().catch(console.error);

    // Check for token renewals on startup
    checkAndRenewAdminAccessTokens().catch(console.error);

    // Set up a daily check for token renewals
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    setInterval(() => {
        checkAndRenewAdminAccessTokens().catch(console.error);
    }, TWENTY_FOUR_HOURS);

    console.log("Admin scheduler started.");
}