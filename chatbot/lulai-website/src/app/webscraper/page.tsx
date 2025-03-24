'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import { saveSessionAndRedirect } from '@/utils/session';
import { submitFormAndGetSessionId } from '@/utils/api';

const WebScraperPage = () => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();

  // Default URL for demo purposes
  const defaultUrl = 'https://voila.ca/categories/longo-s/WEB19100570?source=navigation';

  // URL validation
  useEffect(() => {
    try {
      new URL(url); // This will throw an error if the URL is invalid
      setIsValid(true);
    } catch {
      setIsValid(!!url && url === defaultUrl); // Consider the default URL as valid
    }
  }, [url, defaultUrl]);

  // SSE connection for progress updates
  useEffect(() => {
    if (sessionId) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      // Add the sessionId as a query parameter
      const apiUrl = new URL(`/api/scraper-progress?sessionId=${sessionId}`, backendUrl).toString();

      const eventSource = new EventSource(apiUrl);

      eventSource.onmessage = (event) => {
        try {
          const data = event.data.trim();
          if (data) {
            const jsonData = JSON.parse(data);
            if (jsonData.progress !== undefined) {
              setProgress(jsonData.progress);
            }

            if (jsonData.message) {
              if (jsonData.message === "Web scraping complete!") {
                setProgress(100);
                setIsLoading(false);
                saveSessionAndRedirect(sessionId, router, setError, "web-scrape");
                eventSource.close();
              } else if (jsonData.error) {
                setIsLoading(false);
                setError(jsonData.error);
                eventSource.close();
              }
            }
          }
        } catch (error) {
          console.error("Error parsing event data:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("EventSource error:", error);
        setError("Connection error. Please try again.");
        setIsLoading(false);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [sessionId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setError(null);

    // Submit URL for scraping
    const formData = new FormData();
    formData.append('url', url);

    try {
      const sessionId = await submitFormAndGetSessionId('/api/scrape-website', formData);
      setSessionId(sessionId);
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      setError('Error scraping website. Please try again.');
    }
  };

  const handleQuickStart = async () => {
    setUrl(defaultUrl);

    // Create a synthetic form event
    const syntheticEvent = {
      preventDefault: () => {}
    } as React.FormEvent;

    // Wait for the state update to complete
    setTimeout(async () => {
      try {
        await handleSubmit(syntheticEvent);
      } catch (error) {
        console.error('Quick start error:', error);
      }
    }, 100);
  };

  return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-black via-gray-600 to-black px-4 py-16 text-white">
          {!isLoading && (
              <>
                <h1 className="text-5xl font-bold mb-6 text-center">Web Scraping</h1>
                <p className="text-lg mb-8 text-center max-w-2xl">
                  Enter a website URL to train your AI agent. Our system will automatically extract and learn from the content.
                </p>

                <form onSubmit={handleSubmit} className="w-full max-w-md">
                  <div className="mb-6">
                    <Input
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="bg-gray-800 text-white border-gray-700 p-6 text-lg"
                    />
                  </div>

                  {error && (
                      <div className="w-full p-3 mb-6 bg-red-900/20 border border-red-700 rounded-lg text-center text-red-300">
                        {error}
                      </div>
                  )}

                  <div className="flex flex-col gap-4">
                    <Button
                        type="submit"
                        className={`
                                        py-3 rounded-full font-bold text-lg
                                        ${isValid ? 'bg-gradient-to-r from-green-800 to-green-600 hover:from-green-700 hover:to-green-500' : 'bg-gray-800 hover:bg-gray-700'}
                                    `}
                        disabled={!isValid}
                    >
                      Start Training
                    </Button>

                    <Button
                        type="button"
                        onClick={handleQuickStart}
                        className="py-3 rounded-full font-bold text-lg bg-blue-700 hover:bg-blue-600"
                    >
                      Quick Start with Voilà Demo
                    </Button>
                  </div>
                </form>
              </>
          )}

          {isLoading && (
              <div className="mt-4 w-full max-w-md">
                <p className="text-center text-2xl mb-4">Scraping Website Content</p>
                <p className="text-center text-lg mb-6">This may take a few minutes depending on the size of the website</p>
                <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-blue-500"
                      style={{ width: `${progress}%`, transition: 'width 0.2s linear' }}
                  />
                </div>
                <p className="text-center text-sm mt-2">{progress}%</p>
              </div>
          )}
        </div>
      </>
  );
};

export default WebScraperPage;