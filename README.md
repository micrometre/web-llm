# 🧠 Browser SLM Chat

A **100% browser-based** Small Language Model (SLM) chat application powered by [WebLLM](https://github.com/mlc-ai/web-llm). Run AI models directly in your browser using WebGPU acceleration — no server required!

![Browser SLM Chat Demo](https://img.shields.io/badge/WebGPU-Powered-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Features

- **🔒 100% Client-Side** — All processing happens in your browser. No data leaves your device.
- **⚡ WebGPU Acceleration** — Leverages your GPU for fast inference
- **💾 OPFS Caching** — Models are cached locally after first download for instant loading
- **🌊 Streaming Responses** — See AI responses as they're generated in real-time
- **📱 Responsive Design** — Works on desktop and mobile browsers
- **🎨 Dark Theme** — Easy on the eyes

## 🤖 Supported Models

| Model | Size | Description |
|-------|------|-------------|
| **Llama 3.2 1B** | ~700MB | Recommended - Meta's latest small model |
| **Qwen2.5 0.5B** | ~400MB | Fastest option - great for quick responses |
| **Qwen2.5 1.5B** | ~1GB | Good balance of speed and quality |
| **SmolLM2 360M** | ~250MB | Tiny model for basic tasks |
| **TinyLlama 1.1B** | ~700MB | Compact and efficient |
| **Gemma 2 2B** | ~1.5GB | Google's capable model |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Chrome 113+** or **Edge 113+** (WebGPU support required)
- A GPU (integrated graphics work, dedicated GPU recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/micrometre/browser-slm
cd browser-slm

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open **http://localhost:5173** in Chrome or Edge.

### Production Build

```bash
npm run build
npm run preview
```

## ⚠️ WebGPU Troubleshooting

If you see "No WebGPU adapter found", you need to enable WebGPU in Chrome:

### Option 1: Enable via Chrome Flags

1. Open `chrome://flags` in Chrome
2. Search for `#enable-unsafe-webgpu`
3. Set it to **Enabled**
4. Click **Relaunch**

### Option 2: Launch Chrome with Flags (Recommended for Linux)

```bash
google-chrome --enable-unsafe-webgpu --enable-features=Vulkan --use-vulkan http://localhost:5173
```

### Option 3: If You Get Shader Errors

If you see errors like `GPUPipelineError: Invalid ShaderModule`, try launching with OpenGL:

```bash
google-chrome --enable-unsafe-webgpu --use-angle=gl http://localhost:5173
```

### Verify WebGPU Status

1. Open `chrome://gpu` in Chrome
2. Scroll to find "WebGPU"
3. Should show "Hardware accelerated" ✅

## 🏗️ Project Structure

```
browser-slm-chat/
├── index.html          # Main HTML with chat UI
├── src/
│   ├── main.js         # WebLLM engine & chat logic
│   └── styles.css      # Dark theme styling
├── package.json        # Dependencies
└── vite.config.js      # Vite config with CORS headers
```

## 🔧 How It Works

1. **WebLLM** loads a quantized LLM model directly into your browser
2. **WebGPU** provides GPU acceleration for fast inference
3. **OPFS** (Origin Private File System) caches model weights for faster subsequent loads
4. The chat interface streams responses token-by-token for a smooth experience

## 📦 Dependencies

- [`@mlc-ai/web-llm`](https://github.com/mlc-ai/web-llm) — WebGPU-accelerated LLM inference
- [`vite`](https://vitejs.dev/) — Fast build tool and dev server

## 🌐 Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome 113+ | ✅ Supported |
| Edge 113+ | ✅ Supported |
| Firefox | ⚠️ WebGPU behind flag |
| Safari | ⚠️ Limited WebGPU support |

## 📄 License

MIT License — feel free to use this project for any purpose.

## 🙏 Acknowledgments

- [MLC AI](https://mlc.ai/) for the amazing WebLLM library
- Model creators: Qwen, Microsoft, Google, Hugging Face, Meta

---

**Made with ❤️ using WebLLM and WebGPU**
