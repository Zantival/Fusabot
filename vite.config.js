import { defineConfig } from 'vite';
import { readFileSync } from 'fs';

export default defineConfig({
  root: 'public',
  build: {
    outDir: '../dist'
  },
  define: {
    __VITE_GROQ_API_KEY__: JSON.stringify(process.env.VITE_GROQ_API_KEY || ''),
    __VITE_GROQ_MODEL__: JSON.stringify(process.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile')
  }
});