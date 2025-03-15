// src/app/(marketing)/page.tsx
import { redirect } from 'next/navigation';

export default function MarketingIndexPage() {
    // Redirect from /marketing to /home
    redirect('/home');
}