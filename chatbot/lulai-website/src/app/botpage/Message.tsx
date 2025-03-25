import React from 'react';
import ReactMarkdown from 'react-markdown';
import './Markdown.css';

interface MessageProps {
    text: string;
    isUser: boolean;
}

const Message: React.FC<MessageProps> = ({ text, isUser }) => {
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2 z-10`}>
            <div
                className={`max-w-[90%] md:max-w-md lg:max-w-lg px-5 py-3 rounded-xl break-words markdown mb-10 gap-11 ${
                    isUser ? 'bg-zinc-700 text-white' : 'bg-neutral-700 text-white'
                }`}
            >
                <ReactMarkdown>
                    {text}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export default Message;