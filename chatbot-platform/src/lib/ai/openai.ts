// src/lib/ai/openai.ts
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function enhanceResponse(
    trigger: string,
    response: string,
    industry: string
): Promise<string> {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are an expert ${industry} customer service assistant. 
          Your job is to enhance customer service responses to make them more helpful, 
          natural, and engaging while maintaining the same information.`
                },
                {
                    role: "user",
                    content: `Enhance this response to the trigger question/phrase: "${trigger}"\n\nOriginal response: "${response}"`
                }
            ],
            temperature: 0.7,
            max_tokens: 300
        });

        return completion.choices[0].message.content || response;
    } catch (error) {
        console.error('Error enhancing response with AI:', error);
        // Return the original response if there's an error
        return response;
    }
}

// Add this new function
export async function getGeneralResponse(
    userQuery: string,
    industry: string,
    chatbotName: string = 'Assistant'
): Promise<string> {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are ${chatbotName}, a friendly and helpful customer service chatbot for a ${industry} business.
          Provide concise, accurate, and helpful answers to customer questions.
          If you don't know something specific about the business, provide general information that would be helpful.
          Keep responses under 100 words and maintain a friendly, professional tone.`
                },
                {
                    role: "user",
                    content: userQuery
                }
            ],
            temperature: 0.7,
            max_tokens: 150
        });

        return completion.choices[0].message.content || "I'm sorry, I don't have information about that.";
    } catch (error) {
        console.error('Error getting general AI response:', error);
        return "I'm sorry, I couldn't process your request at the moment. How else can I assist you?";
    }
}