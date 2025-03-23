// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// User roles
export type UserRole = 'admin' | 'user';

// User type
export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    companyName?: string;
    industry?: string;
}

// Auth context type
interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAdmin: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => {},
    logout: () => {},
    isAdmin: false,
});

// Auth provider props
interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    // Check if user is authenticated on initial load
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // This would be a real API call in production
                // For now, we'll simulate with localStorage or a mock
                const storedUser = localStorage.getItem('user');

                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Auth check error:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Login function
    const login = async (email: string, password: string) => {
        try {
            setLoading(true);

            // This would be a real API call in production
            // For now, we'll simulate successful login with mock data

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock different users based on email
            let mockUser: User;

            if (email.includes('admin')) {
                mockUser = {
                    id: '1',
                    name: 'Admin User',
                    email: email,
                    role: 'admin'
                };
            } else {
                mockUser = {
                    id: '2',
                    name: 'Regular User',
                    email: email,
                    role: 'user',
                    companyName: 'Test Company',
                    industry: 'retail'
                };
            }

            // Set user in state and localStorage
            setUser(mockUser);
            localStorage.setItem('user', JSON.stringify(mockUser));

            // Redirect based on role
            if (mockUser.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw new Error('Login failed');
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        router.push('/auth/login');
    };

    // Calculate if user is admin
    const isAdmin = user?.role === 'admin';

    // Provide auth context
    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use auth context
export function useAuth() {
    return useContext(AuthContext);
}

// HOC to protect routes based on role
export function withRoleProtection(Component: React.ComponentType, requiredRole: UserRole | 'any') {
    return function ProtectedRoute(props: any) {
        const { user, loading, isAdmin } = useAuth();
        const router = useRouter();
        const pathname = usePathname();

        useEffect(() => {
            // Check authentication and role when component mounts
            if (!loading) {
                // Not authenticated
                if (!user) {
                    router.push(`/auth/login?returnUrl=${pathname}`);
                    return;
                }

                // Authenticated but wrong role
                if (requiredRole !== 'any' && user.role !== requiredRole) {
                    // Redirect admin to admin dashboard
                    if (user.role === 'admin' && pathname.startsWith('/dashboard')) {
                        router.push('/admin');
                        return;
                    }

                    // Redirect user to user dashboard
                    if (user.role === 'user' && pathname.startsWith('/admin')) {
                        router.push('/dashboard');
                        return;
                    }
                }
            }
        }, [loading, user, router, pathname]);

        // Loading state
        if (loading) {
            return <div className="flex items-center justify-center h-screen">Loading...</div>;
        }

        // Not authenticated or wrong role
        if (!user || (requiredRole !== 'any' && user.role !== requiredRole)) {
            return null; // Will be redirected by the useEffect
        }

        // Render the component with all props
        return <Component {...props} />;
    };
}