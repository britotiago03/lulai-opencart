# lulai-chatbot/nextjs-chatbot/python-server/server.py
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import io
import logging
import os
from dotenv import load_dotenv
from openai import OpenAI

# Import ElevenLabs SDK
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
load_dotenv(dotenv_path=dotenv_path)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize API clients
openai_api_key = os.getenv("OPENAI_API_KEY")
elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")

if not openai_api_key:
    raise Exception("OPENAI_API_KEY environment variable not set")

client = OpenAI(api_key=openai_api_key)

# Initialize ElevenLabs client if API key is available
elevenlabs_client = None
if elevenlabs_api_key:
    elevenlabs_client = ElevenLabs(api_key=elevenlabs_api_key)
else:
    logger.warning("ELEVENLABS_API_KEY not set. Will use OpenAI TTS as fallback.")

# Default voice - using Adam
DEFAULT_VOICE_ID = "pNInz6obpgDQGcFmaJgB"

# OpenAI TTS fallback function
async def openai_tts_fallback(text_input):
    logger.info("Using OpenAI TTS fallback")
    
    def iterfile():
        # Stream TTS audio from OpenAI as it is generated in chunks
        with client.audio.speech.with_streaming_response.create(
            model="tts-1-hd",
            voice="onyx",
            input=text_input,
            response_format="mp3"
        ) as response:
            for chunk in response.iter_bytes(1024):
                yield chunk

    return StreamingResponse(
        iterfile(), 
        media_type="audio/mpeg", 
        headers={"Cache-Control": "no-store"}
    )

@app.post("/tts")
async def text_to_speech(request: Request):
    logger.info("Received POST /tts request")
    data = await request.json()
    text_input = data.get("input")
    
    if not text_input:
        raise HTTPException(status_code=400, detail="Missing input text")
    
    # Try ElevenLabs first if available
    if elevenlabs_client:
        try:
            logger.info("Attempting to use ElevenLabs TTS")
            
            # We won't use streaming directly from ElevenLabs due to error handling limitations
            # Instead, we'll get the whole audio file and then stream it to the client
            try:
                # Generate audio with ElevenLabs
                audio_data = elevenlabs_client.text_to_speech.convert(
                    voice_id=DEFAULT_VOICE_ID,
                    output_format="mp3_44100_128",
                    text=text_input,
                    model_id="eleven_turbo_v2_5",
                    voice_settings=VoiceSettings(
                        stability=0.5,
                        similarity_boost=0.8,
                        style=0.0,
                        use_speaker_boost=True,
                        speed=1.0,
                    ),
                )
                
                # Collect all the audio chunks
                audio_bytes = b''
                for chunk in audio_data:
                    if chunk:
                        audio_bytes += chunk
                
                # Stream the collected audio to the client
                return StreamingResponse(
                    io.BytesIO(audio_bytes),
                    media_type="audio/mpeg",
                    headers={"Cache-Control": "no-store"}
                )
            
            except Exception as e:
                # Check specifically for 401 errors from ElevenLabs
                if hasattr(e, 'status_code') and e.status_code == 401:
                    logger.error(f"ElevenLabs authentication error: {str(e)}")
                    logger.info("Falling back to OpenAI TTS due to ElevenLabs authentication issue")
                else:
                    logger.error(f"Error with ElevenLabs TTS: {str(e)}")
                    logger.info("Falling back to OpenAI TTS")
                
                # Fall back to OpenAI
                return await openai_tts_fallback(text_input)
                
        except Exception as e:
            logger.error(f"Unexpected error with ElevenLabs TTS: {str(e)}")
            logger.info("Falling back to OpenAI TTS")
            return await openai_tts_fallback(text_input)
    else:
        # Fallback to OpenAI TTS if ElevenLabs is not configured
        logger.info("ElevenLabs not configured, using OpenAI TTS")
        return await openai_tts_fallback(text_input)

@app.post("/whisper")
async def whisper_transcription(file: UploadFile = File(...)):
    try:
        # Validate file format
        if not file.filename.split(".")[-1] in ["flac", "m4a", "mp3", "mp4", "mpeg", "mpga", "oga", "ogg", "wav", "webm"]:
            raise HTTPException(status_code=400, detail="Unsupported file format")

        audio_bytes = await file.read()

        response = client.audio.transcriptions.create(
            model="whisper-1",
            file=(file.filename, io.BytesIO(audio_bytes), file.content_type)
        )
        
        transcription_text = response.text
        logger.info(f"Transcription: {transcription_text[:50]}...")

        return JSONResponse({"transcription": transcription_text})
    
    except HTTPException as e:
        logger.error("Whisper Endpoint Error: %s", e.detail)
        raise e
    
    except Exception as e:
        logger.error("Whisper Endpoint Error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))