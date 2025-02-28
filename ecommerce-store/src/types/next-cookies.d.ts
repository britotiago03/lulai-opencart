// types/next-cookies.d.ts
declare module 'next/headers' {
    export function cookies(): {
        get(name: string): { name: string; value: string } | undefined;
        getAll(): { name: string; value: string }[];
        has(name: string): boolean;
        set(name: string, value: string, options?: {
            domain?: string;
            expires?: Date;
            httpOnly?: boolean;
            maxAge?: number;
            path?: string;
            sameSite?: 'strict' | 'lax' | 'none';
            secure?: boolean;
        }): void;
        delete(name: string): void;
    };
}