"use client";

import { useEffect } from "react";

const ChatWidget = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "/lulai-widget.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    return <lulai-chat-widget api-key="S17b778e1a3639290989ed78439f77cb"></lulai-chat-widget>;
};

export default ChatWidget;
