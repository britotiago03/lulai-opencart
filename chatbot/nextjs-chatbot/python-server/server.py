from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import io
import logging
import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from .env located one directory above this script
dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env")
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

# Initialize the OpenAI client with the API key from the .env file
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise Exception("OPENAI_API_KEY environment variable not set")
client = OpenAI(api_key=api_key)

# Real-Time Streaming Text-to-Speech Endpoint
@app.post("/tts")
async def text_to_speech(request: Request):
    logger.info("Received POST /tts request")
    data = await request.json()
    text_input = data.get("input")
    if not text_input:
        raise HTTPException(status_code=400, detail="Missing input text")

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

    return StreamingResponse(iterfile(), media_type="audio/mpeg", headers={"Cache-Control": "no-store"})

# Whisper Transcription Endpoint
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
        
        logger.info(f"Response from OpenAI: {response}")
        
        transcription_text = response.text

        return JSONResponse({"transcription": transcription_text})
    
    except HTTPException as e:
        logger.error("Whisper Endpoint Error: %s", e.detail)
        raise e
    
    except Exception as e:
        logger.error("Whisper Endpoint Error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
