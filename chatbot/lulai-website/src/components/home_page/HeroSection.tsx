import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const HeroSection = () => {
    return (
        <section
            className="flex flex-col justify-between items-left xl:pt-24 lg:pt-14 px-5 md:mx-4 lg:mx-10 xl:mx-auto max-w-7xl grid-cols-3 lg:mb-60 max-lg:pt-12"
            id="home"
        >
            <div className="hidden lg:flex absolute top-0 right-0 z-5 w-[600px] xl:w-[700px] select-none">
                <Image
                    src="/assets/home_page/hero_section/hero-section-background-asset-1.png"
                    alt="Background"
                    width={700}
                    height={0}
                    priority
                />
            </div>
            <div className="hidden md:flex absolute z-10 xl:top-[135px] xl:right-[0px] 2xl:right-[100px] md:right-[0px] md:top-[300px] select-none lg:right-[0px] lg:top-[100px]">
                <Image
                    src="/assets/home_page/hero_section/hero-section-background-asset-2.png"
                    alt="Inbox-Example-Essentials"
                    width={300}
                    height={0}
                    priority
                />
            </div>
            <div className="hidden md:flex absolute z-10 xl:top-[135px] xl:right-[350px] 2xl:right-[450px] md:right-[40px] md:top-[190px] select-none lg:right-[300px] lg:top-[120px]">
                <Image
                    src="/assets/home_page/hero_section/hero-section-background-asset-5.png"
                    alt="New-get-10%-off"
                    width={200}
                    height={0}
                    priority
                />
            </div>
            <div className="flex absolute top-0 -left-12 -z-5 w-[300px] md:w-[900px] select-none">
                <Image
                    src="/assets/home_page/hero_section/hero-section-background-asset-3.png"
                    alt="Background-Lines"
                    width={700}
                    height={0}
                    priority
                />
            </div>
            <div className="hidden absolute bottom-0 md:left-[100px] z-5 w-24 select-none">
                <Image
                    src="/assets/home_page/hero_section/hero-section-background-asset-4.png"
                    alt="Background-Circles"
                    width={96}
                    height={0}
                />
            </div>
            <div className="hidden lg:flex absolute top-[300px] xl:right-[250px] z-20 2xl:right-[350px] w-[500px] right-28 select-none lg:right-[150px]">
                <Image
                    src="/assets/home_page/hero_section/hero-section-background-person-asset.png"
                    alt="AI-Powered Expert"
                    width={500}
                    height={0}
                    priority
                />
            </div>
            {/* COLUMN LEFT */}
            <div className="max-w-xl mb-8 md:mb-0 text-center md:text-left z-50 justify-start max-md:mx-auto">
                <div className="mb-10">
                    <h1 className="font-sans text-5xl lg:text-6xl font-semibold mb-6 bg-gradient-to-r from-black via-gray-500 to-black bg-clip-text text-transparent">
                        We Put AI in Retail
                    </h1>
                    <h3 className="font-sans font-medium text-2xl lg:text-3xl">
                        Create, Train and Deploy Your Bespoke AI Store Agent.
                    </h3>
                </div>
                <p className="font-sans text-lg xl:text-xl font-normal mb-6 text-zinc-500 md:w-[450px] lg:w-full">
                    Empower your online or physical store with an active operational AI
                    agent that delivers personalized experiences, offers 24/7 intelligent
                    customer service, automates routine tasks, and provides actionable
                    insights to elevate satisfaction and drive sustained sales growth.
                </p>
                <div className="flex justify-start">
                    <Link
                        href={`/service`}
                        className="flex items-center bg-black text-white font-medium rounded-lg px-4 md:px-6 py-2 hover:bg-gray-700 transition duration-300 mx-auto md:mx-0 shadow-md group font-sans text-sm lg:text-base"
                    >
                        Try Our AI Store Agent in Beta—Enhance Your Business Today
                        <ArrowUpRight className="ml-2" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
