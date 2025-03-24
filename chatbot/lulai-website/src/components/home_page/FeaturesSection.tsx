'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, SquareCheckBig } from 'lucide-react';
import Link from 'next/link';

const CoreFeatures: React.FC = () => {
  return (
      <section
          id="features-section"
          className="bg-black bg-no-repeat bg-cover bg-center sm:mb-96"
          style={{
            backgroundImage: `url('/assets/home_page/features_section/features-section-background.png')`,
          }}
      >
        <section className="mx-auto max-w-7xl text-white py-16 px-10 max-sm:flex-col sm:flex">
          {/* MAIN-CONTENT */}
          <section className="sm:w-3/5">
            {/* HEADER */}
            <div>
              <div className="flex items-center my-2">
                <hr className="w-5 md:w-12 border-1 md:border-2 border-white mr-5" />
                <h1 className="flex font-serif text-[25px] font-normal bg-gradient-to-r from-gray-400 via-white to-gray-400 bg-clip-text text-transparent">
                  Features
                </h1>
                <hr className="w-5 md:w-12 border-1 md:border-2 border-white ml-5" />
              </div>
              <div className="flex flex-col my-2 mb-5">
                <h2 className="text-6xl mb-4 font-medium bg-gradient-to-r flex from-gray-400 via-white to-gray-400 bg-clip-text text-transparent">
                  Our Core Features
                </h2>
                <p className="font-sans text-lg text-[#737373] leading-6">
                  Unlock new possibilities for your retail business with LulAI’s
                  innovative AI solutions. Our core features enable you to deliver
                  personalized customer experiences, streamline operations, and
                  gain actionable insights for sustainable growth.
                </p>
              </div>
            </div>
            {/* FEATURES */}
            <div className="mb-10 gap-y-5 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 text-sm">
              <div className="flex gap-2 w-fit">
                <SquareCheckBig />
                AI Model Agnostic
              </div>
              <div className="flex gap-2">
                <SquareCheckBig />
                Omnichannel Support
              </div>
              <div className="flex gap-2">
                <SquareCheckBig />
                Active Operational AI Agent
              </div>
              <div className="flex gap-2">
                <SquareCheckBig />
                Easy Integration
              </div>
              <div className="flex gap-2">
                <SquareCheckBig />
                AI-Agent Customization
              </div>
            </div>
            {/* BUTTON */}
            <div className="flex justify-start">
              <Link
                  href={`/service`}
                  className="flex items-center bg-white text-black font-medium rounded-lg px-4 md:px-6 py-2 hover:bg-gray-300 transition duration-300 shadow-md group font-sans text-md"
              >
                Sign Up for the Beta
                <ArrowUpRight className="ml-2 text-gray-700" />
              </Link>
            </div>
          </section>
          {/* ASSETS */}
          <section className="sm:w-2/5 relative">
            <Image
                src="/assets/home_page/features_section/features-section-asset-1.png"
                alt="Hey Oliver"
                className="absolute select-none max-sm:hidden sm:right-[200px] sm:pt-[20px] lg:right-[300px] 2xl:right-[100px]"
                width={100}
                height={300}
            />
            <Image
                src="/assets/home_page/features_section/features-section-asset-black-2.png"
                alt="RobotBlack"
                className="absolute select-none z-10 sm:hidden max-sm:hidden"
                width={100}
                height={300}
            />
            <Image
                src="/assets/home_page/features_section/features-section-asset-2.png"
                alt="RobotWhite"
                className="absolute select-none z-10 max-sm:hidden sm:right-[70px] sm:pt-[70px] lg:right-[150px] 2xl:right-[0px]"
                width={100}
                height={300}
            />
            <Image
                src="/assets/home_page/features_section/features-section-asset-3.png"
                alt="Message-Representation"
                className="absolute select-none sm:w-[350px] sm:right-[30px] sm:pt-[270px] lg:w-[400px] lg:right-[100px] 2xl:w-auto 2xl:right-[0px] 2xl:pt-[200px] max-sm:hidden"
                width={500}
                height={300}
            />
          </section>
        </section>
      </section>
  );
};

export default CoreFeatures;
