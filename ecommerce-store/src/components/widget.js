"use client";

import { useEffect } from "react";

const ChatWidget = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "/lulai-widget.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    return <lulai-chat-widget store-name="custom"></lulai-chat-widget>;
};

export default ChatWidget;
