// src/lib/ai/openai.ts
import { OpenAI } from 'openai';

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