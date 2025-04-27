'use client';

import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SettingsTab {
    id: string;
    label: string;
    content: ReactNode;
}

interface SettingsLayoutProps {
    title: string;
    description: string;
    tabs: SettingsTab[];
    footer?: ReactNode;
}

export default function SettingsLayout({
                                           title,
                                           description,
                                           tabs,
                                           footer
                                       }: SettingsLayoutProps) {
    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-gray-400 mt-1">{description}</p>
            </div>

            <Tabs defaultValue={tabs[0]?.id} className="w-full">
                <TabsList className="mb-6 bg-[#1b2539]">
                    {tabs.map(tab => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="data-[state=active]:bg-[#232b3c]"
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {tabs.map(tab => (
                    <TabsContent key={tab.id} value={tab.id}>
                        {tab.content}
                    </TabsContent>
                ))}
            </Tabs>

            {footer}
        </div>
    );
}