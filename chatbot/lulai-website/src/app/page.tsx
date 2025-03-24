import HeroSection from '@/components/home_page/HeroSection';
import ProcessSection from '@/components/home_page/ProcessSection';
import FeaturesSection from '@/components/home_page/FeaturesSection';
import Footer from '@/components/footer/index';
import Header from '@/components/header/index';

export default function Home() {
  return (
      <section>
        <Header />
        <div id="home">
          <HeroSection />
        </div>
        <ProcessSection />
        <FeaturesSection />
        <Footer />
      </section>
  );
}