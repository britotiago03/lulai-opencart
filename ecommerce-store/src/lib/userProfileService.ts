"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Create a simple observer pattern for user profile updates
type ProfileData = {
    id?: string;
    name: string;
    email: string;
    subscriptionStatus?: string;
    // Add a timestamp to ensure reference changes on updates
    _lastUpdated?: number;
};

type ProfileObserver = (data: ProfileData) => void;

class UserProfileService {
    private static instance: UserProfileService;
    private observers: ProfileObserver[] = [];
    private profileData: ProfileData | null = null;
    private isLoading = false;
    private sessionRefreshCallbacks: (() => void)[] = []; // For session refresh

    private constructor() {
        console.log('UserProfileService initialized');
    }

    public static getInstance(): UserProfileService {
        if (!UserProfileService.instance) {
            UserProfileService.instance = new UserProfileService();
        }
        return UserProfileService.instance;
    }

    // Register a callback to refresh the session
    public registerSessionRefresh(callback: () => void): () => void {
        console.log('Session refresh callback registered');
        this.sessionRefreshCallbacks.push(callback);

        // Return function to unregister
        return () => {
            this.sessionRefreshCallbacks = this.sessionRefreshCallbacks.filter(cb => cb !== callback);
        };
    }

    // Trigger session refresh in all registered components
    private triggerSessionRefresh(): void {
        console.log(`Triggering session refresh in ${this.sessionRefreshCallbacks.length} components`);
        this.sessionRefreshCallbacks.forEach(callback => callback());
    }

    // Add an observer to be notified of profile updates
    public subscribe(observer: ProfileObserver): () => void {
        console.log('New observer subscribed');
        this.observers.push(observer);

        // If we already have profile data, immediately notify the new observer
        if (this.profileData) {
            console.log('Notifying new observer with existing data');
            observer(this.profileData);
        } else if (!this.isLoading) {
            // If we don't have data and aren't currently loading, fetch it
            console.log('No existing data, fetching for new observer');
            void this.fetchProfileData();
        }

        // Return an unsubscribe function
        return () => {
            console.log('Observer unsubscribed');
            this.observers = this.observers.filter(obs => obs !== observer);
        };
    }

    // Notify all observers of profile updates
    private notifyObservers(data: ProfileData): void {
        console.log(`Notifying ${this.observers.length} observers of profile update`);
        this.observers.forEach(observer => observer(data));
    }

    // Fetch profile data from the API
    public async fetchProfileData(): Promise<ProfileData | null> {
        if (this.isLoading) {
            console.log('Already fetching profile data, returning current data');
            return this.profileData;
        }

        console.log('Fetching profile data from API');
        this.isLoading = true;

        try {
            const response = await fetch('/api/account/profile');

            if (response.ok) {
                const data = await response.json();

                // Create a NEW object with timestamp to ensure reference changes
                this.profileData = {
                    ...data.profile,
                    _lastUpdated: Date.now()
                };

                console.log('Profile data fetched successfully:', this.profileData);

                // Only notify if we actually have data
                if (this.profileData) {
                    this.notifyObservers(this.profileData);
                }

                return this.profileData;
            } else {
                console.error('Failed to fetch profile data');
                return null;
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
            return null;
        } finally {
            this.isLoading = false;
        }
    }

    // Update profile data and notify observers
    public async updateProfile(name: string): Promise<boolean> {
        console.log('Updating profile with name:', name);
        try {
            const response = await fetch('/api/account/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            if (response.ok) {
                console.log('Profile update API call successful');
                // Fetch the latest profile data to ensure consistency
                await this.fetchProfileData();

                // Trigger session refresh to update NextAuth session data
                this.triggerSessionRefresh();

                return true;
            }
            console.error('Profile update API call failed');
            return false;
        } catch (error) {
            console.error('Error updating profile:', error);
            return false;
        }
    }

    // Get current profile data
    public getProfileData(): ProfileData | null {
        return this.profileData;
    }
}

// Export the singleton instance
export const userProfileService = UserProfileService.getInstance();

// React hook for consuming the user profile service
export function useUserProfile() {
    const { update: updateSession } = useSession(); // Removed unused session variable
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Register session refresh callback
    useEffect(() => {
        const handleSessionRefresh = async () => {
            console.log('Session refresh triggered, updating session');
            // Force NextAuth to update the session from the server with proper async handling
            try {
                await updateSession();
                console.log('Session updated successfully');
            } catch (error) {
                console.error('Error updating session:', error);
            }
        };

        // Return the unsubscribe function directly
        return userProfileService.registerSessionRefresh(handleSessionRefresh);
    }, [updateSession]);

    useEffect(() => {
        const componentId = Math.random().toString(36).substring(7);
        console.log(`useUserProfile hook initialized in component: ${componentId}`);

        setIsLoading(true);

        // Get initial data if available
        const currentData = userProfileService.getProfileData();
        if (currentData) {
            console.log(`Component ${componentId} received initial data:`, currentData);
            setProfileData(currentData);
            setIsLoading(false);
        }

        // Create a function that we'll use as our observer
        const handleProfileUpdate = (data: ProfileData) => {
            console.log(`Component ${componentId} received profile update:`, data);
            // Always create a new object to ensure state update
            setProfileData({...data});
            setIsLoading(false);
        };

        // Subscribe to future updates and return the unsubscribe function directly
        const unsubscribe = userProfileService.subscribe(handleProfileUpdate);

        // Always try to fetch fresh data when component mounts
        console.log(`Component ${componentId} requesting fresh data`);
        void userProfileService.fetchProfileData()
            .finally(() => setIsLoading(false));

        // Cleanup subscription when component unmounts
        return unsubscribe;
    }, []);

    return {
        profile: profileData,
        isLoading,
        updateName: async (name: string) => {
            console.log('updateName called with:', name);
            return await userProfileService.updateProfile(name);
        }
    };
}