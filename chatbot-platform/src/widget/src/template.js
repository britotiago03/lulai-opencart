// widget/src/template.js
class LulaiChatWidget extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.isChatOpen = false;
      this.isLoading = false;
      this.messages = [];
      
      // Configuration object that will be replaced during build
      this.config = {
        primaryColor: "{{primaryColor}}",
        secondaryColor: "{{secondaryColor}}",
        buttonSize: "{{buttonSize}}",
        windowWidth: "{{windowWidth}}",
        windowHeight: "{{windowHeight}}",
        headerText: "{{headerText}}",
        fontFamily: "{{fontFamily}}"
      };
    }
  
    connectedCallback() {
      this.render();
    }
  
    render() {
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
          }
          .bubble.user {
            background-color: ${this.config.secondaryColor};
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
            background-color: ${this.config.primaryColor};
            color: white;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
          }
        </style>
        <div id="widget-container">
          ${this.isChatOpen ? this.getChatWindowHTML() : ''}
          <button class="chat-button" id="chatToggle">${this.isChatOpen ? '–' : '+'}</button>
        </div>
      `;
      this.shadowRoot.innerHTML = widgetContainer;
  
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
            <span>${this.config.headerText}</span>
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
    
      const apiEndpoint = this.getAttribute('api-endpoint') || 'http://localhost:3001/api/chat';
      const storeName = this.getAttribute('store-name');
      
      let assistantMessage = { role: 'assistant', content: "" };
      this.messages.push(assistantMessage);
      this.updateMessages();
    
      try {
        const payloadMessages = this.messages.filter(msg => msg.role !== 'assistant' || msg.content.trim() !== "");
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: payloadMessages, storeName: storeName })
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
                  this.messages = this.messages.map(msg =>
                    msg.role === 'assistant' && msg.content === "" ? { ...msg, content: assistantMessage.content } : msg
                  );
                  this.updateMessages();
                }
              } catch (e) {
                console.error("Error parsing stream chunk:", e);
              }
            }
          });
        }
        
      } catch (error) {
        console.error("Error fetching AI response:", error);
        this.messages.push({ role: 'assistant', content: 'Sorry, I encountered an error while processing your request.' });
        this.updateMessages();
      }
      
      this.isLoading = false;
      this.updateMessages();
    }
  }
  
  customElements.define('lulai-chat-widget', LulaiChatWidget);