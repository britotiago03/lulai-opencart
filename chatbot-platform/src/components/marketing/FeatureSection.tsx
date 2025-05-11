import { CheckCircle } from 'lucide-react';

interface FeatureProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

function Feature({ title, description, icon, color }: FeatureProps) {
    return (
        <div className="p-6 border border-border rounded-lg hover:shadow-md transition-shadow">
            <div className={`${color} p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4`}>
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}

export function FeatureSection() {
    const features = [
        {
            title: "AI Model Agnostic",
            description: "Works with multiple AI models to ensure you always have the best technology.",
            icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            color: "bg-blue-100 dark:bg-blue-900/30"
        },
        {
            title: "Omnichannel Support",
            description: "Deliver consistent experiences across all your customer touchpoints.",
            icon: (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
            ),
            color: "bg-green-100 dark:bg-green-900/30"
        },
        {
            title: "Active Operational AI Agent",
            description: "More than a chatbot - a proactive assistant that drives business outcomes.",
            icon: (
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            color: "bg-purple-100 dark:bg-purple-900/30"
        },
        {
            title: "Easy Integration",
            description: "Seamlessly integrates with your existing website and systems.",
            icon: (
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
            ),
            color: "bg-indigo-100 dark:bg-indigo-900/30"
        },
        {
            title: "AI-Agent Customization",
            description: "Tailor the AI to match your brand voice and business needs.",
            icon: (
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            ),
            color: "bg-yellow-100 dark:bg-yellow-900/30"
        },
        {
            title: "Detailed Analytics",
            description: "Gain insights into customer behavior and conversation patterns.",
            icon: (
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            color: "bg-red-100 dark:bg-red-900/30"
        }
    ];

    return (
        <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Core Features</h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto">
                        Unlock new possibilities for your retail business with LuIAI's innovative AI solutions.
                        Our powerful features help you deliver exceptional customer experiences.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {features.map((feature, index) => (
                        <Feature
                            key={index}
                            title={feature.title}
                            description={feature.description}
                            icon={feature.icon}
                            color={feature.color}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export function FeatureShowcase() {
    const showcaseItems = [
        {
            title: "Personalized Customer Experience",
            description: "Deliver tailored interactions that make every customer feel understood and valued. Our AI learns from each interaction to provide increasingly relevant recommendations and assistance.",
            features: [
                "Customer behavior analysis",
                "Intelligent product recommendations",
                "Contextual response generation"
            ],
            image: (
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-xl">
                    <div className="bg-primary p-3 text-primary-foreground flex items-center">
                        <div className="flex space-x-2 mr-auto">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <span className="text-sm">Customer Chat</span>
                    </div>
                    <div className="p-4">
                        <div className="flex mb-4">
                            <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                                <p className="text-sm">Do you have this in red?</p>
                            </div>
                        </div>
                        <div className="flex justify-end mb-4">
                            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 max-w-[80%]">
                                <p className="text-sm">Yes, we do have the Comfort Lounge Chair in red! It's currently in stock and ready to ship. Would you like to see some images of it in red?</p>
                            </div>
                        </div>
                        <div className="flex mb-4">
                            <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                                <p className="text-sm">Yes please!</p>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 max-w-[80%]">
                                <p className="text-sm">Here are some images of the Comfort Lounge Chair in red.</p>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <div className="bg-muted h-16 rounded"></div>
                                    <div className="bg-muted h-16 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            reversed: false
        },
        {
            title: "Actionable Analytics & Insights",
            description: "Gain valuable information about your customers' preferences, common questions, and purchasing behavior. Turn these insights into actionable strategies to improve your offerings and boost sales.",
            features: [
                "Comprehensive dashboards",
                "Trend identification",
                "Customer feedback analysis"
            ],
            image: (
                <div className="bg-card border border-border rounded-lg p-4 shadow-xl">
                    <div className="flex justify-between mb-6">
                        <h4 className="font-bold">Analytics Dashboard</h4>
                        <div className="text-sm text-muted-foreground">Last 30 days</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Total Conversations</div>
                            <div className="text-2xl font-bold">1,247</div>
                            <div className="text-xs text-green-500">↑ 12% from last month</div>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Conversion Rate</div>
                            <div className="text-2xl font-bold">23.5%</div>
                            <div className="text-xs text-green-500">↑ 5% from last month</div>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/20 p-4 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Avg. Engagement</div>
                            <div className="text-2xl font-bold">4.2m</div>
                            <div className="text-xs text-green-500">↑ 8% from last month</div>
                        </div>
                        <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Satisfaction Score</div>
                            <div className="text-2xl font-bold">4.8/5</div>
                            <div className="text-xs text-green-500">↑ 3% from last month</div>
                        </div>
                    </div>
                    <div className="h-32 bg-muted rounded-lg">
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            Conversation Trends Chart
                        </div>
                    </div>
                </div>
            ),
            reversed: true
        },
        {
            title: "24/7 Customer Support",
            description: "Provide round-the-clock assistance to your customers without increasing your staffing costs. Our AI handles routine inquiries, freeing your team to focus on more complex customer needs.",
            features: [
                "Instant response to customer inquiries",
                "Seamless human handoff for complex issues",
                "Multilingual support capabilities"
            ],
            image: (
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-xl">
                    <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
                        <div>
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                AI
                            </div>
                        </div>
                        <div className="text-sm">Online 24/7</div>
                    </div>
                    <div className="p-4">
                        <div className="mb-4">
                            <div className="text-center text-sm text-muted-foreground mb-2">Today, 2:45 AM</div>
                            <div className="flex mb-2">
                                <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                                    <p className="text-sm">I need to return an item I purchased yesterday. What's your return policy?</p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 max-w-[80%]">
                                    <p className="text-sm">I'd be happy to help with your return! You can return any item within 30 days of purchase for a full refund. Would you like me to send you a return shipping label?</p>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-border pt-4">
                            <input
                                type="text"
                                placeholder="Type your message here..."
                                className="w-full p-2 border border-border rounded-md bg-background"
                            />
                        </div>
                    </div>
                </div>
            ),
            reversed: false
        }
    ];

    return (
        <section className="py-20 bg-muted">
            <div className="container mx-auto px-4">
                {showcaseItems.map((item, index) => (
                    <div
                        key={index}
                        className={`flex flex-col ${item.reversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center mb-24 last:mb-0`}
                    >
                        <div className="md:w-1/2 md:px-8 mb-8 md:mb-0">
                            <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
                            <p className="text-muted-foreground mb-6">
                                {item.description}
                            </p>
                            <ul className="space-y-3">
                                {item.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="md:w-1/2 bg-muted rounded-lg p-4 sm:p-6">
                            {item.image}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}