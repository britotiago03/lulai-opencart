'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';

const ServicePage = () => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const router = useRouter();

    const handleContinue = () => {
        if (selectedOption === 'webscrape') {
            router.push('/webscraper');
        } else if (selectedOption === 'jsonupload') {
            router.push('/jsonupload');
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-black via-gray-600 to-black px-4 py-16 text-white">
                <h1 className="text-5xl font-bold mb-6 text-center max-w-[1000px]">
                    Create a{' '}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 via-white to-gray-400">
                        Custom AI Agent
                    </span>{' '}
                    for Your Website in Minutes
                </h1>
                <p className="font-sans text-lg text-white/80 opacity-80 mb-10 text-center max-w-3xl">
                    In This Demo LulAI Agent will train itself on your data and
                    automatically start handling customer queries, automate customer
                    engagement, support and more.
                </p>

                <div className="flex flex-col items-center w-full max-w-3xl">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        How would you like to train your AI agent?
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10">
                        <button
                            onClick={() => setSelectedOption('webscrape')}
                            className={`
                                p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center text-center
                                ${selectedOption === 'webscrape'
                                ? 'border-white bg-white/10'
                                : 'border-gray-500 hover:border-gray-300'
                            }
                            `}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                            </svg>
                            <h3 className="text-xl font-bold mb-2">Web Scraping</h3>
                            <p className="text-sm text-gray-300">
                                Train your AI by providing a website URL. Our system will automatically extract and learn from the content.
                            </p>
                        </button>

                        <button
                            onClick={() => setSelectedOption('jsonupload')}
                            className={`
                                p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center text-center
                                ${selectedOption === 'jsonupload'
                                ? 'border-white bg-white/10'
                                : 'border-gray-500 hover:border-gray-300'
                            }
                            `}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            <h3 className="text-xl font-bold mb-2">JSON Upload</h3>
                            <p className="text-sm text-gray-300">
                                Upload structured JSON data to train your AI agent with specific product information.
                            </p>
                        </button>
                    </div>

                    <div className="flex justify-center mt-4">
                        {selectedOption && (
                            <button
                                onClick={handleContinue}
                                className="relative bg-black text-white hover:text-black font-semibold py-3 px-8 rounded-full overflow-hidden transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-500 hover:via-white hover:to-gray-500"
                            >
                                <span className="relative z-10 duration-300">
                                    Continue to {selectedOption === 'webscrape' ? 'Web Scraping' : 'JSON Upload'}
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                <p className="mt-10 text-sm text-gray-400">No credit card required</p>
            </div>
        </>
    );
};

export default ServicePage;