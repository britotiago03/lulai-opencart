// src/components/home/Layout.tsx
"use client";
import { ReactNode } from "react";
import { MarketingLayout } from "@/components/marketing/Layout";

type LayoutProps = {
    children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
    return (
        <MarketingLayout>
            {children}
        </MarketingLayout>
    );
};