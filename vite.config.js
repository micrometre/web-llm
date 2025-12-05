import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    headers: {
      // Required for SharedArrayBuffer (used by some WebLLM features)
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  build: {
    // WebLLM is large (~5MB) - this is expected for browser ML runtime
    chunkSizeWarningLimit: 6000,
  },
  optimizeDeps: {
    exclude: ['@mlc-ai/web-llm'],
  },
});
