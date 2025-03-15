// src/app/(marketing)/features/page.tsx
import { Check } from 'lucide-react';
import { CTASection, ChatWidget } from '@/components/marketing/CTASection';

export default function FeaturesPage() {
    return (
        <div>
            {/* Hero Section */}
            <section className="relative bg-primary text-primary-foreground py-20">
                <div className="absolute inset-0 overflow-hidden">
                    <svg className="absolute inset-0 h-full w-full" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold mb-4">Features</h1>
                        <div className="w-24 h-1 bg-primary-foreground mx-auto mb-10"></div>
                        <h2 className="text-4xl font-bold mb-6">Our Core Features</h2>
                        <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
                            Unlock new possibilities for your retail business with LuIAI's innovative AI solutions. Our
                            core features enable you to deliver personalized customer experiences, streamline
                            operations, and gain actionable insights for sustainable growth.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="flex items-center">
                            <svg className="w-6 h-6 text-primary-foreground mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-medium">AI Model Agnostic</span>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-6 h-6 text-primary-foreground mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-medium">Omnichannel Support</span>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-6 h-6 text-primary-foreground mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-medium">Active Operational AI Agent</span>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-6 h-6 text-primary-foreground mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-medium">Easy Integration</span>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-6 h-6 text-primary-foreground mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-medium">AI-Agent Customization</span>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-6 h-6 text-primary-foreground mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-medium">Detailed Analytics</span>
                        </div>
                    </div>

                    <div className="mt-16 text-center">
                        <a
                            href="/auth/signup"
                            className="inline-flex items-center bg-background text-foreground px-6 py-3 rounded-md hover:bg-muted transition-colors"
                        >
                            Sign Up for the Beta
                            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </a>
                    </div>
                </div>
            </section>

            {/* Feature Showcase Section */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    {/* Feature 1 */}
                    <div className="flex flex-col md:flex-row items-center mb-24">
                        <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0">
                            <h3 className="text-3xl font-bold mb-4">Personalized Customer Experience</h3>
                            <p className="text-muted-foreground mb-6">
                                Deliver tailored interactions that make every customer feel understood and valued. Our AI learns
                                from each interaction to provide increasingly relevant recommendations and assistance.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                    <span>Customer behavior analysis</span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                    <span>Intelligent product recommendations</span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                    <span>Contextual response generation</span>
                                </li>
                            </ul>
                        </div>
                        <div className="md:w-1/2 bg-muted rounded-lg p-6">
                            <div className="rounded-lg overflow-hidden shadow-xl border border-border">
                                <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center">
                                    <div className="flex space-x-2 mr-auto">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <span className="text-sm">Customer Chat</span>
                                </div>
                                <div className="bg-card p-4">
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
                                            <p className="text-sm">Here are some images of the Comfort Lounge Chair in red. It features the same ergonomic design with our premium fabric in a vibrant red tone.</p>
                                            <div className="mt-2 grid grid-cols-2 gap-2">
                                                <div className="bg-muted h-20 rounded"></div>
                                                <div className="bg-muted h-20 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex flex-col md:flex-row-reverse items-center mb-24">
                        <div className="md:w-1/2 md:pl-12 mb-8 md:mb-0">
                            <h3 className="text-3xl font-bold mb-4">Actionable Analytics & Insights</h3>
                            <p className="text-muted-foreground mb-6">
                                Gain valuable information about your customers' preferences, common questions, and purchasing behavior.
                                Turn these insights into actionable strategies to improve your offerings and boost sales.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                    <span>Comprehensive dashboards</span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                    <span>Trend identification</span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                    <span>Customer feedback analysis</span>
                                </li>
                            </ul>
                        </div>
                        <div className="md:w-1/2 bg-muted rounded-lg p-6">
                            <div className="bg-card rounded-lg p-4 shadow-xl border border-border">
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
                                <div className="h-40 bg-muted rounded-lg mb-2">
                                    {/* Placeholder for chart */}
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        Conversation Trends Chart
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0">
                            <h3 className="text-3xl font-bold mb-4">24/7 Customer Support</h3>
                            <p className="text-muted-foreground mb-6">
                                Provide round-the-clock assistance to your customers without increasing your staffing costs.
                                Our AI handles routine inquiries, freeing your team to focus on more complex customer needs.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                    <span>Instant response to customer inquiries</span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                    <span>Seamless human handoff for complex issues</span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                    <span>Multilingual support capabilities</span>
                                </li>
                            </ul>
                        </div>
                        <div className="md:w-1/2 bg-muted rounded-lg p-6">
                            <div className="bg-card rounded-lg overflow-hidden shadow-xl border border-border">
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
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <CTASection />

            {/* Chat Widget Demo */}
            <ChatWidget />
        </div>
    );
}