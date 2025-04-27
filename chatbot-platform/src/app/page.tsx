// src/app/page.tsx
"use client";

import { Layout } from "@/components/home/Layout";
import { HomePage } from "@/components/home/HomePage";

export default function Page() {
    // Simply render the home page without any auth redirects
    return (
        <Layout>
            <HomePage />
        </Layout>
    );
}