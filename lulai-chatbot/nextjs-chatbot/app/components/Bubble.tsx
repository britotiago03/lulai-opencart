// lulai-opencart/lulai-chatbot/nextjs-chatbot/app/components/Bubble.tsx
import React from "react";

type BubbleProps = {
  message: { id: string; content: string; role: string };
  onPlayTTS?: (text: string) => void;
};

const Bubble = ({ message, onPlayTTS }: BubbleProps) => {
  return (
    <div className={`bubble ${message.role}`}>
      <p>{message.content}</p>
      {message.role === "assistant" && onPlayTTS && (
        <button onClick={() => onPlayTTS(message.content)}>Listen</button>
      )}
    </div>
  );
};

export default Bubble;
