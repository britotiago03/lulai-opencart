// src/components/HomePage.tsx
"use client";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CTASection } from "@/components/home/CTASection";

export const HomePage = () => {
    return (
        <>
            <HeroSection />
            <FeaturesSection />
            <CTASection />
        </>
    );
};