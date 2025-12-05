import * as webllm from '@mlc-ai/web-llm';

// DOM Elements
const modelSelect = document.getElementById('model-select');
const loadBtn = document.getElementById('load-btn');
const unloadBtn = document.getElementById('unload-btn');
const progressContainer = document.getElementById('progress-container');
const progressText = document.getElementById('progress-text');
const progressPercent = document.getElementById('progress-percent');
const progressFill = document.getElementById('progress-fill');
const gpuInfo = document.getElementById('gpu-info');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const statsText = document.getElementById('stats-text');

// State
let engine = null;
let isGenerating = false;
let conversationHistory = [];

// Check WebGPU support
async function checkWebGPU() {
  if (!navigator.gpu) {
    gpuInfo.innerHTML = `
      ❌ <strong>WebGPU not supported in this browser.</strong><br>
      <span style="font-size: 0.75rem;">Please open this app in <strong>Chrome 113+</strong> or <strong>Edge 113+</strong> in a regular browser window.<br>
      URL: <code>http://localhost:5173</code></span>
    `;
    gpuInfo.style.color = '#ef4444';
    loadBtn.disabled = true;
    return false;
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      gpuInfo.innerHTML = `
        ❌ <strong>No WebGPU adapter found.</strong><br>
        <span style="font-size: 0.75rem;">Please check your GPU drivers or try a different browser.</span>
      `;
      gpuInfo.style.color = '#ef4444';
      loadBtn.disabled = true;
      return false;
    }

    // Try to get a device to verify full WebGPU support
    const device = await adapter.requestDevice();
    if (!device) {
      throw new Error('Could not create WebGPU device');
    }

    let adapterInfo = { description: 'Unknown GPU' };
    try {
      adapterInfo = await adapter.requestAdapterInfo();
    } catch (e) {
      // Some browsers don't support requestAdapterInfo
    }
    
    const gpuName = adapterInfo.description || adapterInfo.device || adapterInfo.vendor || 'WebGPU Device';
    gpuInfo.innerHTML = `✅ WebGPU ready • GPU: ${gpuName}`;
    gpuInfo.style.color = '#22c55e';
    return true;
  } catch (err) {
    console.error('WebGPU check failed:', err);
    gpuInfo.innerHTML = `
      ❌ <strong>WebGPU initialization failed.</strong><br>
      <span style="font-size: 0.75rem;">
        This may happen in embedded browsers (like VS Code Simple Browser).<br>
        Please open <code>http://localhost:5173</code> in Chrome or Edge directly.
      </span>
    `;
    gpuInfo.style.color = '#ef4444';
    loadBtn.disabled = true;
    return false;
  }
}

// Progress callback for model loading
function updateProgress(report) {
  progressContainer.classList.remove('hidden');
  
  const { progress, text } = report;
  const percent = Math.round(progress * 100);
  
  progressText.textContent = text;
  progressPercent.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
  
  // Log to console for debugging
  console.log(`[WebLLM] ${text} - ${percent}%`);
}

// Load the selected model
async function loadModel() {
  const selectedModel = modelSelect.value;
  
  loadBtn.disabled = true;
  loadBtn.textContent = 'Loading...';
  modelSelect.disabled = true;
  
  try {
    // Create engine with OPFS caching (default behavior in WebLLM)
    engine = await webllm.CreateMLCEngine(selectedModel, {
      initProgressCallback: updateProgress,
      logLevel: 'INFO',
    });
    
    // Model loaded successfully
    progressContainer.classList.add('hidden');
    unloadBtn.disabled = false;
    userInput.disabled = false;
    sendBtn.disabled = false;
    loadBtn.textContent = 'Loaded ✓';
    
    // Clear welcome message and show ready state
    chatMessages.innerHTML = '';
    addMessage('assistant', `🎉 Model **${selectedModel}** loaded successfully! How can I help you?`);
    
    // Update stats
    statsText.textContent = `Model: ${selectedModel} • Ready`;
    
    // Reset conversation
    conversationHistory = [];
    
    userInput.focus();
    
  } catch (err) {
    console.error('Failed to load model:', err);
    progressContainer.classList.add('hidden');
    loadBtn.disabled = false;
    loadBtn.textContent = 'Load Model';
    modelSelect.disabled = false;
    
    addMessage('error', `Failed to load model: ${err.message}`);
  }
}

// Unload the current model
async function unloadModel() {
  if (engine) {
    await engine.unload();
    engine = null;
  }
  
  unloadBtn.disabled = true;
  loadBtn.disabled = false;
  loadBtn.textContent = 'Load Model';
  modelSelect.disabled = false;
  userInput.disabled = true;
  sendBtn.disabled = true;
  
  conversationHistory = [];
  statsText.textContent = 'No model loaded';
  
  chatMessages.innerHTML = `
    <div class="welcome-message">
      <p>👋 Model unloaded. Select a model and click <strong>Load Model</strong> to start chatting.</p>
    </div>
  `;
}

// Add a message to the chat
function addMessage(role, content) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;
  
  // Simple markdown-like formatting
  const formattedContent = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/\n/g, '<br>');
  
  messageDiv.innerHTML = formattedContent;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return messageDiv;
}

// Create typing indicator
function addTypingIndicator() {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message assistant';
  messageDiv.id = 'typing-indicator';
  messageDiv.innerHTML = `
    <div class="typing-indicator">
      <span></span><span></span><span></span>
    </div>
  `;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return messageDiv;
}

// Remove typing indicator
function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.remove();
  }
}

// Send message and get response
async function sendMessage(userMessage) {
  if (!engine || isGenerating || !userMessage.trim()) return;
  
  isGenerating = true;
  sendBtn.disabled = true;
  userInput.disabled = true;
  
  // Add user message to chat
  addMessage('user', userMessage);
  
  // Add to conversation history
  conversationHistory.push({
    role: 'user',
    content: userMessage,
  });
  
  // Show typing indicator
  const typingIndicator = addTypingIndicator();
  
  try {
    const startTime = performance.now();
    let responseContent = '';
    let tokenCount = 0;
    
    // Create assistant message element for streaming
    removeTypingIndicator();
    const assistantMessage = addMessage('assistant', '');
    
    // Stream the response
    const stream = await engine.chat.completions.create({
      messages: conversationHistory,
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
    });
    
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      responseContent += delta;
      tokenCount++;
      
      // Update the message with formatted content
      const formattedContent = responseContent
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        .replace(/\n/g, '<br>');
      
      assistantMessage.innerHTML = formattedContent;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000;
    const tokensPerSecond = (tokenCount / duration).toFixed(1);
    
    // Add to conversation history
    conversationHistory.push({
      role: 'assistant',
      content: responseContent,
    });
    
    // Update stats
    statsText.textContent = `Last response: ${tokenCount} tokens in ${duration.toFixed(1)}s (${tokensPerSecond} tok/s)`;
    
  } catch (err) {
    console.error('Generation error:', err);
    removeTypingIndicator();
    addMessage('error', `Error: ${err.message}`);
  } finally {
    isGenerating = false;
    sendBtn.disabled = false;
    userInput.disabled = false;
    userInput.focus();
  }
}

// Auto-resize textarea
function autoResizeTextarea() {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 150) + 'px';
}

// Event Listeners
loadBtn.addEventListener('click', loadModel);
unloadBtn.addEventListener('click', unloadModel);

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (message) {
    userInput.value = '';
    autoResizeTextarea();
    sendMessage(message);
  }
});

userInput.addEventListener('input', autoResizeTextarea);

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event('submit'));
  }
});

// Initialize
checkWebGPU();
