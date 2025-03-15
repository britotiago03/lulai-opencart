// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
    // Redirect from root to marketing home
     // redirect('/dashboard');
     redirect('/home');
}