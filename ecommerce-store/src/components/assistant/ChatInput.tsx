'use client';

import React, { useState } from 'react';

interface ChatInputProps {
    onSubmit: (text: string) => Promise<void>;
    isLoading: boolean;
    isListening: boolean;
    toggleListening: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
                                                 onSubmit,
                                                 isLoading,
                                                 isListening,
                                                 toggleListening
                                             }) => {
    const [input, setInput] = useState('');

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (!input.trim()) return;
        await onSubmit(input);
        setInput('');
    };

    return (
        <div className="p-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
                <button
                    onClick={toggleListening}
                    className={`p-2 rounded-full flex-shrink-0 ${
                        isListening
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    disabled={isLoading}
                    aria-label={isListening ? "Stop listening" : "Start listening"}
                >
                    {isListening ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                        </svg>
                    )}
                </button>

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder={isListening ? "Listening..." : "Ask me anything..."}
                    disabled={isLoading || isListening}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !input.trim()}
                    className={`p-2 rounded-full ${
                        isLoading || !input.trim()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    aria-label="Send message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ChatInput;