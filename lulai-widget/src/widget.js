class LulaiChatWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isChatOpen = false;
    this.isLoading = false;
    this.messages = [];
    // TTS properties
    this.ttsQueue = [];
    this.isPlayingTTS = false;
    this.audioBuffers = [];
    this.ttsAccum = "";
    this.sentFirstBatch = false;
    this.prefetching = false;
    this.audioContext = null;
    this.mediaRecorder = null;
    this.recording = false;
    
    // Initialize the AudioContext when the widget is created
    if (window.AudioContext || window.webkitAudioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  connectedCallback() {
    this.render();
    
    // Set up interval to check for pending TTS text
    this.ttsCheckInterval = setInterval(() => {
      if (this.ttsAccum.trim().length > 0 && !this.isLoading && !this.isPlayingTTS) {
        if (this.ttsTimeoutId) clearTimeout(this.ttsTimeoutId);
        
        this.ttsTimeoutId = setTimeout(() => {
          if (this.ttsAccum.trim().length > 0) {
            this.ttsQueue.push(this.ttsAccum.trim());
            this.ttsAccum = "";
            this.processTTSQueue();
          }
        }, 1000);
      }
    }, 500);
  }
  
  disconnectedCallback() {
    // Clear intervals and timeouts
    if (this.ttsCheckInterval) clearInterval(this.ttsCheckInterval);
    if (this.ttsTimeoutId) clearTimeout(this.ttsTimeoutId);
    
    // Cleanup the AudioContext when the widget is removed
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
    }
  }

  render() {
    // The widget container contains the chat window (if open) and the toggle button.
    const widgetContainer = `
      <style>
        :host {
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        }
        .chat-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #007bff;
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          color: white;
          font-size: 32px;
          cursor: pointer;
          z-index: 1000;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .chat-window {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 360px;
          height: 500px;
          background: #fff;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          overflow: hidden;
        }
        .chat-header {
          background: #007bff;
          color: white;
          padding: 12px;
          font-size: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chat-messages {
          flex: 1;
          padding: 10px;
          overflow-y: auto;
          background: #f7f7f7;
        }
        .bubble {
          margin: 8px 0;
          padding: 10px;
          border-radius: 10px;
          max-width: 75%;
          line-height: 1.4;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          color: #000;  /* Ensures text is visible */
        }
        .bubble.user {
          background-color: #e0f7fa;
          margin-left: auto;
        }
        .bubble.assistant {
          background-color: #eceff1;
          margin-right: auto;
        }
        .chat-input-container {
          display: flex;
          padding: 10px;
          border-top: 1px solid #ddd;
        }
        .chat-input-container input[type="text"] {
          flex: 1;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 20px;
          font-size: 14px;
        }
        .chat-input-container button {
          margin-left: 8px;
          padding: 8px 12px;
          border: none;
          background-color: #007bff;
          color: white;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
        }
        .audio-controls {
          display: flex;
          justify-content: center;
          padding: 6px;
          border-top: 1px solid #ddd;
        }
        .audio-controls button {
          padding: 6px 10px;
          border: none;
          background-color: #26a69a;
          color: white;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          margin: 0 4px;
        }
      </style>
      <div id="widget-container">
        ${this.isChatOpen ? this.getChatWindowHTML() : ''}
        <button class="chat-button" id="chatToggle">${this.isChatOpen ? '–' : '+'}</button>
      </div>
    `;
    this.shadowRoot.innerHTML = widgetContainer;

    // Toggle the chat window when the chat button is clicked.
    this.shadowRoot.getElementById('chatToggle').addEventListener('click', () => {
      this.isChatOpen = !this.isChatOpen;
      this.render();
      if (this.isChatOpen) {
        this.setupChatListeners();
      }
    });
  }

  getChatWindowHTML() {
    return `
      <div class="chat-window">
        <div class="chat-header">
          <span>Chat with us</span>
          <button id="closeChat" style="background:none;border:none;color:white;font-size:24px;cursor:pointer;">×</button>
        </div>
        <div class="chat-messages" id="chatMessages">
          ${this.messages
            .map(
              msg =>
                `<div class="bubble ${msg.role}">${this.parseMarkdown(msg.content)}</div>`
            )
            .join('')}
          ${this.isLoading ? `<div class="bubble assistant">...</div>` : ''}
        </div>
        <div class="chat-input-container">
          <input type="text" id="chatInput" placeholder="Type your message..." autocomplete="off" />
          <button id="sendButton">Send</button>
        </div>
        <div class="audio-controls">
          <button id="recordButton">${this.recording ? 'Stop Recording' : 'Record Audio'}</button>
        </div>
      </div>
    `;
  }

  setupChatListeners() {
    this.shadowRoot.getElementById('closeChat').addEventListener('click', () => {
      this.isChatOpen = false;
      this.render();
    });
    this.shadowRoot.getElementById('sendButton').addEventListener('click', () => this.handleSubmit());
    this.shadowRoot.getElementById('chatInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSubmit();
    });
    this.shadowRoot.getElementById('recordButton').addEventListener('click', () => {
      if (!this.recording) {
        this.startRecording();
      } else {
        this.stopRecording();
      }
    });
  }

  updateMessages() {
    const messagesContainer = this.shadowRoot.getElementById('chatMessages');
    if (messagesContainer) {
      messagesContainer.innerHTML =
        this.messages
          .map(
            msg =>
              `<div class="bubble ${msg.role}">${this.parseMarkdown(msg.content)}</div>`
          )
          .join('') + (this.isLoading ? `<div class="bubble assistant">...</div>` : '');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  addMessage(message) {
    this.messages.push(message);
    this.updateMessages();
  }

  parseMarkdown(text) {
    // Bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic text
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Bold and Italic text
    text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    
    // Links
    text = text.replace(/\[([^\[]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_self">$1</a>');
    
    // Headers (up to H3)
    text = text.replace(/^### (.*)/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.*)/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.*)/gm, '<h1>$1</h1>');
    
    // Unordered lists
    text = text.replace(/^\* (.*)/gm, '<ul><li>$1</li></ul>');
    
    // Blockquotes
    text = text.replace(/^> (.*)/gm, '<blockquote>$1</blockquote>');
    
    // Remove any stray <ul><li> wrapping, if multiple list items exist
    text = text.replace(/(<ul><li>.*<\/li><\/ul>)/g, function(match) {
        return match.replace(/<\/li><ul><li>/g, '');
    });

    // Return the parsed text
    return text;
}


  handleSubmit() {
    const inputEl = this.shadowRoot.getElementById('chatInput');
    const inputValue = inputEl.value.trim();
    if (!inputValue) return;
    const userMessage = { role: 'user', content: inputValue };
    this.addMessage(userMessage);
    inputEl.value = '';
    this.fetchResponse();
  }

  async fetchResponse() {
    this.isLoading = true;
    this.updateMessages();
  
    // Reset TTS state for new response
    this.ttsAccum = "";
    this.sentFirstBatch = false;
    this.prefetching = false;
    this.audioBuffers = [];
  
    const apiEndpoint = this.getAttribute('api-endpoint') || 'http://localhost:3001/api/chat';
    const storeName = this.getAttribute('store-name'); // Fetch store name from the widget attribute
    console.log("Store name:", storeName);
  
    // Create a placeholder for the assistant's response.
    let assistantMessage = { role: 'assistant', content: "" };
  
    // Instead of resetting the messages array, append to it.
    this.messages.push(assistantMessage); // Append the assistant's placeholder message
    this.updateMessages();
  
    try {
      const payloadMessages = this.messages.filter(msg => msg.role !== 'assistant' || msg.content.trim() !== "");
  
      // Include storeName in the payload
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payloadMessages, storeName: storeName }) // Add storeName here
      });
      
      if (!response.body) throw new Error("No response body");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        chunk.split("\n").forEach(line => {
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.replace("data: ", "").trim());
              if (parsed.content) {
                assistantMessage.content += parsed.content;
                
                // Update the assistant message in our messages list.
                this.messages = this.messages.map(msg =>
                  msg.role === 'assistant' && msg.content === "" ? { ...msg, content: assistantMessage.content } : msg
                );
                this.updateMessages();
  
                // Accumulate text for TTS.
                this.ttsAccum += parsed.content;
                const sentences = this.segmentText(this.ttsAccum);
                const requiredSentences = !this.sentFirstBatch ? 2 : 3;
                
                if (sentences.length >= requiredSentences) {
                  const chunkToSend = sentences.slice(0, requiredSentences).join(" ");
                  this.ttsAccum = this.ttsAccum.substring(chunkToSend.length);
  
                  if (chunkToSend.trim()) {
                    this.ttsQueue.push(chunkToSend.trim());
  
                    if (!this.sentFirstBatch) {
                      this.sentFirstBatch = true;
                      this.processTTSQueue();
                      
                      const nextSentences = this.segmentText(this.ttsAccum);
                      if (nextSentences.length >= 3 && !this.prefetching) {
                        const nextChunk = nextSentences.slice(0, 3).join(" ");
                        this.prefetching = true;
                        this.prefetchTTSAudio(nextChunk.trim())
                          .then((buffer) => {
                            this.audioBuffers.push({ text: nextChunk.trim(), buffer });
                            this.prefetching = false;
                          })
                          .catch(() => { 
                            this.prefetching = false; 
                          });
                      }
                    } else if (!this.isPlayingTTS) {
                      this.processTTSQueue();
                    }
                  }
                }
              }
            } catch (e) {
              console.error("Error parsing stream chunk:", e);
            }
          }
        });
      }
      
      // Process any remaining TTS text.
      if (this.ttsAccum.trim().length > 0) {
        this.ttsQueue.push(this.ttsAccum.trim());
        this.ttsAccum = "";
        if (!this.isPlayingTTS) this.processTTSQueue();
      }
      
    } catch (error) {
      console.error("Error fetching AI response:", error);
      // Update the error message to be more helpful
      this.messages.push({ role: 'assistant', content: 'Sorry, I encountered an error while processing your request.' });
      this.updateMessages();
    }
    
    this.isLoading = false;
    this.updateMessages();
  }

  segmentText(text) {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });
      return Array.from(segmenter.segment(text), segment => segment.segment);
    } else {
      const sentenceRegex = /([^.!?]+[.!?]+)(\s+|$)/g;
      return text.match(sentenceRegex) || [];
    }
  }

  getAudioContext() {
    if (!this.audioContext || this.audioContext.state === "closed") {
      console.log("[DEBUG] Recreating AudioContext in widget...");
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  
  async processTTSQueue() {
    if (this.isPlayingTTS || this.ttsQueue.length === 0) return;
    
    const textChunk = this.ttsQueue.shift();
    this.isPlayingTTS = true;
    
    try {
      const audioContext = this.getAudioContext();
      
      // Ensure AudioContext is running
      if (audioContext.state === "suspended") {
        console.log("[DEBUG] Resuming AudioContext in widget...");
        await audioContext.resume();
      }
      
      // Fetch or use preloaded audio
      const prefetchedIndex = this.audioBuffers.findIndex(item => item.text === textChunk);
      let audioBuffer;
      
      if (prefetchedIndex >= 0) {
        audioBuffer = this.audioBuffers[prefetchedIndex].buffer;
        this.audioBuffers.splice(prefetchedIndex, 1);
      } else {
        console.log("[DEBUG] Fetching new TTS audio in widget...");
        audioBuffer = await this.prefetchTTSAudio(textChunk);
      }
      
      if (!audioBuffer || audioBuffer.byteLength === 0) {
        console.error("[ERROR] Empty audio buffer in widget, skipping TTS chunk");
        this.isPlayingTTS = false;
        this.processTTSQueue();
        return;
      }
      
      console.log("[DEBUG] Received audio buffer in widget, decoding...");
      
      // Decode audio
      const decodedBuffer = await audioContext.decodeAudioData(audioBuffer.slice(0));
      
      if (!decodedBuffer) {
        console.error("[ERROR] Decoded buffer is null in widget.");
        this.isPlayingTTS = false;
        return;
      }
      
      console.log("[DEBUG] Playing audio in widget...");
      
      // Preload the next audio chunk
      if (!this.prefetching && this.ttsQueue.length > 0) {
        const nextText = this.ttsQueue[0];
        this.prefetching = true;
        this.prefetchTTSAudio(nextText)
          .then((buffer) => {
            this.audioBuffers.push({ text: nextText, buffer });
            this.prefetching = false;
          })
          .catch(() => {
            this.prefetching = false;
          });
      }
      
      // Play the audio
      const source = audioContext.createBufferSource();
      source.buffer = decodedBuffer;
      source.connect(audioContext.destination);
      source.start();
      
      source.onended = () => {
        console.log("[DEBUG] Audio playback finished in widget.");
        this.isPlayingTTS = false;
        this.processTTSQueue();
      };
      
    } catch (error) {
      console.error("[ERROR] TTS Playback Error in widget:", error);
      this.isPlayingTTS = false;
      this.processTTSQueue();
    }
  }

  async prefetchTTSAudio(text) {
    const ttsEndpoint = this.getAttribute('tts-endpoint') || 'http://localhost:8000/tts';
    try {
      console.log("[DEBUG] Prefetching TTS audio for:", text.substring(0, 20) + "...");
      const response = await fetch(ttsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text }),
        cache: "no-store"
      });
      
      if (!response.ok) {
        throw new Error(`TTS request failed with status: ${response.status}`);
      }
      
      const buffer = await response.arrayBuffer();
      console.log("[DEBUG] Prefetched audio buffer size:", buffer.byteLength);
      return buffer;
    } catch (error) {
      console.error("[ERROR] Error pre-fetching TTS:", error);
      throw error;
    }
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      this.mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");
        // Get the whisper endpoint from an attribute or default.
        const whisperEndpoint = this.getAttribute('whisper-endpoint') || 'http://localhost:8000/whisper';
        try {
          const res = await fetch(whisperEndpoint, {
            method: "POST",
            body: formData
          });
          const data = await res.json();
          if (data.transcription) {
            const userMsg = { role: 'user', content: data.transcription };
            this.addMessage(userMsg);
            this.fetchResponse();
          }
        } catch (err) {
          console.error("Error transcribing audio:", err);
        }
      };
      this.mediaRecorder.start();
      this.recording = true;
      this.shadowRoot.getElementById('recordButton').textContent = 'Stop Recording';
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  }

  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.recording = false;
      this.shadowRoot.getElementById('recordButton').textContent = 'Record Audio';
    }
  }
}

customElements.define('lulai-chat-widget', LulaiChatWidget);
