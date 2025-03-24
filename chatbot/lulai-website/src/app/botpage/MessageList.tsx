import React from 'react';
import Message from './Message';

interface MessageListProps {
  messages: {
    text: string;
    isUser: boolean;
  }[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="max-md:border-t border-zinc-500 flex flex-col overflow-y-auto max-md:pt-5 mt-1 scrollbar-black h-[calc(100vh-120px)] px-5 md:px-5 pb-10 z-20 md:pt-0 w-full">
      <div className="mx-auto gap-4 text-base md:gap-5 lg:gap-6 w-full max-w-[48em]">
        {messages.map((msg, index) => (
          <Message key={index} text={msg.text} isUser={msg.isUser} />
        ))}
      </div>
    </div>
  );
};

export default MessageList;
