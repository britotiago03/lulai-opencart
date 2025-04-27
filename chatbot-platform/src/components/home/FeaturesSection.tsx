// src/components/home/FeaturesSection.tsx
"use client";
import { useTheme } from "@/components/ThemeProvider";
import React from "react";

type FeatureProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
    bgColor: string;
    textColor: string;
};

const Feature = ({ icon, title, description, bgColor, textColor }: FeatureProps) => {
    const { theme } = useTheme();

    return (
        <div className={`${theme === 'dark' ? 'bg-[#1b2539]' : 'bg-white shadow-md'} p-6 rounded-lg`}>
            <div className={`${bgColor} w-12 h-12 rounded-full flex items-center justify-center mb-4`}>
                <div className={`w-6 h-6 ${textColor}`}>{icon}</div>
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{description}</p>
        </div>
    );
};

export const FeaturesSection = () => {
    // No need to declare theme if it's not being used in this component
    // The Feature component has its own useTheme hook

    const features = [
        {
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
            ),
            title: "Smart Conversations",
            description: "Our AI understands natural language and provides context-aware responses to customer queries.",
            bgColor: "bg-blue-600/20",
            textColor: "text-blue-500",
        },
        {
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
            ),
            title: "Product Catalog Integration",
            description: "Seamlessly connect your product catalog to allow chatbot to recommend products and answer questions.",
            bgColor: "bg-purple-600/20",
            textColor: "text-purple-500",
        },
        {
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
            ),
            title: "Detailed Analytics",
            description: "Track performance, monitor customer satisfaction, and gain insights from conversation analytics.",
            bgColor: "bg-green-600/20",
            textColor: "text-green-500",
        },
    ];

    return (
        <section id="features" className="py-16">
            <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <Feature
                        key={index}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        bgColor={feature.bgColor}
                        textColor={feature.textColor}
                    />
                ))}
            </div>
        </section>
    );
};