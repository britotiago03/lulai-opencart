"use client";

import { useEffect } from "react";

const ChatWidget = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "/lulai-widget.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    return <lulai-chat-widget api-key="E22f7d3b112aed0fb85a72f0d65d2e34"></lulai-chat-widget>;
};

export default ChatWidget;
