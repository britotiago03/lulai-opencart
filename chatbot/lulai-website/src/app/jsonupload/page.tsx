'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import { saveSessionAndRedirect } from '@/utils/session';
import { submitFormAndGetSessionId } from '@/utils/api';

const JsonUploadPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [sessionId, setSessionId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (sessionId) {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
            // Add the sessionId as a query parameter
            const apiUrl = new URL(`/api/upload?sessionId=${sessionId}`, backendUrl).toString();

            const eventSource = new EventSource(apiUrl);

            eventSource.onmessage = (event) => {
                try {
                    const data = event.data.trim(); // Trim to avoid extra spaces/newlines
                    if (data) {
                        const jsonData = JSON.parse(data); // Parse the data
                        if (jsonData.progress !== undefined) {
                            setProgress(jsonData.progress);
                        }

                        if (jsonData.message) {
                            if (jsonData.message === "Integration complete!") {
                                setProgress(100);
                                setIsLoading(false);
                                saveSessionAndRedirect(sessionId, router, setError);
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

        if (!file) {
            setError('Please select a JSON file');
            return;
        }

        setIsLoading(true);
        setProgress(0);
        setError(null);

        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('force', 'true');

        try {
            const sessionId = await submitFormAndGetSessionId('/api/upload', formData);
            setSessionId(sessionId);
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
            setError('Error uploading file. Please try again.');
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.json')) {
                setFile(droppedFile);
                setError(null);
            } else {
                setError('Please upload a JSON file');
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.name.endsWith('.json')) {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Please upload a JSON file');
                setFile(null);
            }
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-black via-gray-600 to-black px-4 py-16 text-white">
                {!isLoading && (
                    <>
                        <h1 className="text-5xl font-bold mb-6 text-center">Upload Your JSON File</h1>
                        <p className="text-lg mb-8 text-center max-w-2xl">
                            Upload a JSON file containing product data to train your AI agent. The file should include product information in the expected format.
                        </p>

                        <form onSubmit={handleSubmit} className="w-full max-w-md">
                            <div
                                className={`
                                    w-full h-60 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 mb-6
                                    transition-colors cursor-pointer
                                    ${dragActive ? 'border-white bg-white/10' : 'border-gray-500 hover:border-gray-300' }
                                    ${file ? 'bg-green-900/20 border-green-500' : '' }
                                `}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-upload')?.click()}
                            >
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {file ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-green-500 mb-3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <p className="font-medium mb-1">File selected:</p>
                                        <p className="text-green-400">{file.name}</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                        </svg>
                                        <p className="font-medium mb-1">Drag and drop your JSON file here</p>
                                        <p className="text-sm text-gray-400">or click to browse files</p>
                                    </>
                                )}
                            </div>

                            {error && (
                                <div className="w-full p-3 mb-6 bg-red-900/20 border border-red-700 rounded-lg text-center text-red-300">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className={`
                                    mt-4 w-full py-3 rounded-full font-bold text-lg
                                    ${file ? 'bg-gradient-to-r from-green-800 to-green-600 hover:from-green-700 hover:to-green-500' : 'bg-gray-800 hover:bg-gray-700'}
                                `}
                                disabled={!file}
                            >
                                Start Training
                            </Button>
                        </form>
                    </>
                )}

                {isLoading && (
                    <div className="mt-4 w-full max-w-md">
                        <p className="text-center text-2xl mb-4">Training Your AI Agent</p>
                        <p className="text-center text-lg mb-6">This may take a few minutes depending on the size of your data</p>
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

export default JsonUploadPage;