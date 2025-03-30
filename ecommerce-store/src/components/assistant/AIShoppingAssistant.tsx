'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import AudioService from '@/services/AudioService';
import AssistantService from '@/services/AssistantService';
import { Message } from '@/types/assistant';

/**
 * Main AI Shopping Assistant component
 */
const AIShoppingAssistant: React.FC = () => {
    // State
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);
    const [addToCartStatus, setAddToCartStatus] = useState<{ status: 'idle' | 'success' | 'error', message: string }>({
        status: 'idle',
        message: ''
    });

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Create service instances using useRef to keep them stable across renders
    const audioServiceRef = useRef(new AudioService());
    const assistantServiceRef = useRef(new AssistantService());

    // Access services from refs
    const audioService = audioServiceRef.current;
    const assistantService = assistantServiceRef.current;

    // Router and current path
    const router = useRouter();
    const pathname = usePathname();

    // Initialize services
    useEffect(() => {
        // Add welcome message
        setMessages([assistantService.getWelcomeMessage()]);

        // Cleanup on unmount
        return () => {
            audioService.cleanup();
        };
    }, [audioService, assistantService]);

    // Monitor URL changes to detect product pages
    useEffect(() => {
        // Check if current URL is a product page
        if (pathname && pathname.startsWith('/product/')) {
            // Extract product ID from URL
            const productId = parseInt(pathname.split('/product/')[1], 10);

            if (!isNaN(productId)) {
                // Fetch product details to set context
                const fetchProductDetails = async () => {
                    try {
                        const response = await fetch(`/api/products/${productId}`);
                        if (response.ok) {
                            const productData = await response.json();
                            // Set product context in assistant service
                            assistantService.setCurrentProduct(productId, productData);
                        }
                    } catch (error) {
                        console.error('Error fetching product details:', error);
                    }
                };

                // Call the async function and handle the Promise properly
                void fetchProductDetails();
            }
        } else {
            // Clear product context when not on a product page
            assistantService.clearCurrentProduct();
        }
    }, [pathname, assistantService]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle cart operations
    const handleCartAction = useCallback(async (operation: 'add' | 'remove' | 'update', productId: number, quantity?: number) => {
        setAddToCartStatus({ status: 'idle', message: '' });

        try {
            let endpoint = '';
            let method = 'POST';
            let body: Record<string, unknown> | undefined = { productId };

            // Determine endpoint and request details based on operation
            if (operation === 'add') {
                endpoint = '/api/cart/add';
                body.quantity = quantity || 1;
            } else if (operation === 'remove') {
                endpoint = `/api/cart/remove?productId=${productId}`;
                method = 'DELETE';
                body = undefined;
            } else if (operation === 'update') {
                endpoint = '/api/cart/update';
                method = 'PUT';
                body = { productId, quantity: quantity || 1 };
            }

            // Make API request
            const response = await fetch(endpoint, {
                method,
                headers: method !== 'DELETE' ? { 'Content-Type': 'application/json' } : undefined,
                body: body ? JSON.stringify(body) : undefined
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Trigger cart update event for navbar
                window.dispatchEvent(new Event('cart-updated'));

                // Check if user is on the cart page and refresh it if needed
                if (pathname === '/cart') {
                    // Trigger a custom event for the cart page to refresh
                    window.dispatchEvent(new CustomEvent('cart-refresh-needed'));

                    // For immediate refresh, you could also force a router refresh
                    router.refresh();
                }

                setAddToCartStatus({
                    status: 'success',
                    message: operation === 'add' ? 'Added to cart successfully!' : 'Cart updated successfully!'
                });

                // Clear status after 3 seconds
                setTimeout(() => {
                    setAddToCartStatus({ status: 'idle', message: '' });
                }, 3000);
            } else {
                setAddToCartStatus({
                    status: 'error',
                    message: data.error || 'Failed to update cart'
                });
                return;
            }
        } catch (error) {
            console.error('Cart operation error:', error);
            setAddToCartStatus({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to update cart'
            });

            // Clear error after 5 seconds
            setTimeout(() => {
                setAddToCartStatus({ status: 'idle', message: '' });
            }, 5000);
        }
    }, [pathname, router]);

    /**
     * Process a user message and handle AI response
     */
    const handleUserMessage = async (text: string): Promise<void> => {
        if (!text.trim()) return;

        // Add user message
        const userMessage: Message = {
            role: 'user',
            content: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Process the query with the assistant service
            const {
                aiResponse,
                shouldNavigate,
                navigationPath,
                cartAction
            } = await assistantService.processUserQuery(text);

            // Add AI response
            const assistantMessage: Message = {
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Handle cart action if present
            if (cartAction) {
                await handleCartAction(
                    cartAction.operation,
                    cartAction.productId,
                    cartAction.quantity
                );
            }

            // Play the response audio
            const messageIndex = messages.length + 1; // +1 for the new message
            await audioService.playAudio(
                aiResponse,
                () => {
                    setIsSpeaking(true);
                    setSpeakingMessageIndex(messageIndex);
                },
                () => {
                    setIsSpeaking(false);
                    setSpeakingMessageIndex(null);
                }
            );

            // Handle navigation if needed
            if (shouldNavigate) {
                setTimeout(() => {
                    router.push(navigationPath);
                }, 1500);
            }
        } catch (error) {
            console.error('Error processing message:', error);

            // Add error message
            const errorMessage: Message = {
                role: 'assistant',
                content: "I'm sorry, I encountered an error. Please try again later.",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Toggle voice input recording
     */
    const toggleListening = async () => {
        if (isListening) {
            // Stop listening and get transcription
            setIsListening(false);
            setIsLoading(true);

            try {
                const transcription = await audioService.stopRecording();
                if (transcription) {
                    await handleUserMessage(transcription);
                }
            } catch (error) {
                console.error('Speech recognition error:', error);
            } finally {
                setIsLoading(false);
            }
        } else {
            // Start listening
            try {
                await audioService.startRecording();
                setIsListening(true);
            } catch (error) {
                console.error('Microphone access error:', error);
            }
        }
    };

    /**
     * Play audio for a message
     */
    const playMessageAudio = async (content: string, index: number) => {
        if (isSpeaking && speakingMessageIndex === index) {
            // Stop speaking if already speaking this message
            audioService.stopAudio();
            setIsSpeaking(false);
            setSpeakingMessageIndex(null);
        } else {
            // Play the message
            await audioService.playAudio(
                content,
                () => {
                    setIsSpeaking(true);
                    setSpeakingMessageIndex(index);
                },
                () => {
                    setIsSpeaking(false);
                    setSpeakingMessageIndex(null);
                }
            );
        }
    };

    /**
     * Stop speaking
     */
    const stopSpeaking = () => {
        audioService.stopAudio();
        setIsSpeaking(false);
        setSpeakingMessageIndex(null);
    };

    return (
        <div className="fixed right-4 bottom-4 z-50">
            {/* Cart status notification */}
            {addToCartStatus.status !== 'idle' && (
                <div className={`absolute bottom-full right-0 mb-2 p-3 rounded-lg shadow-lg ${
                    addToCartStatus.status === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    {addToCartStatus.message}
                </div>
            )}

            {!isOpen ? (
                // Assistant button (closed state)
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all"
                    aria-label="Open shopping assistant"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                </button>
            ) : (
                // Assistant chat container (open state)
                <div className="bg-white rounded-lg shadow-xl w-80 sm:w-96 flex flex-col h-96 border border-gray-200">
                    {/* Header */}
                    <div className="bg-gray-800 text-white p-3 rounded-t-lg flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                            </svg>
                            <h3 className="font-semibold">Shopping Assistant</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-300 transition"
                            aria-label="Close assistant"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <MessageList
                        messages={messages}
                        isLoading={isLoading}
                        isSpeaking={isSpeaking}
                        speakingMessageIndex={speakingMessageIndex}
                        playMessageAudio={playMessageAudio}
                        stopSpeaking={stopSpeaking}
                        messagesEndRef={messagesEndRef}
                    />

                    {/* Input */}
                    <ChatInput
                        onSubmit={handleUserMessage}
                        isLoading={isLoading}
                        isListening={isListening}
                        toggleListening={toggleListening}
                    />
                </div>
            )}
        </div>
    );
};

export default AIShoppingAssistant;