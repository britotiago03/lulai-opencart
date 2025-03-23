// src/app/(marketing)/process/page.tsx
import { Download, Lightbulb, MessageSquare, Check } from 'lucide-react';
import { CTASection } from '@/components/marketing/CTASection';

export default function ProcessPage() {
    return (
        <div>
            {/* Header Section */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Process</h1>
                    <div className="w-24 h-1 bg-primary mx-auto mb-10"></div>
                    <h2 className="text-3xl font-bold mb-6">Engage In Conversations</h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto">
                        Experience how LuIAI enhances customer interactions in three easy steps. Our AI Store
                        Agent connects with your customers, grasps their needs, and offers personalized
                        assistance to improve their shopping experience and boost your sales.
                    </p>
                </div>
            </section>

            {/* Process Steps */}
            <section className="py-20 bg-muted">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Step 1 */}
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Input Processing</h3>
                            <p className="text-muted-foreground">
                                LuIAI learns from the information you provide to become an expert on
                                your offerings. It listens to your customers—whether they speak,
                                type, or click—and understands what they want using advanced
                                technology.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Continuous Learning</h3>
                            <p className="text-muted-foreground">
                                LuIAI expertly learns on a continuous feedback loop, improving with each
                                interaction. It adapts to customer behaviors and preferences, refining
                                its knowledge to offer increasingly relevant assistance.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Generate Response</h3>
                            <p className="text-muted-foreground">
                                LuIAI delivers powerful, personalized responses in real-time. It provides
                                valuable recommendations, answers questions accurately, and guides
                                customers effectively—enhancing their experience and driving your
                                sales growth.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <CTASection />

            {/* Integration Section */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl font-bold mb-6">Seamless Integration</h2>
                        <p className="text-muted-foreground">
                            Our AI Store Agent integrates easily with your existing systems and platforms. No complicated setup or technical expertise required.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="border border-border rounded-lg p-8">
                            <h3 className="text-xl font-bold mb-4">Quick Implementation</h3>
                            <p className="text-muted-foreground mb-6">
                                Get up and running in minutes, not weeks. Our platform is designed for easy setup and immediate value.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                    <span>Simple copy-paste installation</span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                    <span>No coding knowledge required</span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                    <span>Guided setup process</span>
                                </li>
                            </ul>
                        </div>

                        <div className="border border-border rounded-lg p-8">
                            <h3 className="text-xl font-bold mb-4">Works Everywhere</h3>
                            <p className="text-muted-foreground mb-6">
                                Connect with your customers across all touchpoints and platforms.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                    <span>Website and mobile integration</span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                    <span>Social media platforms</span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                    <span>E-commerce platform connectors</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}