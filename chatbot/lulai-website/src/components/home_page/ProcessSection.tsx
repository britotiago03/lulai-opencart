'use client';

import React, { useState } from 'react';
import Image from 'next/image';

type StaticImageData = {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
};

type ProcessStep = {
  id: number;
  title: string;
  description: string;
  blackAsset: StaticImageData | string;
  whiteAsset: StaticImageData | string;
};

const TrainingProcess: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const processSteps: ProcessStep[] = [
    {
      id: 1,
      title: 'Input Processing',
      description:
        'LulAI learns from the information you provide to become an expert on your offerings. It listens to your customers—whether they speak, type, or click—and understands what they want using advanced technology.',
      blackAsset:
        '/assets/home_page/process_section/black/process-section-black-asset-1.png',
      whiteAsset:
        '/assets/home_page/process_section/white/process-section-white-asset-1.png',
    },
    {
      id: 2,
      title: 'Continuous Learning',
      description:
        'LulAI expertly learns on a continuous feedback loop, improving with each interaction. It adapts to customer behaviors and preferences, refining its knowledge to offer increasingly relevant assistance.',
      blackAsset:
        '/assets/home_page/process_section/black/process-section-black-asset-2.png',
      whiteAsset:
        '/assets/home_page/process_section/white/process-section-white-asset-2.png',
    },
    {
      id: 3,
      title: 'Generate Response',
      description:
        'LulAI delivers powerful, personalized responses in real-time. It provides valuable recommendations, answers questions accurately, and guides customers effectively—enhancing their experience and driving your sales growth.',
      blackAsset:
        '/assets/home_page/process_section/black/process-section-black-asset-3.png',
      whiteAsset:
        '/assets/home_page/process_section/white/process-section-white-asset-3.png',
    },
  ];

  return (
    <section
      className="relative z-0 pt-24 mb-24 bg-no-repeat bg-cover"
      id="process-section"
    >
      <section className="max-w-7xl mx-auto relative z-20">
        {/* HEADER */}
        <div className="flex flex-col mb-8 md:mb-24">
          <div className="flex items-center my-2 justify-center">
            <hr className="w-5 md:w-12 border-1 md:border-2 border-black mr-5" />
            <h1 className="flex font-serif text-[25px] font-normal bg-gradient-to-r from-black via-gray-500 to-black bg-clip-text text-transparent">
              Process
            </h1>
            <hr className="w-5 md:w-12 border-1 md:border-2 border-black ml-5" />
          </div>
          <div className="flex flex-col items-center my-2 justify-center text-center px-5">
            <h2
              className="text-4xl md:text-6xl mb-4 font-medium bg-gradient-to-r from-black via-gray-500 to-black bg-clip-text text-transparent"
              style={{ lineHeight: '1.2' }}
            >
              Engage In Conversations
            </h2>
            <p className="font-sans text-lg text-[#737373] leading-6 md:w-3/5 text-center">
              Experience how LulAI enhances customer interactions in three easy steps. Our AI
              Store Agent connects with your customers, grasps their needs, and offers
              personalized assistance to improve their shopping experience and boost your sales
            </p>
          </div>
        </div>
        {/* MAIN CONTENT */}
        <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-5 px-auto cursor-pointer">
          {processSteps.map((step, index) => (
            <div
              key={step.id}
              className={`hover:bg-black hover:text-white p-10 rounded-xl duration-300 transition-all ease-in-out hover:shadow-xl ${
                index === 2 && 'md:col-span-2'
              } w-full lg:col-span-1`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Image
                src={
                  typeof step.whiteAsset === 'string' && hoveredIndex === index
                    ? step.whiteAsset
                    : typeof step.blackAsset === 'string'
                    ? step.blackAsset
                    : hoveredIndex === index
                    ? (step.whiteAsset as StaticImageData).src
                    : (step.blackAsset as StaticImageData).src
                }
                alt={step.title}
                width={
                  typeof step.blackAsset === 'string'
                    ? 75 // Fallback width if it's a string (you can adjust this value)
                    : (step.blackAsset as StaticImageData).width
                }
                height={
                  typeof step.blackAsset === 'string'
                    ? 75 // Fallback height if it's a string (you can adjust this value)
                    : (step.blackAsset as StaticImageData).height
                }
                className={`mb-6 duration-300 ease-in-out transform rounded-xl shadow-lg select-none ${
                  hoveredIndex === index
                    ? 'opacity-100 scale-105'
                    : 'opacity-100 scale-100'
                }`}
              />

              <h1 className="font-sans text-2xl font-semibold mb-6">
                {step.title}
              </h1>
              <p className="font-sans opacity-70 leading-8 text-lg">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
};

export default TrainingProcess;
