class LulaiChatWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isChatOpen = false;
    this.isLoading = false;
    this.messages = [];
    this.ttsQueue = [];
    this.isPlayingTTS = false;
    this.isProcessingTTS = false;
    this.isListening = false;
    this.speakingMessageIndex = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.audioContext = null;
    this.audioSource = null;
    this.lastScrollPosition = 0;
  
    // Get or create user ID
    this.userId = localStorage.getItem('lulai_user_id');
    if (!this.userId) {
      this.userId = 'user_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('lulai_user_id', this.userId);
    }
  
    this.config = {
      primaryColor: "{{primaryColor}}",
      secondaryColor: "{{secondaryColor}}",
      buttonSize: "{{buttonSize}}",
      windowWidth: "{{windowWidth}}",
      windowHeight: "{{windowHeight}}",
      headerText: "{{headerText}}",
      fontFamily: "{{fontFamily}}",
      pythonApiUrl: "http://localhost:8001"
    };
  }

  connectedCallback() {
    this.render();
  }

  render() {
    // Save scroll position before re-rendering if the chat window exists
    const chatMessages = this.shadowRoot.getElementById('chatMessages');
    if (chatMessages) {
      this.lastScrollPosition = chatMessages.scrollTop;
    }

    const widgetContainer = `
      <style>
        :host {
          font-family: ${this.config.fontFamily};
        }
        .chat-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: ${this.config.primaryColor};
          border: none;
          border-radius: 50%;
          width: ${this.config.buttonSize}px;
          height: ${this.config.buttonSize}px;
          color: white;
          font-size: 32px;
          cursor: pointer;
          z-index: 1000;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .chat-window {
          position: fixed;
          bottom: ${parseInt(this.config.buttonSize) + 30}px;
          right: 20px;
          width: ${this.config.windowWidth}px;
          height: ${this.config.windowHeight}px;
          background: #fff;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          overflow: hidden;
        }
        .chat-header {
          background: ${this.config.primaryColor};
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
          color: #000;
          position: relative;
        }
        .bubble.user {
          background-color: ${this.config.secondaryColor};
          margin-left: auto;
        }
        .bubble.assistant {
          background-color: #eceff1;
          margin-right: auto;
        }
        .tts-button {
          position: absolute;
          bottom: 4px;
          right: 4px;
          background: rgba(255,255,255,0.8);
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          padding: 2px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chat-input-container {
          display: flex;
          padding: 10px;
          border-top: 1px solid #ddd;
          gap: 8px;
        }
        .chat-input-container input[type="text"] {
          flex: 1;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 20px;
          font-size: 14px;
        }
        .chat-input-container button {
          padding: 8px 12px;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .send-button {
          background-color: ${this.config.primaryColor};
          color: white;
        }
        .record-button {
          background-color: #dc3545;
          color: white;
        }
        /* Animation dot styles */
        .typing-animation {
          display: flex;
          align-items: center;
          column-gap: 6px;
          padding: 6px 12px;
        }
        .typing-dot {
          width: 8px;
          height: 8px;
          background-color: #999;
          border-radius: 50%;
          opacity: 0.6;
          animation: typingAnimation 1.4s infinite ease-in-out;
        }
        .typing-dot:nth-child(1) {
          animation-delay: 0s;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typingAnimation {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-5px);
            opacity: 1;
          }
        }
        /* User avatar */
        .avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          margin-right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }
        .message-container {
          display: flex;
          align-items: flex-start;
          margin: 12px 0;
        }
        .message-container.user {
          flex-direction: row-reverse;
        }
        .message-container.user .avatar {
          margin-right: 0;
          margin-left: 10px;
          background-color: ${this.config.secondaryColor};
        }
        .message-container.assistant .avatar {
          background-color: ${this.config.primaryColor};
        }
      </style>
      <div id="widget-container">
      ${this.isChatOpen ? this.getChatWindowHTML() : ''}
      <button class="chat-button" id="chatToggle">${this.isChatOpen ? '–' : '+'}</button>
    </div>
  `;
  this.shadowRoot.innerHTML = widgetContainer;

  // Attach listener for toggling the chat window
  this.shadowRoot.getElementById('chatToggle').addEventListener('click', () => {
    this.isChatOpen = !this.isChatOpen;
    this.render();
    if (this.isChatOpen) {
      this.setupChatListeners();
    }
  });

  // If the chat is open, ensure all other listeners are attached
  if (this.isChatOpen) {
    this.setupChatListeners();
    // Restore scroll position after re-rendering
    this.restoreScrollPosition();
  }
}

  getChatWindowHTML() {
    return `
      <div class="chat-window">
        <div class="chat-header">
          <span>${this.config.headerText}</span>
          <button id="closeChat" style="background:none;border:none;color:white;font-size:24px;cursor:pointer;">×</button>
        </div>
        <div class="chat-messages" id="chatMessages">
          ${this.messages
            .map(
              (msg, index) => `
                <div class="message-container ${msg.role}">
                  <div class="avatar">${msg.role === 'user' ? 'U' : 'A'}</div>
                  <div class="bubble ${msg.role}">
                    ${this.parseMarkdown(msg.content)}
                    ${
                      msg.role === 'assistant'
                        ? `
                      <button class="tts-button" data-index="${index}">
                        ${this.getTTSButtonContent(index)}
                      </button>
                      `
                        : ''
                    }
                  </div>
                </div>
              `
            )
            .join('')}
          ${this.isLoading ? this.getTypingAnimation() : ''}
        </div>
        <div class="chat-input-container">
          <button id="recordButton" class="${this.isListening ? 'record-button' : 'send-button'}">
            ${this.isListening ? '⏹' : '🎤'}
          </button>
          <input type="text" id="chatInput" placeholder="Type your message..." autocomplete="off" />
          <button id="sendButton" class="send-button">Send</button>
        </div>
      </div>
    `;
  }
  
  getTypingAnimation() {
    return `
      <div class="message-container assistant">
        <div class="avatar">A</div>
        <div class="bubble assistant">
          <div class="typing-animation">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    `;
  }

  getTTSButtonContent(index) {
    if (this.isProcessingTTS && this.speakingMessageIndex === index) {
      return '⏳';
    }
    return this.speakingMessageIndex === index ? '⏹' : '🔊';
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
      if (this.isListening) this.stopRecording();
      else this.startRecording();
    });

    this.shadowRoot.querySelectorAll('.tts-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        if (this.speakingMessageIndex === index) this.stopTTS();
        else this.playMessageAudio(this.messages[index].content, index);
      });
    });
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        await this.processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isListening = true;
      this.render();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }

  stopRecording() {
    console.log("Stopping recording...");
    if (this.mediaRecorder) {
      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
      }
      this.isListening = false;
      this.render();
      this.setupChatListeners(); // Re-attach listeners after re-rendering
    }
  }
  
  async processAudio(audioBlob) {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');

    try {
      const response = await fetch(`${this.config.pythonApiUrl}/whisper`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Transcription failed');
      
      const data = await response.json();
      if (data.transcription) {
        this.handleSubmit(data.transcription);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  }

  async playMessageAudio(message, index) {
    this.stopTTS();
    this.isProcessingTTS = true;
    this.speakingMessageIndex = index;
    this.updateMessages();
  
    const chunks = this.splitTextIntoChunks(message);
    if (!chunks.length) return;
  
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await this.audioContext.resume(); // Ensure the context is running (needed in some browsers)
      this.isPlayingTTS = true;
      this.isProcessingTTS = false;
      this.updateMessages();
  
      let currentChunk = 0;
      let nextAudioPromise = this.prefetchTTS(chunks[currentChunk]);
  
      while (currentChunk < chunks.length && this.isPlayingTTS) {
        const audioBuffer = await nextAudioPromise;
        if (currentChunk < chunks.length - 1) {
          nextAudioPromise = this.prefetchTTS(chunks[currentChunk + 1]);
        }
  
        const source = this.audioContext.createBufferSource();
        source.buffer = await this.audioContext.decodeAudioData(audioBuffer);
        source.connect(this.audioContext.destination);
        this.audioSource = source; // Store the current source so we can stop it later
        source.start(0);
  
        await new Promise(resolve => {
          source.onended = resolve;
          const checkInterval = setInterval(() => {
            if (!this.isPlayingTTS) {
              try {
                source.stop();
              } catch (e) {
                // ignore if already stopped
              }
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        });
  
        currentChunk++;
      }
    } catch (error) {
      console.error('TTS playback error:', error);
    } finally {
      this.stopTTS();
    }
  }
  
  async prefetchTTS(text) {
    try {
      const response = await fetch(`${this.config.pythonApiUrl}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text })
      });
      return await response.arrayBuffer();
    } catch (error) {
      console.error('TTS prefetch error:', error);
      return new ArrayBuffer(0);
    }
  }

  stopTTS() {
    this.isPlayingTTS = false;
    this.isProcessingTTS = false;
    this.speakingMessageIndex = null;
    if (this.audioSource) {
      this.audioSource.stop();
      this.audioSource = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.updateMessages();
  }

  splitTextIntoChunks(text, maxChunkSize = 150) {
    const cleanText = text
      .replace(/<[^>]*>/g, '')
      .replace(/[*_~`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const lines = cleanText.split(/\n+/);
    const chunks = [];
    
    for (const line of lines) {
      const isListItem = /^\s*(\d+\.|[-*+•])\s+/.test(line);
      const sentences = line.split(/(?<=[.!?])\s+/);
      let currentChunk = '';

      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxChunkSize && currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
      }

      if (currentChunk) {
        chunks.push(currentChunk.trim() + (isListItem && !/[.!?]$/.test(currentChunk) ? '.' : ''));
      }
    }

    return chunks.map(chunk => chunk.replace(/([^.!?])$/, '$1.'));
  }

  // Save and restore scroll position methods
  saveScrollPosition() {
    const messagesContainer = this.shadowRoot.getElementById('chatMessages');
    if (messagesContainer) {
      this.lastScrollPosition = messagesContainer.scrollTop;
    }
  }

  restoreScrollPosition() {
    const messagesContainer = this.shadowRoot.getElementById('chatMessages');
    if (messagesContainer) {
      // Set timeout to let the DOM update first
      setTimeout(() => {
        messagesContainer.scrollTop = this.lastScrollPosition;
      }, 0);
    }
  }

  updateMessages() {
    // Save the current scroll position before making changes
    this.saveScrollPosition();
    
    const messagesContainer = this.shadowRoot.getElementById('chatMessages');
    if (messagesContainer) {
      messagesContainer.innerHTML =
        this.messages
          .map(
            (msg, index) => `
              <div class="message-container ${msg.role}">
                <div class="avatar">${msg.role === 'user' ? 'U' : 'A'}</div>
                <div class="bubble ${msg.role}">
                  ${this.parseMarkdown(msg.content)}
                  ${
                    msg.role === 'assistant'
                      ? `
                  <button class="tts-button" data-index="${index}">
                    ${this.getTTSButtonContent(index)}
                  </button>
                  `
                      : ''
                  }
                </div>
              </div>
            `
          )
          .join('') + (this.isLoading ? this.getTypingAnimation() : '');
      
      // If we're adding a new message, scroll to bottom
      const shouldScrollToBottom = this.isLoading || 
        (messagesContainer.scrollHeight - messagesContainer.clientHeight - messagesContainer.scrollTop < 100);
      
      if (shouldScrollToBottom) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } else {
        // Otherwise restore the previous scroll position
        this.restoreScrollPosition();
      }
  
      // Re-attach event listeners for TTS buttons
      this.shadowRoot.querySelectorAll('.tts-button').forEach(button => {
        button.addEventListener('click', (e) => {
          const index = parseInt(e.currentTarget.dataset.index);
          if (this.speakingMessageIndex === index) this.stopTTS();
          else this.playMessageAudio(this.messages[index].content, index);
        });
      });
    }
  }
  
  addMessage(message) {
    this.messages.push(message);
    this.updateMessages();
  }

  parseMarkdown(text) {
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    text = text.replace(/\[([^\[]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_self">$1</a>');
    text = text.replace(/^### (.*)/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.*)/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.*)/gm, '<h1>$1</h1>');
    text = text.replace(/^\* (.*)/gm, '<ul><li>$1</li></ul>');
    text = text.replace(/^> (.*)/gm, '<blockquote>$1</blockquote>');
    text = text.replace(/(<ul><li>.*<\/li><\/ul>)/g, function(match) {
        return match.replace(/<\/li><ul><li>/g, '');
    });
    return text;
  }

  handleSubmit(text) {
    const inputEl = this.shadowRoot.getElementById('chatInput');
    // If a text parameter is provided (from Whisper), use it; otherwise, get text from the input.
    const inputValue = text !== undefined ? text.trim() : inputEl.value.trim();
    if (!inputValue) return;
    const userMessage = { role: 'user', content: inputValue };
    this.addMessage(userMessage);
    // Clear input only if the user typed manually.
    if (text === undefined) inputEl.value = '';
    this.fetchResponse();
  }
  
  async fetchResponse() {
    this.isLoading = true;
    this.updateMessages();
  
    const apiEndpoint = this.getAttribute('api-endpoint') || 'http://localhost:3005/api/chat';
    const apiKey = this.getAttribute('api-key');
    
    // Get the userId from attribute or generate a unique one if not provided
    let userId = this.getAttribute('user-id');
    if (!userId) {
      // Generate a unique user ID if not provided and store it in localStorage
      userId = localStorage.getItem('lulai_user_id');
      if (!userId) {
        userId = 'user_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('lulai_user_id', userId);
      }
    }
  
    let assistantMessage = { role: 'assistant', content: "" };
  
    try {
      const payloadMessages = this.messages.filter(msg => msg.role !== 'assistant' || msg.content.trim() !== "");
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: payloadMessages, 
          apiKey,
          userId
        })
      });
  
      if (!response.body) throw new Error("No response body");
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // Used to track if this is the first chunk
      let isFirstChunk = true;
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value, { stream: true });
  
        chunk.split("\n").forEach(line => {
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.replace("data: ", "").trim());
              if (parsed.content) {
                if (isFirstChunk) {
                  // First content chunk - add message to the list
                  assistantMessage.content = parsed.content;
                  this.messages.push(assistantMessage);
                  isFirstChunk = false;
                } else {
                  // Update existing message
                  assistantMessage.content += parsed.content;
                  this.messages[this.messages.length - 1].content = assistantMessage.content;
                }
                this.isLoading = false;
                this.updateMessages();
              }
            } catch (e) {
              console.error("Error parsing stream chunk:", e);
            }
          }
        });
      }
  
      // Auto-play the complete message
      const messageIndex = this.messages.indexOf(assistantMessage);
      if (messageIndex !== -1 && assistantMessage.content.trim() !== "") {
        // Small delay to ensure the message is fully rendered
        setTimeout(() => {
          this.playMessageAudio(assistantMessage.content, messageIndex);
        }, 500);
      }
  
    } catch (error) {
      console.error("Error fetching AI response:", error);
      assistantMessage.content = 'Sorry, I encountered an error while processing your request.';
      if (!this.messages.includes(assistantMessage)) {
        this.messages.push(assistantMessage);
      }
      this.isLoading = false;
      this.updateMessages();
    }
  }
}  

customElements.define('lulai-chat-widget', LulaiChatWidget);