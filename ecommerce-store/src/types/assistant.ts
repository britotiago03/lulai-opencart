/**
 * Represents a message in the chat conversation
 */
export interface Message {
    /** The role of the message sender: 'user' or 'assistant' */
    role: 'user' | 'assistant';

    /** The content of the message */
    content: string;

    /** The timestamp when the message was created */
    timestamp: Date;
}