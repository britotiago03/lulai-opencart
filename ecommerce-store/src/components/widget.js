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
        api-key="e40ca87b876d4959083ab7a3777507fe" // Replace with your generated API key
    ></lulai-chat-widget>;
};

export default ChatWidget;