class LulaiChatWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isChatOpen = false;
    this.isLoading = false;
    this.messages = JSON.parse(sessionStorage.getItem('lulai_chat_messages')) || [];
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
    this.ttsVoiceId = null;
    
    // Track product data
    this.mentionedProductLinks = [];
    this.lastMentionedProducts = [];
    this.currentProduct = null;
    
    // Cart status
    this.cartStatus = {
      status: 'idle',
      message: ''
    };
  
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
      pythonApiUrl: "http://localhost:8001",
      apiBaseUrl: "http://localhost:3000"
    };          
  }

  connectedCallback() {
    this.detectCurrentProduct();
    this.render();
    
    // Listen for URL changes to detect product context changes
    window.addEventListener('popstate', () => this.detectCurrentProduct());
    window.addEventListener('product-view-changed', (e) => {
      if (e.detail && e.detail.product) {
        this.currentProduct = e.detail.product;
      }
    });
    
    // Add listener for link clicks in the chat
    this.shadowRoot.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        const linkUrl = e.target.getAttribute('href');
        
        if (linkUrl && linkUrl.startsWith('http')) {
          this.lastMentionedProducts = [{
            url: linkUrl,
            text: e.target.textContent,
            full: e.target.outerHTML
          }];
        }
      }
    });
  }

  addIntentContext(intentType, data = {}) {
      this.lastIntentContext = {
        type: intentType,
        timestamp: new Date().getTime(),
        data: data
      };
    }
  
    extractProductIdFromUrl(url) {
      if (!url) return null;
      
      // Check for /product/123 pattern
      const match = url.match(/\/product\/(\d+)/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
      
      // Also check for query parameter ?product_id=123
      try {
        const urlObj = new URL(url.startsWith('http') ? url : `http://example.com${url}`);
        const productId = urlObj.searchParams.get('product_id');
        if (productId) {
          return parseInt(productId, 10);
        }
      } catch (e) {
        // URL parsing failed, continue with other extraction methods
      }
      
      return null;
    }

  extractProductLinks(content) {
      if (!content) return [];
      
      const links = [];
      const linkRegex = /<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
      let match;
      
      while ((match = linkRegex.exec(content)) !== null) {
        const url = match[1];
        const text = match[2];
        
        // Enhanced product detection 
        const isProduct = url.includes('/product/');          
        if (isProduct) {
          links.push({
            url: url,
            text: text,
            full: match[0],
            productId: this.extractProductIdFromUrl(url)
          });
        }
      }
      
      if (links.length > 0) {
        this.lastMentionedProducts = links;
        console.log("Extracted product links:", links);
      }
      
      return links;
    }

  findAndClickProductLink() {
    const chatMessages = this.shadowRoot.getElementById('chatMessages');
    if (!chatMessages) return false;
    
    const assistantMessages = chatMessages.querySelectorAll('.message-container.assistant');
    if (assistantMessages.length === 0) return false;
    
    for (let i = assistantMessages.length - 1; i >= 0; i--) {
      const message = assistantMessages[i];
      const links = message.querySelectorAll('a');
      
      if (links.length > 0) {
        links[0].click();
        return true;
      }
    }
    
    return false;
  }


  async handleCartOperation(operation, productId, quantity = 1) {
    if (!productId) {
      return false;
    }
    
    this.cartStatus = { status: 'processing', message: 'Processing...' };
    this.updateCartStatus();
    
    const action = {
      type: 'cart',
      operation: operation,
      productId: productId,
      quantity: quantity
    };
    
    const actionVerb = operation === 'add' ? 'Adding' : 
                        operation === 'remove' ? 'Removing' : 
                        'Updating';
                      
    const confirmMessage = { 
      role: 'assistant', 
      content: `${actionVerb} item to your cart...`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.addMessage(confirmMessage);
    
    await this.handleCartAction(action);
    return true;
  }

  detectCurrentProduct() {
    const productIdMatch = window.location.pathname.match(/\/product\/(\d+)/);
    if (productIdMatch) {
      const productId = parseInt(productIdMatch[1], 10);
      
      fetch(`${this.config.apiBaseUrl}/api/products/${productId}`)
        .then(response => response.json())
        .then(productData => {
          this.currentProduct = {
            id: productId,
            ...productData
          };
        })
        .catch(error => {
          this.currentProduct = null;
        });
    } else {
      this.currentProduct = null;
    }
  }

  render() {
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
        .timestamp {
          font-size: 10px;
          color: #888;
          margin-top: 4px;
        }
        .bubble.user .timestamp {
          text-align: right;
        }
        .bubble.assistant .timestamp {
          text-align: left;
        }
        .cart-status {
          position: absolute;
          top: -60px;
          right: 0;
          padding: 10px 15px;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          z-index: 1001;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          white-space: nowrap;
        }
        .cart-status.processing {
          background-color: #3498db;
        }
        .cart-status.success {
          background-color: #2ecc71;
        }
        .cart-status.error {
          background-color: #e74c3c;
        }
        .current-product-indicator {
          font-size: 12px;
          padding: 5px 10px;
          background-color: rgba(0,0,0,0.05);
          border-radius: 4px;
          margin: 0 0 5px 5px;
          color: #555;
        }
      </style>
      <div id="widget-container">
        ${this.cartStatus.status !== 'idle' ? 
          `<div id="cart-status" class="cart-status ${this.cartStatus.status}">${this.cartStatus.message}</div>` : 
          ''}
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
            ${this.currentProduct ? 
              `<div class="current-product-indicator">Viewing: ${this.currentProduct.name}</div>` : ''}
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
                      <div class="timestamp">${msg.timestamp || ''}</div>
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
      if (this.mediaRecorder) {
        if (this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
        }
        this.isListening = false;
        this.render();
        this.setupChatListeners();
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
    
    async prefetchTTS(text) {
      try {
        const requestBody = { input: text };
        
        const response = await fetch(`${this.config.pythonApiUrl}/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          throw new Error(`TTS API error: ${response.status}`);
        }
        
        return await response.arrayBuffer();
      } catch (error) {
        console.error('TTS prefetch error:', error);
        return new ArrayBuffer(0);
      }
    }
    
    extractTextFromJson(content) {
      if (!content) return '';
      
      if (content.includes('"response"')) {
        try {
          const jsonStart = content.indexOf('{');
          const jsonEnd = content.lastIndexOf('}');
          
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            try {
              const jsonStr = content.substring(jsonStart, jsonEnd + 1);
              const jsonObj = JSON.parse(jsonStr);
              
              if (jsonObj.response) {
                return jsonObj.response;
              }
            } catch (e) {
              // JSON parsing failed, try regex approach
            }
          }
          
          // Try regex if JSON parsing fails
          const responseMatch = content.match(/"response"\s*:\s*"([^"]*?)"/);
          if (responseMatch && responseMatch[1]) {
            return responseMatch[1];
          }
        } catch (e) {
          // Failed to extract text
        }
      }
      
      return content;
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
    
    async handleCartAction(action) {
      if (!action || action.type !== 'cart') return;
      
      this.cartStatus = { status: 'processing', message: 'Processing...' };
      this.updateCartStatus();
      
      try {
        let endpoint = '';
        let method = 'POST';
        let body = { productId: action.productId };
        
        if (action.operation === 'add') {
          endpoint = `${this.config.apiBaseUrl}/api/cart/add`;
          body.quantity = action.quantity || 1;
        } else if (action.operation === 'remove') {
          endpoint = `${this.config.apiBaseUrl}/api/cart/remove?productId=${action.productId}`;
          method = 'DELETE';
          body = undefined;
        } else if (action.operation === 'update') {
          endpoint = `${this.config.apiBaseUrl}/api/cart/update`;
          method = 'PUT';
          body = { productId: action.productId, quantity: action.quantity || 1 };
        }
        
        const response = await fetch(endpoint, {
          method,
          headers: method !== 'DELETE' ? { 'Content-Type': 'application/json' } : undefined,
          body: body ? JSON.stringify(body) : undefined
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          this.cartStatus = {
            status: 'success',
            message: action.operation === 'add' ? 'Added to cart successfully!' : 'Cart updated successfully!'
          };
          
          window.dispatchEvent(new Event('cart-updated'));
        } else {
          this.cartStatus = {
            status: 'error',
            message: data.error || 'Failed to update cart'
          };
        }
      } catch (error) {
        this.cartStatus = {
          status: 'error',
          message: error.message || 'Failed to update cart'
        };
      }
      
      this.updateCartStatus();
      
      setTimeout(() => {
        this.cartStatus = { status: 'idle', message: '' };
        this.updateCartStatus();
      }, 5000);
    }
    
    updateCartStatus() {
      const widgetContainer = this.shadowRoot.getElementById('widget-container');
      let statusEl = this.shadowRoot.getElementById('cart-status');
      
      if (!statusEl && this.cartStatus.status !== 'idle') {
        statusEl = document.createElement('div');
        statusEl.id = 'cart-status';
        widgetContainer.prepend(statusEl);
      }
      
      if (statusEl) {
        if (this.cartStatus.status === 'idle') {
          statusEl.remove();
        } else {
          statusEl.className = `cart-status ${this.cartStatus.status}`;
          statusEl.textContent = this.cartStatus.message;
        }
      }
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
    
    saveScrollPosition() {
      const messagesContainer = this.shadowRoot.getElementById('chatMessages');
      if (messagesContainer) {
        this.lastScrollPosition = messagesContainer.scrollTop;
      }
    }
    
    restoreScrollPosition() {
      const messagesContainer = this.shadowRoot.getElementById('chatMessages');
      if (messagesContainer) {
        setTimeout(() => {
          messagesContainer.scrollTop = this.lastScrollPosition;
        }, 0);
      }
    }
    
    updateMessages() {
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
                    <div class="timestamp">${msg.timestamp || ''}</div>
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
  
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
        this.shadowRoot.querySelectorAll('.tts-button').forEach(button => {
          button.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            if (this.speakingMessageIndex === index) this.stopTTS();
            else this.playMessageAudio(this.messages[index].content, index);
          });
        });
        
        // Save messages to sessionStorage after every update
        sessionStorage.setItem('lulai_chat_messages', JSON.stringify(this.messages));
      }
    }
    
    addMessage(message) {
      if (!message.timestamp) {
        message.timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      this.messages.push(message);
      this.updateMessages();
    }
    
    parseMarkdown(text) {
      if (!text) return '';
      
      let cleanText = this.extractTextFromJson(text);
      
      cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      cleanText = cleanText.replace(/\*(.*?)\*/g, '<em>$1</em>');
      cleanText = cleanText.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
      
      // Improved URL handling for markdown links [text](url)
      cleanText = cleanText.replace(
        /\[([^\[]+)\]\((https?:\/\/[^\/]+)(\/[^\)]+)\)/g, 
        (match, text, domain, path) => {
          // Store this as a mentioned product if it looks like one
          if (path.includes('/product/')) {
            
            this.lastMentionedProducts = [{
              url: `${this.config.apiBaseUrl}${path}`,
              text: text,
              full: `<a href="${this.config.apiBaseUrl}${path}" target="_self">${text}</a>`,
              productId: this.extractProductIdFromUrl(path)
            }];
          }
          
          return `<a href="${this.config.apiBaseUrl}${path}" target="_self">${text}</a>`;
        }
      );
      
      // Handle regular URLs better
      cleanText = cleanText.replace(
        /(https?:\/\/[^\/]+)(\/[^\s]+)/g,
        (match, domain, path) => {
          if (!match.includes(this.config.apiBaseUrl)) {
            if (path.includes('/product/')) {
              const productId = this.extractProductIdFromUrl(path);
              this.lastMentionedProducts = [{
                url: `${this.config.apiBaseUrl}${path}`,
                text: `Product ${productId}`,
                full: `<a href="${this.config.apiBaseUrl}${path}" target="_self">${path}</a>`,
                productId: productId
              }];
            }
            return `<a href="${this.config.apiBaseUrl}${path}" target="_self">${path}</a>`;
          }
          return match;
        }
      );
      
      // Handle other Markdown formatting...
      cleanText = cleanText.replace(/^### (.*)/gm, '<h3>$1</h3>');
      cleanText = cleanText.replace(/^## (.*)/gm, '<h2>$1</h2>');
      cleanText = cleanText.replace(/^# (.*)/gm, '<h1>$1</h1>');
      
      cleanText = cleanText.replace(/^\* (.*)/gm, '<li>$1</li>');
      cleanText = cleanText.replace(/^- (.*)/gm, '<li>$1</li>');
      cleanText = cleanText.replace(/^(\d+)\. (.*)/gm, '<li>$2</li>');
      
      cleanText = cleanText.replace(/(<li>.*<\/li>)(\s*)(<li>)/g, '$1$3');
      
      cleanText = cleanText.replace(/(<li>.*<\/li>)(?!\s*<li>)/g, '<ul>$1</ul>');
      
      cleanText = cleanText.replace(/^> (.*)/gm, '<blockquote>$1</blockquote>');
      
      cleanText = cleanText.replace(/\n\n([^<\n].*)/g, '<p>$1</p>');
      
      if (cleanText.includes('<a href')) {
        this.extractProductLinks(cleanText);
      }
      
      return cleanText;
    }
    
    handleSubmit(text) {
      const inputEl = this.shadowRoot.getElementById('chatInput');
      const inputValue = text !== undefined ? text.trim() : inputEl.value.trim();
      if (!inputValue) return;
      
      const userMessage = { 
        role: 'user', 
        content: inputValue,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      this.addMessage(userMessage);
      
      // IMPROVED: Better product navigation request detection
      const productKeywords = ['galaxy', 'tab', 'iphone', 'product', 'show me', 'take me to'];
      const inputLower = inputValue.toLowerCase();
      
      // Check if this is a new product navigation request
      if (productKeywords.some(keyword => inputLower.includes(keyword))) {
        console.log("Detected product navigation request, clearing previous product context");
        this.lastMentionedProducts = [];
        this.currentProduct = null; // Also reset current product to avoid fallback
      }
      
      if (text === undefined) inputEl.value = '';
      this.fetchResponse();
    }
    
    // This is part of the fetchResponse method in LulaiChatWidget class

    // Replace the fetchResponse method in the LulaiChatWidget class with this implementation

async fetchResponse() {
  this.isLoading = true;
  this.updateMessages();

  const apiEndpoint = this.getAttribute('api-endpoint') || 'http://localhost:3005/api/chat';
  const apiKey = this.getAttribute('api-key');
  
  const productContext = this.currentProduct 
    ? { currentProduct: this.currentProduct }
    : {};
  
  // Add last mentioned products to context
  const contextWithProducts = {
    ...productContext,
    url: window.location.href,
    lastMentionedProducts: this.lastMentionedProducts || []
  };
  
  try {
    const payloadMessages = this.messages.filter(msg => msg.role !== 'assistant' || msg.content.trim() !== "");
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        messages: payloadMessages, 
        apiKey,
        userId: this.userId,
        context: contextWithProducts
      })
    });

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let isFirstChunk = true;
    let assistantMessage = { 
      role: 'assistant', 
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    let actionDetected = false;
    let fullResponseText = "";
    let messageComplete = false;
    let navigationTriggered = false; // Track if navigation has been triggered
    let navigationTimeout = null; // Store timeout reference
    let messageAdded = false; // Track if we've already added a message to the chat

    console.log("Starting to read response stream");
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        messageComplete = true;
        console.log("Stream completed");
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      console.log("Received chunk:", chunk);

      chunk.split("\n").forEach(line => {
        if (line.startsWith("data: ")) {
          try {
            const parsedLine = line.replace("data: ", "").trim();
            if (!parsedLine) return;
            
            console.log("Processing line:", parsedLine);
            const parsed = JSON.parse(parsedLine);
            
            // Process action only once
            if (parsed.action && !actionDetected) {
              actionDetected = true;
              console.log("Action detected:", parsed.action);
              
              if (parsed.action.type === 'cart') {
                this.handleCartAction(parsed.action);
              } 
              else if (parsed.action.type === 'navigate' && !navigationTriggered) {
                navigationTriggered = true;
                console.log("Navigation action triggered");
                
                // For the first chunk with navigation action, we'll display the message that came from backend
                if (parsed.content && parsed.content.trim() !== "") {
                  // Only add the message if we haven't added one yet
                  if (!messageAdded) {
                    if (isFirstChunk) {
                      assistantMessage.content = parsed.content;
                      this.messages.push(assistantMessage);
                      messageAdded = true;
                      isFirstChunk = false;
                    } else {
                      assistantMessage.content = parsed.content;
                      this.messages[this.messages.length - 1].content = parsed.content;
                    }
                    
                    // Update UI immediately to show the message
                    this.isLoading = false;
                    this.updateMessages();
                  }
                }
                        
                
                    
                    // Create a corrected navigation path
                    let path = parsed.action.path;
                    const baseUrl = this.config.apiBaseUrl || 'http://localhost:3000';
                    
                    // Log the original request details before any modifications
                    console.log("Original navigation request:", {
                      requestedPath: path,
                      productName: parsed.action.productName,
                      currentProduct: this.currentProduct,
                      lastMentionedProducts: this.lastMentionedProducts
                    });
                    
                    // Handle case where no specific product was mentioned or path is invalid
                    if (!path || path === '/404') {
                      // Try to use lastMentionedProducts if available and not empty
                      if (this.lastMentionedProducts && this.lastMentionedProducts.length > 0) {
                        const lastProduct = this.lastMentionedProducts[0];
                        console.log("Using lastMentionedProduct for navigation:", lastProduct);
                        
                        // Extract path from URL if it's a full URL
                        if (lastProduct.url) {
                          try {
                            // Properly extract just the path portion from a complete URL
                            const urlObj = new URL(lastProduct.url);
                            path = urlObj.pathname;
                          } catch (e) {
                            // If URL parsing fails, try to extract the path directly
                            const urlMatch = lastProduct.url.match(/\/product\/\d+/);
                            if (urlMatch) {
                              path = urlMatch[0];
                            }
                          }
                        } else if (lastProduct.productId) {
                          // Use productId directly if available
                          path = `/product/${lastProduct.productId}`;
                        }
                      } else if (this.currentProduct && this.currentProduct.id) {
                        // Only fall back to current product if explicitly requested or no other context
                        console.log("Falling back to currentProduct:", this.currentProduct);
                        path = `/product/${this.currentProduct.id}`;
                      } else {
                        // If no product context available, default to home page
                        console.log("No product context found, defaulting to home page");
                        path = "/";
                      }
                    }
                    
                    // Check if path already contains the full URL and fix it
                    if (path && path.includes('http')) {
                      try {
                        // Extract only the pathname from the full URL
                        const urlObj = new URL(path);
                        path = urlObj.pathname;
                        console.log("Extracted path from URL:", path);
                      } catch (e) {
                        // Fallback: Remove any http://domain portion manually
                        const pathMatch = path.match(/\/product\/\d+/);
                        if (pathMatch) {
                          path = pathMatch[0];
                          console.log("Extracted product path using regex:", path);
                        } else {
                          console.error("Failed to extract valid path from URL:", path);
                          path = "/"; // Default to home page
                        }
                      }
                    }
                    
                    // Ensure path is valid before navigation
                    if (!path || path === '/404') {
                      console.log("Invalid path detected, defaulting to home page");
                      path = "/"; // Default to home page if invalid
                    }
                    
                    // Make sure the path is properly formed
                    if (path && !path.startsWith('/')) {
                      path = '/' + path;
                    }
                    
                    // Cancel any existing navigation timeout
                    if (navigationTimeout) {
                      clearTimeout(navigationTimeout);
                    }
                    
                    // Log the final navigation path for debugging
                    console.log("Final navigation path:", {
                      path: path,
                      fullUrl: `${baseUrl}${path}`
                    });
                    
                    // Use the correct base URL for navigation
                    navigationTimeout = setTimeout(() => {
                      // Create the full URL with path only (not duplicating the domain)
                      const fullUrl = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
                      console.log("Navigating to:", fullUrl);
                      window.location.href = fullUrl;
                    }, 2000); // 2 second delay to ensure message is visible
                    
                    // Continue processing to allow UI updates to complete
                  }
                }
                
                // Process regular content (non-action or in addition to action)
            if (parsed.content !== undefined) {
              console.log("Content chunk received:", parsed.content);
              fullResponseText += parsed.content;
              
              // Don't process content for navigation actions that have already been handled
              if (navigationTriggered) {
                console.log("Navigation already triggered, skipping content processing");
                return;
              }
              
              // For regular conversational responses
              if (!messageAdded) {
                if (isFirstChunk) {
                  console.log("Adding first chunk to new message:", parsed.content);
                  assistantMessage.content = parsed.content;
                  this.messages.push(assistantMessage);
                  messageAdded = true;
                  isFirstChunk = false;
                } else {
                  console.log("Appending to existing message. Current:", this.messages[this.messages.length - 1].content);
                  console.log("Adding:", parsed.content);
                  this.messages[this.messages.length - 1].content += parsed.content;
                }
                
                this.isLoading = false;
                this.updateMessages();
              } else {
                // Even if message was already added, we should append new content
                console.log("Message already added, appending new content");
                this.messages[this.messages.length - 1].content += parsed.content;
                this.updateMessages();
              }
            }
            
            // Check for final message with done flag
            if (parsed.done) {
              console.log("Done flag received, message complete");
              messageComplete = true;
            }
          } catch (e) {
            console.error("Error parsing stream chunk:", e, "Raw line:", line);
          }
        }
      });
    }

    console.log("Final message state:", messageComplete, "Content:", fullResponseText);
    
    // Handle any JSON extraction only after the full message is received
    if (messageComplete && fullResponseText.includes('"response"')) {
      try {
        const jsonRegex = /\{[\s\S]*"response"\s*:\s*"([^"]+)"[\s\S]*\}/;
        const match = fullResponseText.match(jsonRegex);
        
        if (match && match[1] && match[1].length > 5) { // Only use substantial content
          console.log("Extracted response from JSON:", match[1]);
          // Only replace if the message exists and isn't a navigation message
          if (!navigationTriggered && this.messages.length > 0) {
            this.messages[this.messages.length - 1].content = match[1];
            this.updateMessages();
          }
        }
      } catch (e) {
        console.error("Error extracting JSON response:", e);
      }
    }
    
    // Prepare for text-to-speech if appropriate
    if (messageComplete && !navigationTriggered && this.messages.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const lastMessageIndex = this.messages.length - 1;
      if (this.messages[lastMessageIndex].content.trim() !== "") {
        this.playMessageAudio(this.messages[lastMessageIndex].content, lastMessageIndex);
      }
    }

  } catch (error) {
    console.error("Error fetching AI response:", error);
    const errorMessage = { 
      role: 'assistant', 
      content: 'Sorry, I encountered an error while processing your request.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    // Don't add error message if navigation was triggered
    if (!navigationTriggered) {
      this.messages.push(errorMessage);
    }
    
    this.isLoading = false;
    this.updateMessages();
  }
}
    
    async playMessageAudio(message, index) {
      this.stopTTS();
      
      this.isProcessingTTS = true;
      this.speakingMessageIndex = index;
      this.updateMessages();
      
      const cleanText = this.extractTextFromJson(message);
      const chunks = this.splitTextIntoChunks(cleanText);
      
      if (!chunks.length) {
        this.isProcessingTTS = false;
        this.speakingMessageIndex = null;
        this.updateMessages();
        return;
      }
      
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        if (this.audioContext.state !== 'running') {
          await this.audioContext.resume();
        }
        
        this.isPlayingTTS = true;
        this.isProcessingTTS = false;
        this.updateMessages();
        
        let currentChunk = 0;
        let nextAudioPromise = this.prefetchTTS(chunks[currentChunk]);
        
        while (currentChunk < chunks.length && this.isPlayingTTS) {
          try {
            const audioBuffer = await nextAudioPromise;
            
            if (!audioBuffer || audioBuffer.byteLength === 0) {
              currentChunk++;
              if (currentChunk < chunks.length) {
                nextAudioPromise = this.prefetchTTS(chunks[currentChunk]);
              }
              continue;
            }
            
            if (currentChunk < chunks.length - 1) {
              nextAudioPromise = this.prefetchTTS(chunks[currentChunk + 1]);
            }
            
            const source = this.audioContext.createBufferSource();
            
            try {
              source.buffer = await this.audioContext.decodeAudioData(audioBuffer);
              source.connect(this.audioContext.destination);
              this.audioSource = source;
              source.start(0);
              
              await new Promise(resolve => {
                source.onended = () => {
                  resolve();
                };
                
                const timeoutId = setTimeout(() => {
                  if (this.isPlayingTTS) {
                    resolve();
                  }
                }, (source.buffer.duration * 1000) + 1000);
                
                const checkInterval = setInterval(() => {
                  if (!this.isPlayingTTS) {
                    clearInterval(checkInterval);
                    clearTimeout(timeoutId);
                    try { source.stop(); } catch (e) { /* ignore */ }
                    resolve();
                  }
                }, 100);
              });
            } catch (decodeError) {
              console.error("Failed to decode audio data:", decodeError);
            }
            
            currentChunk++;
          } catch (error) {
            console.error('Error playing chunk:', error);
            currentChunk++;
          }
        }
      } catch (error) {
        console.error('TTS playback error:', error);
      } finally {
        this.stopTTS();
      }
    }
  }
  
  customElements.define('lulai-chat-widget', LulaiChatWidget);