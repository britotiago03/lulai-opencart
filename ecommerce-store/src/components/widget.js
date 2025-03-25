"use client";

import { useEffect } from "react";

const ChatWidget = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "/lulai-widget.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    return <lulai-chat-widget api-key="3dd2b78d3b956c354991ebc0fee01908"></lulai-chat-widget>;
};

export default ChatWidget;
