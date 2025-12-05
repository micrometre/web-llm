import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    headers: {
      // Required for SharedArrayBuffer (used by some WebLLM features)
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    exclude: ['@mlc-ai/web-llm'],
  },
});
