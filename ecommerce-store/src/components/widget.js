"use client";

import { useEffect } from "react";

const ChatWidget = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "/lulai-widget.js"; // Replace with the actual filename
        script.async = true;
        document.body.appendChild(script);
    }, []);

    return <lulai-chat-widget
        api-endpoint="http://localhost:3005/api/chat"
        api-key="y23ea99ebe09afa13a3183f08677a2b4" // Replace with your generated API key
    ></lulai-chat-widget>;
};

export default ChatWidget;