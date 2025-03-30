"use client";

import { useEffect } from "react";

const ChatWidget = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "/lulai-widget.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    return <lulai-chat-widget api-key="e7b2707e00fa307ca8d0b993a2a28b2c"></lulai-chat-widget>;
};

export default ChatWidget;
