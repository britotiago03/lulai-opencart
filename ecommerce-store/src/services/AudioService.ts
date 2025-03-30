'use client';

// Define a proper interface for the window object with WebKit AudioContext
interface WindowWithWebAudio extends Window {
    webkitAudioContext?: typeof AudioContext;
}

/**
 * Audio service for text-to-speech and speech-to-text functionality
 */
export default class AudioService {
    private audioContext: AudioContext | null = null;
    private audioSource: AudioBufferSourceNode | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: BlobPart[] = [];
    private isPlaying = false;

    constructor() {
        // Initialize audio context if available
        if (typeof window !== 'undefined') {
            try {
                this.audioContext = new (window.AudioContext || (window as WindowWithWebAudio).webkitAudioContext)();
            } catch (error) {
                console.error('Failed to initialize AudioContext:', error);
            }
        }
    }

    /**
     * Get or create AudioContext
     */
    private getAudioContext(): AudioContext | null {
        try {
            if (!this.audioContext || this.audioContext.state === "closed") {
                this.audioContext = new (window.AudioContext || (window as WindowWithWebAudio).webkitAudioContext)();
            } else if (this.audioContext.state === "suspended") {
                void this.audioContext.resume();
            }
            return this.audioContext;
        } catch (error) {
            console.error('Error creating/resuming audio context:', error);
            return null;
        }
    }

    /**
     * Split text into chunks for TTS processing
     */
    public splitTextIntoChunks(text: string, maxChunkSize: number = 150): string[] {
        // Clean the text but preserve list structure
        const cleanText = text
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/[*_~`]/g, '')  // Remove markdown formatting characters
            .replace(/\s+/g, ' ')    // Normalize spaces
            .trim();

        // First split by lines to handle lists better
        const lines = cleanText.split(/\n+/);
        const chunks: string[] = [];

        for (const line of lines) {
            const isListItem = /^\s*(\d+\.|[-*+•])\s+/.test(line);

            if (isListItem) {
                if (line.length > maxChunkSize) {
                    const sentences = line.split(/(?<=[.!?])\s+/);
                    let currentChunk = '';

                    for (const sentence of sentences) {
                        if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
                            chunks.push(currentChunk.trim());
                            currentChunk = sentence;
                        } else {
                            currentChunk += (currentChunk ? ' ' : '') + sentence;
                        }
                    }

                    if (currentChunk.length > 0) {
                        chunks.push(currentChunk.trim());
                    }
                } else {
                    const endsWithPunctuation = /[.!?]$/.test(line);
                    chunks.push(endsWithPunctuation ? line : line + '.');
                }
            } else {
                const sentences = line.split(/(?<=[.!?])\s+/);
                let currentChunk = '';

                for (const sentence of sentences) {
                    const isGreeting = /^(Hi|Hello|Hey|Certainly|Sure|Absolutely|Yes|No)!?$/i.test(sentence.trim());

                    if (isGreeting || sentence.trim().length < 15) {
                        if (currentChunk.length + sentence.length <= maxChunkSize || currentChunk.length === 0) {
                            currentChunk += (currentChunk ? ' ' : '') + sentence;
                        } else {
                            chunks.push(currentChunk.trim());
                            currentChunk = sentence;
                        }
                    } else if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
                        chunks.push(currentChunk.trim());
                        currentChunk = sentence;
                    } else {
                        currentChunk += (currentChunk ? ' ' : '') + sentence;
                    }
                }

                if (currentChunk.length > 0) {
                    chunks.push(currentChunk.trim());
                }
            }
        }

        // Add periods to the end of chunks that don't end with punctuation
        return chunks.map(chunk => {
            const trimmed = chunk.trim();
            if (trimmed.length > 0 && !(/[.!?:;]$/.test(trimmed))) {
                return trimmed + '.';
            }
            return trimmed;
        });
    }

    /**
     * Fetch TTS audio for a text chunk
     */
    private async prefetchTTSAudio(text: string): Promise<ArrayBuffer> {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_TTS_API_URL || "/api/tts";

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: text }),
            });

            if (!response.ok) {
                console.error(`TTS request failed with status ${response.status}`);
                return new ArrayBuffer(0);
            }

            return await response.arrayBuffer();
        } catch (error) {
            console.error('Error fetching TTS audio:', error);
            return new ArrayBuffer(0);
        }
    }

    /**
     * Play audio for a message
     */
    public async playAudio(message: string, onStart: () => void, onStop: () => void): Promise<void> {
        // Stop any current audio
        this.stopAudio();

        // Call the onStart callback
        onStart();

        try {
            const chunks = this.splitTextIntoChunks(message);
            if (chunks.length === 0) {
                onStop();
                return;
            }

            const audioContext = this.getAudioContext();
            if (!audioContext) {
                onStop();
                return;
            }

            this.isPlaying = true;

            let currentChunkIndex = 0;
            let nextAudioPromise: Promise<ArrayBuffer> = this.prefetchTTSAudio(chunks[currentChunkIndex]);

            while (currentChunkIndex < chunks.length && this.isPlaying) {
                const audioBuffer = await nextAudioPromise;

                // Prefetch next chunk if available
                if (currentChunkIndex < chunks.length - 1) {
                    nextAudioPromise = this.prefetchTTSAudio(chunks[currentChunkIndex + 1]);
                } else {
                    nextAudioPromise = Promise.resolve(new ArrayBuffer(0));
                }

                // Check if playing was stopped
                if (!this.isPlaying) break;

                // Decode and play current chunk
                let decodedBuffer: AudioBuffer | null = null;
                try {
                    decodedBuffer = await audioContext.decodeAudioData(audioBuffer.slice(0));
                } catch (err) {
                    console.error('Error decoding audio data for chunk:', currentChunkIndex, err);
                    currentChunkIndex++;
                    continue;
                }

                if (!decodedBuffer) {
                    currentChunkIndex++;
                    continue;
                }

                await new Promise<void>((resolve) => {
                    if (!this.isPlaying || !audioContext) {
                        resolve();
                        return;
                    }

                    const source = audioContext.createBufferSource();
                    this.audioSource = source;
                    source.buffer = decodedBuffer;
                    source.connect(audioContext.destination);

                    source.onended = () => {
                        if (this.audioSource === source) {
                            this.audioSource = null;
                        }
                        resolve();
                    };

                    source.start();

                    // Check for stop during playback
                    const checkInterval = setInterval(() => {
                        if (!this.isPlaying) {
                            if (source.buffer) {
                                try {
                                    source.stop();
                                    this.audioSource = null;
                                } catch (error) {
                                    // Ignore errors if already stopped
                                    console.debug('Error stopping audio source:', error);
                                }
                            }
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                });

                currentChunkIndex++;
            }
        } catch (error) {
            console.error('TTS streaming playback error:', error);
        } finally {
            this.isPlaying = false;
            this.audioSource = null;
            onStop();
        }
    }

    /**
     * Stop audio playback
     */
    public stopAudio(): void {
        this.isPlaying = false;

        if (this.audioSource) {
            try {
                this.audioSource.stop();
                this.audioSource = null;
            } catch (err) {
                console.error('Error stopping audio source:', err);
            }
        }
    }

    /**
     * Start recording audio
     */
    public async startRecording(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioChunks = [];

            const recorder = new MediaRecorder(stream);
            this.mediaRecorder = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            recorder.start();
        } catch (error) {
            console.error('Error accessing microphone:', error);
            throw error;
        }
    }

    /**
     * Stop recording and transcribe audio
     */
    public async stopRecording(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
                reject(new Error('Not recording'));
                return;
            }

            this.mediaRecorder.onstop = async () => {
                let audioBlob;
                try {
                    audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

                    // Create form data for upload
                    const formData = new FormData();
                    formData.append('file', audioBlob, 'recording.webm');

                    // Send to Speech-to-Text API
                    const response = await fetch('/api/stt', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        console.error(`Speech-to-text request failed with status ${response.status}`);
                        reject(new Error(`Speech-to-text request failed with status ${response.status}`));
                        return;
                    }

                    const data = await response.json();

                    if (data.transcription) {
                        resolve(data.transcription);
                    } else {
                        console.error('No transcription received');
                        reject(new Error('No transcription received'));
                    }
                } catch (error) {
                    console.error('Error transcribing audio:', error);
                    reject(error);
                } finally {
                    // Clear audio chunks
                    this.audioChunks = [];

                    // Release the media stream
                    if (this.mediaRecorder && this.mediaRecorder.stream) {
                        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
                    }
                }
            };

            this.mediaRecorder.stop();
        });
    }

    /**
     * Cleanup method to release resources
     */
    public cleanup(): void {
        this.stopAudio();

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            try {
                this.mediaRecorder.stop();
                if (this.mediaRecorder.stream) {
                    this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
                }
            } catch (error) {
                console.error('Error stopping media recorder:', error);
            }
        }

        if (this.audioContext && this.audioContext.state !== 'closed') {
            try {
                void this.audioContext.close();
            } catch (error) {
                console.error('Error closing audio context:', error);
            }
        }
    }
}