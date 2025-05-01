// lib/admin-init.ts
import pool from '@/lib/db';
import { startAdminScheduler } from './admin-scheduler';

/**
 * Updates the admin_email setting from environment variables if necessary
 */
async function updateAdminEmailSetting() {
    const adminEmail = process.env.ADMIN_EMAIL;

    // If there's no ADMIN_EMAIL set, we don't need to update anything
    if (!adminEmail) {
        console.log('No ADMIN_EMAIL environment variable found. Using existing settings.');
        return;
    }

    try {
        // Check current admin_email setting
        const result = await pool.query(
            "SELECT setting_value FROM admin_settings WHERE setting_key = 'admin_email'"
        );

        // If the email setting exists and is different from the env var, update it
        if (result.rows.length > 0) {
            const currentEmail = result.rows[0].setting_value;

            // Only update if different
            if (currentEmail !== adminEmail) {
                await pool.query(
                    "UPDATE admin_settings SET setting_value = $1 WHERE setting_key = 'admin_email'",
                    [adminEmail]
                );
                console.log(`Updated admin_email setting to: ${adminEmail}`);
            } else {
                console.log('admin_email setting already matches environment variable');
            }
        } else {
            // If the setting doesn't exist, insert it
            await pool.query(
                "INSERT INTO admin_settings (setting_key, setting_value) VALUES ('admin_email', $1)",
                [adminEmail]
            );
            console.log(`Inserted admin_email setting: ${adminEmail}`);
        }
    } catch (error) {
        console.error('Error updating admin_email setting:', error);
    }
}

/**
 * Initialize the admin system
 * This should be called at application startup
 */
export async function initializeAdminSystem() {
    console.log('Initializing admin system...');

    // Update admin email setting from environment variables
    await updateAdminEmailSetting().catch(console.error);

    // Start the admin scheduler
    startAdminScheduler();

    console.log('Admin system initialized');
}