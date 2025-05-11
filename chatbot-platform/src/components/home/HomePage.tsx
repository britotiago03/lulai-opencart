"use client";
import { HeroSection } from "@/components/marketing/HeroSection";
import { FeatureSection, FeatureShowcase } from "@/components/marketing/FeatureSection";
import { ProcessSection, IntegrationSection } from "@/components/marketing/ProcessSection";
import { CTASection, NewsletterSection, ChatWidget } from "@/components/marketing/CTASection";

export const HomePage = () => {
    return (
        <>
            {/* Hero Section */}
            <HeroSection />

            {/* Feature Section */}
            <FeatureSection />

            {/* Process Section */}
            <ProcessSection />

            {/* Feature Showcase */}
            <FeatureShowcase />

            {/* Integration Section */}
            <IntegrationSection />

            {/* CTA Section */}
            <CTASection />

            {/* Newsletter Section */}
            <NewsletterSection />

            {/* Chat Widget Demo */}
            <ChatWidget />
        </>
    );
};