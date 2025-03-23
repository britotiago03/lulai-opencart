// lib/admin-init.ts
import { startAdminScheduler } from './admin-scheduler';

/**
 * Initialize the admin system
 * This should be called at application startup
 */
export function initializeAdminSystem() {
    console.log('Initializing admin system...');

    // Start the admin scheduler
    startAdminScheduler();

    console.log('Admin system initialized');
}