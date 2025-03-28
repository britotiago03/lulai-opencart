import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// OpenAI API config
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/audio/transcriptions";

interface OpenAITranscriptionResponse {
    text: string;
}

export async function POST(req: NextRequest) {
    try {
        // Ensure request is multipart form data
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: "No audio file provided" },
                { status: 400 }
            );
        }

        // If no API key is available, use a fallback method
        if (!OPENAI_API_KEY) {
            console.warn("No OpenAI API key provided, using fallback transcription");

            // In a real application, you might use a different STT service as fallback
            // Here we'll just return a dummy response for development
            return NextResponse.json({
                transcription: "This is a fallback transcription. Please set up the OpenAI API key."
            });
        }

        // Save the file temporarily
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'uploads');
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch (err) {
            console.error('Error creating uploads directory:', err);
        }

        const filePath = path.join(uploadsDir, `${uuidv4()}.webm`);

        await writeFile(filePath, buffer);

        // Create a new form for the OpenAI API
        const openAiFormData = new FormData();
        openAiFormData.append('file', new Blob([buffer], { type: file.type }), 'audio.webm');
        openAiFormData.append('model', 'whisper-1');
        openAiFormData.append('language', 'en'); // You can make this configurable

        // Call OpenAI Whisper API
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: openAiFormData,
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`OpenAI API error: ${response.status} ${errorData}`);

            return NextResponse.json(
                { error: `Speech recognition error: ${response.status}` },
                { status: response.status }
            );
        }

        // Get the JSON response from OpenAI
        const data = await response.json() as OpenAITranscriptionResponse;

        // Clean up the temporary file
        try {
            await import('fs').then(fs => fs.promises.unlink(filePath));
        } catch (err) {
            console.error('Error removing temporary file:', err);
            // Non-blocking, continue even if cleanup fails
        }

        // Return the transcription
        return NextResponse.json({
            transcription: data.text
        });
    } catch (error) {
        console.error("Error in STT API:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}