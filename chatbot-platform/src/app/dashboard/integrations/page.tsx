// src/app/dashboard/integrations/page.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Globe, MessageSquare, ShoppingCart, Code } from "lucide-react";

export default function IntegrationsPage() {
    const integrations = [
        {
            id: 'website',
            name: 'Website',
            description: 'Embed your chatbot on your website with a simple code snippet',
            icon: Globe,
            available: true
        },
        {
            id: 'shopify',
            name: 'Shopify',
            description: 'Add your chatbot to your Shopify store to assist customers',
            icon: ShoppingCart,
            available: true
        },
        {
            id: 'slack',
            name: 'Slack',
            description: 'Connect your chatbot to Slack for team communication',
            icon: MessageSquare,
            available: false
        },
        {
            id: 'api',
            name: 'API',
            description: 'Integrate directly with our REST API for custom solutions',
            icon: Code,
            available: true
        }
    ];

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Integrations</h1>
                <p className="text-gray-500 mt-1">Connect your chatbots to different platforms</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((integration) => {
                    const Icon = integration.icon;
                    return (
                        <Card
                            key={integration.id}
                            className={`${!integration.available ? 'opacity-60' : ''} cursor-pointer hover:shadow-md transition-shadow`}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start">
                                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                        <Icon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{integration.name}</h3>
                                        <p className="text-gray-500 text-sm mt-1">{integration.description}</p>

                                        {integration.available ? (
                                            <button className="mt-4 px-4 py-1 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm">
                                                Connect
                                            </button>
                                        ) : (
                                            <span className="mt-4 inline-block px-4 py-1 bg-gray-100 text-gray-500 rounded-md text-sm">
                        Coming soon
                      </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}