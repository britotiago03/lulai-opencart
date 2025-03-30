import { NextRequest, NextResponse } from "next/server";

const TTS_API_KEY = process.env.TTS_API_KEY || "";
const TTS_API_URL = process.env.TTS_API_URL || "https://api.elevenlabs.io/v1/text-to-speech";
const VOICE_ID = process.env.TTS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Default voice ID

// Modified interface to allow for runtime type checking
interface TTSRequest {
    input?: string | unknown;
}

export async function POST(req: NextRequest) {
    try {
        // Extract input text from request
        const { input } = await req.json() as TTSRequest;

        // Runtime type check is now valid
        if (!input || typeof input !== 'string') {
            return NextResponse.json(
                { error: "Missing or invalid input text" },
                { status: 400 }
            );
        }

        // If no API key is set, return a placeholder audio response
        if (!TTS_API_KEY) {
            // This is a placeholder implementation - in a real app you would
            // need to implement fallback TTS or inform the user
            console.warn("No TTS API key provided, using fallback audio");

            // Return an empty audio file
            const audioResponse = new Uint8Array([
                // Simple WAV header for empty audio
                0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00,
                0x57, 0x41, 0x56, 0x45, 0x66, 0x6D, 0x74, 0x20,
                0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
                0x44, 0xAC, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00,
                0x02, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61,
                0x00, 0x00, 0x00, 0x00
            ]).buffer;

            return new NextResponse(audioResponse, {
                headers: {
                    "Content-Type": "audio/wav",
                },
            });
        }

        // Otherwise, make a real TTS API call
        const response = await fetch(`${TTS_API_URL}/${VOICE_ID}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": TTS_API_KEY,
            },
            body: JSON.stringify({
                text: input,
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`TTS API error: ${response.status} ${errorData}`);

            return NextResponse.json(
                { error: `TTS API error: ${response.status}` },
                { status: response.status }
            );
        }

        // Get the audio content
        const audioBuffer = await response.arrayBuffer();

        // Return the audio content directly
        return new NextResponse(audioBuffer, {
            headers: {
                "Content-Type": "audio/mpeg",
            },
        });
    } catch (error) {
        console.error("Error in TTS API:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}