// lulai-opencart/lulai-chatbot/nextjs-chatbot/app/page.tsx

"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import lulAILogo from "./assets/logo.png";
import { Message } from "ai";
import LoadingBubble from "./components/LoadingBubble";
import PromptSuggestionsRow from "./components/PromptSuggestionsRow";
import Bubble from "./components/Bubble";

const PYTHON_SERVER_URL = process.env.NEXT_PUBLIC_PYTHON_SERVER_URL;

const Home = () => {
  // Chat and Input State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // TTS Queue and Audio Context
  const ttsQueueRef = useRef<string[]>([]);
  const isPlayingTTSRef = useRef<boolean>(false);
  const audioBuffersRef = useRef<{ text: string; buffer: ArrayBuffer }[]>([]);
  const ttsAccumRef = useRef("");
  const sentFirstBatchRef = useRef(false);
  const prefetchingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Create a single AudioContext instance on mount
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Sentence Chunking Helper
  const segmentText = (text: string): string[] => {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });
      return Array.from(segmenter.segment(text), (segment) => segment.segment);
    } else {
      const sentenceRegex = /([^.!?]+[.!?]+)(\s+|$)/g;
      return text.match(sentenceRegex) || [];
    }
  };
  

  const getAudioContext = (): AudioContext => {
    if (!audioContextRef.current || audioContextRef.current.state === "closed") {
      console.log("[DEBUG] Recreating AudioContext...");
      // Recreate AudioContext if it was closed
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const processTTSQueue = async () => {
    if (isPlayingTTSRef.current || ttsQueueRef.current.length === 0) return;
  
    const textChunk = ttsQueueRef.current.shift()!;
    isPlayingTTSRef.current = true;
    setAudioLoading(true);
  
    try {
      const audioContext = getAudioContext();
  
      // Ensure AudioContext is running
      if (audioContext.state === "suspended") {
        console.log("[DEBUG] Resuming AudioContext...");
        await audioContext.resume();
      }
  
      // Fetch or use preloaded audio
      const prefetchedIndex = audioBuffersRef.current.findIndex(item => item.text === textChunk);
      let audioBuffer: ArrayBuffer;
      if (prefetchedIndex >= 0) {
        audioBuffer = audioBuffersRef.current[prefetchedIndex].buffer;
        audioBuffersRef.current.splice(prefetchedIndex, 1);
      } else {
        console.log("[DEBUG] Fetching new TTS audio...");
        audioBuffer = await prefetchTTSAudio(textChunk);
      }
  
      if (!audioBuffer || audioBuffer.byteLength === 0) {
        console.error("[ERROR] Empty audio buffer, skipping TTS chunk");
        isPlayingTTSRef.current = false;
        setAudioLoading(false);
        processTTSQueue();
        return;
      }
  
      console.log("[DEBUG] Received audio buffer, decoding...");
  
      // Decode audio
      const decodedBuffer = await audioContext.decodeAudioData(audioBuffer.slice(0));
  
      if (!decodedBuffer) {
        console.error("[ERROR] Decoded buffer is null.");
        isPlayingTTSRef.current = false;
        setAudioLoading(false);
        return;
      }
  
      console.log("[DEBUG] Playing audio...");
  
      // Preload the next audio chunk
      if (!prefetchingRef.current && ttsQueueRef.current.length > 0) {
        const nextText = ttsQueueRef.current[0];
        prefetchingRef.current = true;
        prefetchTTSAudio(nextText)
          .then((buffer) => {
            audioBuffersRef.current.push({ text: nextText, buffer });
            prefetchingRef.current = false;
          })
          .catch(() => (prefetchingRef.current = false));
      }
  
      // Play the audio
      const source = audioContext.createBufferSource();
      source.buffer = decodedBuffer;
      source.connect(audioContext.destination);
      source.start();
  
      source.onended = () => {
        console.log("[DEBUG] Audio playback finished.");
        isPlayingTTSRef.current = false;
        setAudioLoading(false);
        processTTSQueue();
      };
  
    } catch (error) {
      console.error("[ERROR] TTS Playback Error:", error);
      isPlayingTTSRef.current = false;
      setAudioLoading(false);
      processTTSQueue();
    }
  };
  

  // Cleanup the AudioContext on unmount only
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
    };
  }, []);

  // TTS Audio Prefetching
  const prefetchTTSAudio = async (text: string): Promise<ArrayBuffer> => {
    try {
      const response = await fetch(`${PYTHON_SERVER_URL}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text }),
        cache: "no-store"
      });
      return await response.arrayBuffer();
    } catch (error) {
      console.error("Error pre-fetching TTS:", error);
      throw error;
    }
  };

  // Fetch AI Response with Improved Chunking & Optimization
  const fetchAIResponse = async (updatedMessages: Message[]) => {
    setIsLoading(true);
    let assistantMessage: Message = { id: crypto.randomUUID(), content: "", role: "assistant" };
    ttsAccumRef.current = "";
  
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      if (!response.body) throw new Error("No response body");
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
  
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
  
        chunk.split("\n").forEach((line) => {
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.replace("data: ", "").trim());
              if (parsed.content) {
                assistantMessage.content += parsed.content;
                setMessages((prev) => {
                  const filtered = prev.filter((msg) => msg.id !== assistantMessage.id);
                  return [...filtered, { ...assistantMessage }];
                });
  
                // Accumulate text for TTS
                ttsAccumRef.current += parsed.content;
                const sentences = segmentText(ttsAccumRef.current);
                const requiredSentences = !sentFirstBatchRef.current ? 2 : 3;
  
                if (sentences.length >= requiredSentences) {
                  const chunkToSend = sentences.slice(0, requiredSentences).join(" ");
                  ttsAccumRef.current = ttsAccumRef.current.substring(chunkToSend.length);
                  if (chunkToSend.trim()) {
                    ttsQueueRef.current.push(chunkToSend.trim());
                    if (!sentFirstBatchRef.current) {
                      sentFirstBatchRef.current = true;
                      processTTSQueue();
                      const nextSentences = segmentText(ttsAccumRef.current);
                      if (nextSentences.length >= 3 && !prefetchingRef.current) {
                        const nextChunk = nextSentences.slice(0, 3).join(" ");
                        prefetchingRef.current = true;
                        prefetchTTSAudio(nextChunk.trim())
                          .then((buffer) => {
                            audioBuffersRef.current.push({ text: nextChunk.trim(), buffer });
                            prefetchingRef.current = false;
                          })
                          .catch(() => (prefetchingRef.current = false));
                      }
                    } else if (!isPlayingTTSRef.current) {
                      processTTSQueue();
                    }
                  }
                }
              }
            } catch (error) {
              console.error("Error parsing stream chunk:", error);
            }
          }
        });
      }
  
      if (ttsAccumRef.current.trim().length > 0) {
        ttsQueueRef.current.push(ttsAccumRef.current.trim());
        ttsAccumRef.current = "";
        if (!isPlayingTTSRef.current) processTTSQueue();
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }
    setIsLoading(false);
  };
  

  // Input Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handlePrompt = (promptText: string) => {
    sentFirstBatchRef.current = false;
    prefetchingRef.current = false;
    audioBuffersRef.current = [];
    const msg: Message = { id: crypto.randomUUID(), content: promptText, role: "user" };
    setMessages((prev) => [...prev, msg]);
    fetchAIResponse([...messages, msg]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sentFirstBatchRef.current = false;
    prefetchingRef.current = false;
    audioBuffersRef.current = [];
    const userMessage: Message = { id: crypto.randomUUID(), content: input, role: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    fetchAIResponse([...messages, userMessage]);
  };

  // Audio Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");
        try {
          const res = await fetch(`${PYTHON_SERVER_URL}/whisper`, {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.transcription) {
            sentFirstBatchRef.current = false;
            prefetchingRef.current = false;
            audioBuffersRef.current = [];
            const userMsg: Message = { id: crypto.randomUUID(), content: data.transcription, role: "user" };
            setMessages((prev) => [...prev, userMsg]);
            fetchAIResponse([...messages, userMsg]);
          }
        } catch (err) {
          console.error("Error transcribing audio:", err);
        }
      };
      setMediaRecorder(recorder);
      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  // Auto-scroll and check for pending TTS text without closing the AudioContext
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const checkPendingText = () => {
      if (ttsAccumRef.current.trim().length > 0 && !isLoading && !isPlayingTTSRef.current) {
        timeoutId = setTimeout(() => {
          if (ttsAccumRef.current.trim().length > 0) {
            ttsQueueRef.current.push(ttsAccumRef.current.trim());
            ttsAccumRef.current = "";
            processTTSQueue();
          }
        }, 1000);
      }
    };

    const intervalId = setInterval(checkPendingText, 500);

    return () => {
      clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading]);

  return (
    <main>
      <div className="header-container">
        <Image src={lulAILogo} width="250" alt="LulAI Logo" />
      </div>
      <section ref={chatContainerRef} className={messages.length === 0 ? "" : "populated"}>
        {messages.length === 0 ? (
          <>
            <p className="starter-text">
              Hi! I'm LulAI, your personal knowledge assistant. How can I help you today?
            </p>
            <PromptSuggestionsRow onPromptClick={handlePrompt} />
          </>
        ) : (
          <>
            {messages.map((message) => (
              <Bubble key={message.id} message={message} />
            ))}
            {isLoading && <LoadingBubble />}
            <div ref={messagesEndRef} />
          </>
        )}
      </section>
      <form onSubmit={handleSubmit}>
        <input
          className="question-box"
          onChange={handleInputChange}
          value={input}
          placeholder="Ask me something..."
        />
        <input type="submit" value="Send" />
      </form>
      <div className="audio-controls">
        {recording ? (
          <button onClick={stopRecording}>Stop Recording</button>
        ) : (
          <button onClick={startRecording}>Record Audio</button>
        )}
      </div>
      {audioLoading && <div>Loading audio...</div>}
    </main>
  );
};

export default Home;
