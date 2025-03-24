/**
 * Utility functions for API calls
 */

/**
 * Submits data to an API endpoint and returns a session ID
 *
 * @param endpoint - The API endpoint to submit to
 * @param formData - The FormData object to submit
 * @returns A Promise that resolves to the session ID
 */
export const submitFormAndGetSessionId = async (
    endpoint: string,
    formData: FormData
): Promise<string> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    const apiUrl = new URL(endpoint, backendUrl).toString();

    const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.session_id) {
        throw new Error('No session ID received from server');
    }

    return data.session_id;
};