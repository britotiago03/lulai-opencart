import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';

// This ensures all pages in the marketing route group have the Header and Footer components
export function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}