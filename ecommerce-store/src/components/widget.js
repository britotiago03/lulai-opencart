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
        api-key="ydfb0660779c2fe12085ed0c357f7f3b" // Replace with your generated API key
    ></lulai-chat-widget>;
};

export default ChatWidget;