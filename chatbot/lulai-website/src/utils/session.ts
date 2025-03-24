import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// Function to save session data and redirect to the AI agent page
export const saveSessionAndRedirect = (
    sessionId: string,
    router: AppRouterInstance,
    setError: (error: string | null) => void,
    type: string = "json-upload" // Default is json-upload, can be "web-scrape" as well
) => {
    try {
        // Check if session ID exists
        if (!sessionId) {
            setError("Invalid session ID");
            return;
        }

        // Create session data
        const sessionData = {
            id: sessionId,
            name: "Product Assistant",
            createdAt: new Date().toISOString(),
            type: type // Either "json-upload" or "web-scrape"
        };

        // Save to localStorage for persistence
        localStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionData));

        // Redirect to the completion page with session ID for customization
        router.push(`/completion?sessionId=${sessionId}`);
    } catch (error) {
        console.error("Error saving session:", error);
        setError("Failed to create AI agent session");
    }
};

// Function to retrieve session data
export const getSessionData = (sessionId: string) => {
    try {
        const data = localStorage.getItem(`session_${sessionId}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Error retrieving session:", error);
        return null;
    }
};