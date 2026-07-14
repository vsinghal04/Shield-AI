import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
    {
      name: 'strip-sw-preload',
      generateBundle(_options, bundle) {
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (fileName.includes('service-worker') && chunk.type === 'chunk') {
            // Remove preload helper import and __vite__mapDeps calls
            chunk.code = chunk.code
              .replace(/import\{[^}]+\}from["'][^"']*preload-helper[^"']*["'];?/g, '')
              .replace(/,__vite__mapDeps\(\[[^\]]*\]\)/g, '')
              .replace(/__vite__mapDeps\(\[[^\]]*\]\)/g, '[]');
          }
        }
      }
    }
  ],
  build: {
    target: 'esnext',
    modulePreload: false, // ← CRITICAL: disables preload-helper injection
    rollupOptions: {
      input: {
        popup: 'popup.html',
        options: 'options.html',
        warning: 'warning.html',
      },
      output: {
        // Prevent Rollup from injecting preload helpers into SW
        generatedCode: {
          preset: 'es2015',
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web', '@xenova/transformers', 'tesseract.js'],
  },
  worker: {
    format: 'es',
  },
})
