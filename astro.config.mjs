import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://twixxt.vercel.app',
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
  },
  image: {
    defaultFormat: 'avif',
    quality: 80,
  }
});
