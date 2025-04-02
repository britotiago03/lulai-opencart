"use client";

import { useEffect } from "react";

const ChatWidget = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "/lulai-widget.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    return <lulai-chat-widget api-key="S2dd41d18ba9892d1de4f243c5b8b8f6"></lulai-chat-widget>;
};

export default ChatWidget;
