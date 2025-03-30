import { Message, OpenAIRequest, OpenAIResponse, AssistantResponse } from '../types';

/**
 * Send query to OpenAI and get response
 * @param systemPrompt - The system prompt to guide the AI
 * @param userMessage - The user's message
 * @param conversationHistory - Previous conversation history
 * @returns The parsed response from OpenAI
 */
export async function queryOpenAI(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: Message[] = []
): Promise<AssistantResponse> {
    // Prepare the OpenAI API request
    const openaiRequest: OpenAIRequest = {
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: userMessage }
        ],
        response_format: { type: "json_object" }
    };

    // Make API call to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify(openaiRequest)
    });

    // Handle non-OK responses
    if (!response.ok) {
        console.error(`OpenAI API error: ${response.status}`);
        throw new Error(`API responded with status ${response.status}`);
    }

    const completion = await response.json() as OpenAIResponse;
    const responseContent = completion.choices[0].message.content;

    if (!responseContent) {
        throw new Error("Empty response from OpenAI");
    }

    // Parse the JSON response
    try {
        const jsonData = JSON.parse(responseContent);
        return {
            response: jsonData.response || "I'm sorry, I encountered an error.",
            action: jsonData.action || null
        };
    } catch (error) {
        console.error("Error parsing OpenAI response as JSON:", error);
        return {
            response: responseContent || "I'm sorry, I encountered an error processing your request."
        };
    }
}