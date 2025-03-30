/**
 * Extract potential product-related terms from the user message
 * @param message - The user's message
 * @returns An array of relevant terms for product search
 */
export function extractProductTerms(message: string): string[] {
    // Remove common filler words and split into terms
    const normalizedMessage = message.toLowerCase()
        .replace(/[^\w\s]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Split into words
    const words = normalizedMessage.split(' ');

    // Filter out common stop words
    const stopWords = ['a', 'an', 'the', 'is', 'are', 'was', 'were', 'for', 'and',
        'or', 'but', 'in', 'on', 'at', 'by', 'to', 'from', 'with',
        'about', 'against', 'between', 'into', 'through', 'during',
        'before', 'after', 'above', 'below', 'show', 'find', 'tell',
        'me', 'my', 'want', 'looking', 'need', 'help', 'can', 'you'];

    // Return terms with at least 3 characters and not in stop words
    return words.filter(word =>
        word.length > 2 && !stopWords.includes(word)
    );
}