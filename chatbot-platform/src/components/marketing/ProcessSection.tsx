import { Download, Lightbulb, MessageSquare, Check } from 'lucide-react';

interface ProcessStepProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    number: number;
}

function ProcessStep({ title, description, icon, number }: ProcessStepProps) {
    return (
        <div className="text-center relative">
            <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4">
                    {icon}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold">
                    {number}
                </div>
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}

export function ProcessSection() {
    return (
        <section className="py-20 bg-muted relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                    <defs>
                        <pattern id="diagonalPattern" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
                            <rect width="100%" height="100%" fill="none"/>
                            <path d="M-10,10 L30,10" stroke="currentColor" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#diagonalPattern)" />
                </svg>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                    <p className="text-muted-foreground">
                        Our simple three-step process helps you quickly set up, train, and deploy your AI retail assistant.
                        No technical expertise required.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <ProcessStep
                        title="Input Processing"
                        description="LuIAI learns from your product catalog and customer interactions to become an expert on what you offer."
                        icon={<Download className="h-6 w-6" />}
                        number={1}
                    />
                    <ProcessStep
                        title="Continuous Learning"
                        description="Our AI constantly improves through ongoing conversations, adapting to your customers' needs."
                        icon={<Lightbulb className="h-6 w-6" />}
                        number={2}
                    />
                    <ProcessStep
                        title="Generate Response"
                        description="Deliver personalized, real-time assistance that guides customers and boosts your sales."
                        icon={<MessageSquare className="h-6 w-6" />}
                        number={3}
                    />
                </div>

                <div className="flex justify-center mt-16">
                    <a
                        href="/process"
                        className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                    >
                        Learn more about our process
                        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}

export function IntegrationSection() {
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold mb-6">Seamless Integration</h2>
                    <p className="text-muted-foreground">
                        Our AI Store Agent integrates easily with your existing systems and platforms. No complicated setup or technical expertise required.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
    );
}