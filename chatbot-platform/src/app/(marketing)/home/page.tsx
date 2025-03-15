// src/app/(marketing)/home/page.tsx
import { HeroSection } from "@/components/marketing/HeroSection";
import { FeatureSection, FeatureShowcase } from "@/components/marketing/FeatureSection";
import { ProcessSection, IntegrationSection } from "@/components/marketing/ProcessSection";
import { CTASection, NewsletterSection, ChatWidget } from "@/components/marketing/CTASection";

export default function HomePage() {
    return (
        <div className="flex flex-col min-h-screen">
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
        </div>
    );
}