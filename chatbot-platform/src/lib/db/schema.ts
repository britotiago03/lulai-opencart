/* src/lib/db/schema.ts*/
import { z } from 'zod';

// Zod schema for industry validation
export const industrySchema = z.enum(['general', 'fashion', 'electronics', 'food', 'beauty']);
export type Industry = z.infer<typeof industrySchema>;

// Zod schema for chatbot response validation
export const chatbotResponseSchema = z.object({
    // ID is required for responses, but we'll generate temporary IDs on the client
    id: z.string(),
    trigger: z.string().min(1, "Trigger phrase is required"),
    response: z.string().min(1, "Response text is required"),
    isAI: z.boolean().default(false),
});
export type ChatbotResponse = z.infer<typeof chatbotResponseSchema>;

// Zod schema for chatbot template validation
export const chatbotTemplateSchema = z.object({
    id: z.string(),
    name: z.string(),
    industry: industrySchema,
    description: z.string(),
    presetResponses: z.array(chatbotResponseSchema),
});
export type ChatbotTemplate = z.infer<typeof chatbotTemplateSchema>;

// Zod schema for chatbot validation
export const chatbotSchema = z.object({
    id: z.string().optional(), // Optional for new chatbots
    name: z.string().min(1, "Chatbot name is required"),
    description: z.string().optional(),
    industry: industrySchema,
    responses: z.array(chatbotResponseSchema).default([]),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});
export type Chatbot = z.infer<typeof chatbotSchema>;