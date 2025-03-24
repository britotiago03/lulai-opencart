'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

// Environment variable for Python server
const PYTHON_API_URL = typeof window === 'undefined'
    ? 'http://python-api:8000'  // Server-side (container-to-container)
    : process.env.NEXT_PUBLIC_PYTHON_SERVER_URL || 'http://localhost:8000';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const AiAgentPage = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessingTTS, setIsProcessingTTS] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [sessionData, setSessionData] = useState<any>(null);
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [email, setEmail] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('sessionId');
    const welcomeMessageRef = useRef<boolean>(false);
    

    const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);

    // Audio recording refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);

    // TTS Queue and Audio Context
    const ttsQueueRef = useRef<string[]>([]);
    const isPlayingTTSRef = useRef<boolean>(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const [pendingAudio, setPendingAudio] = useState<{ content: string; index: number } | null>(null);

    // Initialize audio context
    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && !audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            // Cleanup on unmount
            return () => {
                stopSpeaking();
                if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                    try {
                        audioContextRef.current.close().catch(err => {
                            console.error('Error closing audio context:', err);
                        });
                    } catch (err) {
                        console.error('Error closing audio context on unmount:', err);
                    }
                }
            };
        } catch (error) {
            console.error('Error initializing audio context:', error);
        }
    }, []);

    useEffect(() => {
        const initSession = async () => {
            if (!sessionId) {
                router.push('/service'); // Redirect if no session ID
                return;
            }

            try {
                // Load session data
                const storedData = localStorage.getItem(`session_${sessionId}`);
                if (storedData) {
                    setSessionData(JSON.parse(storedData));

                    // Add welcome message
                    const welcomeMessage: Message = {
                        role: 'assistant',
                        content: 'Hello! I\'m your AI assistant trained on your product data. How can I help you today?',
                        timestamp: new Date()
                    };
                    setMessages([welcomeMessage]);

                    // Set flag to indicate that we need to play the welcome message
                    welcomeMessageRef.current = true;
                } else {
                    router.push('/service'); // Redirect if session data not found
                }
            } catch (error) {
                console.error('Error loading session:', error);
                router.push('/service');
            }
        };

        void initSession();
    }, [sessionId, router]);

    // Effect to play the welcome message after component is fully mounted
    /* useEffect(() => {
        if (messages.length > 0 && welcomeMessageRef.current && !isPlayingTTSRef.current) {
            welcomeMessageRef.current = false;

            // Play the welcome message
            const welcomeMessage = messages[0].content;
            void playMessageAudio(welcomeMessage, 0);
        }
    }, [messages]); */

    // Effect to handle audio playback when pendingAudio changes
useEffect(() => {
    if (pendingAudio) {
      playMessageAudio(pendingAudio.content, pendingAudio.index);
      setPendingAudio(null);
    }
  }, [pendingAudio]);

    // Get or create AudioContext
    const getAudioContext = (): AudioContext | null => {
        try {
            if (!audioContextRef.current || audioContextRef.current.state === "closed") {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            } else if (audioContextRef.current.state === "suspended") {
                void audioContextRef.current.resume();
            }
            return audioContextRef.current;
        } catch (error) {
            console.error('Error creating/resuming audio context:', error);
            return null;
        }
    };

    // Prefetch TTS audio
    const prefetchTTSAudio = async (text: string): Promise<ArrayBuffer> => {
        try {
            // Remove trailing slash if present in the URL
            const baseUrl = PYTHON_API_URL.endsWith('/')
                ? PYTHON_API_URL.slice(0, -1)
                : PYTHON_API_URL;

            const response = await fetch(`${baseUrl}/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: text }),
            });

            if (!response.ok) {
                console.error(`TTS request failed with status ${response.status}`);
                return new ArrayBuffer(0);
            }

            return await response.arrayBuffer();
        } catch (error) {
            console.error('Error fetching TTS audio:', error);
            // Return empty ArrayBuffer instead of throwing
            return new ArrayBuffer(0);
        }
    };

    // Function to play a complete message
    const playMessageAudio = async (message: string, index: number): Promise<void> => {
        // Stop any current audio before playing new one
        stopSpeaking();
    
        // Set initial speaking state
        setIsProcessingTTS(true);
        setSpeakingMessageIndex(index);
    
        try {
            const chunks = splitTextIntoChunks(message);
            if (chunks.length === 0) {
                setIsProcessingTTS(false);
                setSpeakingMessageIndex(null);
                return;
            }
    
            const audioContext = getAudioContext();
            if (!audioContext) {
                setIsProcessingTTS(false);
                setSpeakingMessageIndex(null);
                return;
            }
    
            isPlayingTTSRef.current = true;
            setIsSpeaking(true);
            setIsProcessingTTS(false);
    
            let currentChunkIndex = 0;
            let nextAudioPromise: Promise<ArrayBuffer> = prefetchTTSAudio(chunks[currentChunkIndex]);
    
            while (currentChunkIndex < chunks.length && isPlayingTTSRef.current) {
                const audioBuffer = await nextAudioPromise;
    
                // Prefetch next chunk if available
                if (currentChunkIndex < chunks.length - 1) {
                    nextAudioPromise = prefetchTTSAudio(chunks[currentChunkIndex + 1]);
                } else {
                    nextAudioPromise = Promise.resolve(new ArrayBuffer(0));
                }
    
                // Check if speaking was stopped
                if (!isPlayingTTSRef.current) break;
    
                // Decode and play current chunk
                let decodedBuffer: AudioBuffer | null = null;
                try {
                    decodedBuffer = await audioContext.decodeAudioData(audioBuffer.slice(0));
                } catch (err) {
                    console.error('Error decoding audio data for chunk:', currentChunkIndex, err);
                    currentChunkIndex++;
                    continue;
                }
    
                if (!decodedBuffer) {
                    currentChunkIndex++;
                    continue;
                }
    
                await new Promise<void>((resolve) => {
                    if (!isPlayingTTSRef.current || !audioContext) {
                        resolve();
                        return;
                    }
    
                    const source = audioContext.createBufferSource();
                    audioSourceRef.current = source;
                    source.buffer = decodedBuffer;
                    source.connect(audioContext.destination);
    
                    source.onended = () => {
                        if (audioSourceRef.current === source) {
                            audioSourceRef.current = null;
                        }
                        resolve();
                    };
    
                    source.start();
    
                    // Check for stop during playback
                    const checkInterval = setInterval(() => {
                        if (!isPlayingTTSRef.current) {
                            if (source.buffer) {
                                try {
                                    source.stop();
                                    audioSourceRef.current = null;
                                } catch (e) {
                                    // Ignore errors if already stopped
                                }
                            }
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                });
    
                currentChunkIndex++;
            }
        } catch (error) {
            console.error('TTS streaming playback error:', error);
        } finally {
            isPlayingTTSRef.current = false;
            setIsSpeaking(false);
            setIsProcessingTTS(false);
            setSpeakingMessageIndex(null);
            audioSourceRef.current = null;
        }
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (text: string = input): Promise<void> => {
        if (!text.trim()) return;
      
        const userMessage: Message = {
          role: 'user',
          content: text,
          timestamp: new Date()
        };
      
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
      
    
        try {
            // Call your API endpoint with the session ID and message
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    message: text
                }),
            });
    
            if (!response.ok) {
                console.error('Error response status:', response.status);
                setIsLoading(false);
                const errorMessage: Message = {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again later.',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
                return;
            }
    
            const data = await response.json();
    
            const aiMessage: Message = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date()
              };
          
              // Add the message and track the index for audio
              setMessages(prev => {
                const updatedMessages = [...prev, aiMessage];
                // Calculate the index based on the updated array
                const messageIndex = updatedMessages.length - 1;
                setPendingAudio({ content: data.response, index: messageIndex });
                return updatedMessages;
              });
    
            // Check for email prompt
            if (data.response.toLowerCase().includes('email') &&
                data.response.toLowerCase().includes('would you like this list sent to your email')) {
                setShowEmailInput(true);
            }
    
        } catch (error) {
            console.error('Error communicating with AI:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again later.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void handleSubmit();
        }
    };

    const startRecording = async (): Promise<void> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioChunksRef.current = [];

            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                // Create form data for upload
                const formData = new FormData();
                formData.append('file', audioBlob, 'recording.webm');

                try {
                    setIsListening(false);
                    setIsLoading(true);

                    // Remove trailing slash if present in the URL
                    const baseUrl = PYTHON_API_URL.endsWith('/')
                        ? PYTHON_API_URL.slice(0, -1)
                        : PYTHON_API_URL;

                    // Send to Whisper API
                    const response = await fetch(`${baseUrl}/whisper`, {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        console.error(`Whisper request failed with status ${response.status}`);
                        setIsLoading(false);
                        return;
                    }

                    const data = await response.json();

                    if (data.transcription) {
                        // Use the transcription as user input
                        await handleSubmit(data.transcription);
                    } else {
                        console.error('No transcription received');
                        setIsLoading(false);
                    }
                } catch (error) {
                    console.error('Error transcribing audio:', error);
                    setIsLoading(false);
                }

                // Clear audio chunks and release stream
                audioChunksRef.current = [];
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setIsListening(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopRecording();
        } else {
            void startRecording();
        }
    };

    const stopSpeaking = (): void => {
        // Clear TTS queue
        ttsQueueRef.current = [];

        // Signal that we want to stop speaking
        isPlayingTTSRef.current = false;

        // Stop current audio source if playing
        if (audioSourceRef.current) {
            try {
                audioSourceRef.current.stop();
                audioSourceRef.current = null;
            } catch (err) {
                // Ignore errors if already stopped
                console.error('Error stopping audio source:', err);
            }
        }

        setIsSpeaking(false);
        setIsProcessingTTS(false);
        setSpeakingMessageIndex(null);
    };

    const splitTextIntoChunks = (text: string, maxChunkSize: number = 150): string[] => {
        // Clean the text but preserve list structure
        const cleanText = text
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/[*_~`]/g, '')  // Remove markdown formatting characters
            .replace(/\s+/g, ' ')    // Normalize spaces
            .trim();
        
        // First split by lines to handle lists better
        const lines = cleanText.split(/\n+/);
        const chunks: string[] = [];
        
        for (const line of lines) {
            // Check if this is a list item (starts with number or bullet)
            const isListItem = /^\s*(\d+\.|[-*+•])\s+/.test(line);
            
            // If it's a list item, treat it as its own potential chunk
            if (isListItem) {
                // If the list item is very long, we may need to split it further
                if (line.length > maxChunkSize) {
                    // Split long list items by sentence boundaries
                    const sentences = line.split(/(?<=[.!?])\s+/);
                    let currentChunk = '';
                    
                    for (const sentence of sentences) {
                        if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
                            chunks.push(currentChunk.trim());
                            currentChunk = sentence;
                        } else {
                            currentChunk += (currentChunk ? ' ' : '') + sentence;
                        }
                    }
                    
                    if (currentChunk.length > 0) {
                        chunks.push(currentChunk.trim());
                    }
                } else {
                    // Add the list item as its own chunk (with a period at the end if needed)
                    const endsWithPunctuation = /[.!?]$/.test(line);
                    chunks.push(endsWithPunctuation ? line : line + '.');
                }
            } else {
                // Handle regular paragraph text - split by sentences
                const sentences = line.split(/(?<=[.!?])\s+/);
                let currentChunk = '';
                
                for (const sentence of sentences) {
                    // Handle greetings and short phrases
                    const isGreeting = /^(Hi|Hello|Hey|Certainly|Sure|Absolutely|Yes|No)!?$/i.test(sentence.trim());
                    
                    if (isGreeting || sentence.trim().length < 15) {
                        if (currentChunk.length + sentence.length <= maxChunkSize || currentChunk.length === 0) {
                            currentChunk += (currentChunk ? ' ' : '') + sentence;
                        } else {
                            chunks.push(currentChunk.trim());
                            currentChunk = sentence;
                        }
                    } else if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
                        chunks.push(currentChunk.trim());
                        currentChunk = sentence;
                    } else {
                        currentChunk += (currentChunk ? ' ' : '') + sentence;
                    }
                }
                
                if (currentChunk.length > 0) {
                    chunks.push(currentChunk.trim());
                }
            }
        }
        
        // Add periods to the end of chunks that don't end with punctuation
        return chunks.map(chunk => {
            const trimmed = chunk.trim();
            if (trimmed.length > 0 && !(/[.!?:;]$/.test(trimmed))) {
                return trimmed + '.';
            }
            return trimmed;
        });
    };
    

    const sendEmail = async (emailAddress: string): Promise<void> => {
        if (!emailAddress.includes('@')) {
            return; // Basic validation
        }
    
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    email: emailAddress,
                    // Find the last assistant message that contains product information
                    message: messages.filter(m => m.role === 'assistant')
                        .slice(-1)[0]?.content || ''
                }),
            });
    
            if (!response.ok) {
                console.error('Email error response status:', response.status);
                const errorMessage: Message = {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error sending the email. Please try again later.',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
                return;
            }
    
            // Add confirmation message
            const confirmationMessage: Message = {
                role: 'assistant',
                content: `Great! I've sent the product information to ${emailAddress}.`,
                timestamp: new Date()
              };
            
              setMessages(prev => {
                const updatedMessages = [...prev, confirmationMessage];
                const messageIndex = updatedMessages.length - 1;
                setPendingAudio({ content: confirmationMessage.content, index: messageIndex });
                return updatedMessages;
              });
    
            // Hide email input
            setShowEmailInput(false);
            setEmail('');
        } catch (error) {
            console.error('Error sending email:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Sorry, I encountered an error sending the email. Please try again later.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-r from-black via-gray-600 to-black px-4 py-16 text-white">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-4xl font-bold mb-6 text-center">
                        Your AI Agent{sessionData ? ` - ${sessionData.name || 'Assistant'}` : ''}
                    </h1>

                    {/* Chat area */}
                    <div className="bg-gray-900/70 rounded-lg p-4 mb-4 h-[60vh] overflow-y-auto">
                        {messages.map((message, idx) => (
                            <div
                                key={idx}
                                className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                            >
                                <Card className={`inline-block max-w-[80%] p-3 rounded-lg 
                                    ${message.role === 'user'
                                    ? 'bg-blue-700 text-white ml-auto'
                                    : 'bg-gray-800 text-white mr-auto'
                                }`}
                                >
                                    {message.role === 'assistant' ? (
                                        <div className="mb-1 prose prose-invert max-w-none">
                                            <ReactMarkdown>{message.content}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div className="mb-1">{message.content}</div>
                                    )}
                                    <div className="text-xs opacity-70">
                                        {message.timestamp.toLocaleTimeString()}
                                    </div>

                                    {message.role === 'assistant' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="mt-2 p-1 h-8"
                                            onClick={
                                                isProcessingTTS
                                                    ? undefined
                                                    : speakingMessageIndex === idx
                                                        ? stopSpeaking
                                                        : () => void playMessageAudio(message.content, idx)
                                            }
                                            disabled={isProcessingTTS || (isSpeaking && speakingMessageIndex !== idx)}
                                        >
                                            {isProcessingTTS && speakingMessageIndex === idx ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing
                                                </>
                                            ) : speakingMessageIndex === idx ? (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                                                    </svg>
                                                    Stop
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                                    </svg>
                                                    Speak
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </Card>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />

                        {isLoading && (
                            <div className="flex justify-center items-center my-4">
                                <div className="animate-pulse flex space-x-2">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Email input field that appears when AI asks about sending an email */}
                    {showEmailInput && (
                        <div className="bg-gray-800 p-4 rounded-lg mb-4">
                            <p className="mb-2">Enter your email address to receive the product list:</p>
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="bg-gray-700 text-white"
                                />
                                <Button
                                    onClick={() => void sendEmail(email)}
                                    disabled={!email.includes('@')}
                                    className="bg-green-600 hover:bg-green-500"
                                >
                                    Send
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowEmailInput(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Input area */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant={isListening ? "destructive" : "outline"}
                            onClick={toggleListening}
                            className="rounded-full p-2 h-10 w-10 flex-shrink-0"
                            disabled={isLoading}
                            title={isListening ? "Stop recording" : "Start recording"}
                        >
                            {isListening ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                                </svg>
                            )}
                        </Button>

                        <Input
                            type="text"
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                            onKeyDown={handleInputKeyDown}
                            placeholder={isListening ? "Listening..." : "Type your message..."}
                            disabled={isLoading || isListening}
                            className="bg-gray-800 text-white border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                        />

                        <Button
                            onClick={() => void handleSubmit()}
                            disabled={isLoading || !input.trim()}
                            className="bg-blue-700 hover:bg-blue-600 text-white rounded-full p-2 h-10 w-10 flex-shrink-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AiAgentPage;