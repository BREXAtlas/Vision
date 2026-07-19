import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

const dockStyles = `
.full-app-dock {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  gap: .45rem;
  flex-wrap: wrap;
  padding: .65rem .8rem;
  background: rgba(8, 15, 36, .96);
  border-bottom: 1px solid #243259;
  backdrop-filter: blur(16px);
}
.full-app-dock a {
  color: #9ba6c4;
  border: 1px solid #243259;
  border-radius: 999px;
  padding: .48rem .8rem;
  font: 600 .76rem/1 Inter, system-ui, sans-serif;
  text-decoration: none;
}
.full-app-dock a:hover,
.full-app-dock a:focus-visible {
  color: #f0da9b;
  border-color: #d4af37;
  outline: none;
}
.full-app-dock a.primary-link {
  color: #141002;
  border-color: #f0da9b;
  background: linear-gradient(120deg, #d4af37, #b8860b);
}
@media (max-width: 560px) {
  .full-app-dock { justify-content: flex-start; overflow-x: auto; flex-wrap: nowrap; }
  .full-app-dock a { flex: 0 0 auto; }
}
`;

export default defineConfig({
  // Relative assets work at brexatlas.github.io/Vision/ and remain compatible
  // with a future GitHub Pages custom domain without another rebuild.
  base: './',
  plugins: [
    react(),
    {
      name: 'vision-life-navigation',
      transformIndexHtml: {
        order: 'pre',
        handler(html, context) {
          if (
            context.path.endsWith('/app.html') ||
            context.path.endsWith('/auth-callback.html')
          ) {
            return html;
          }
          return {
            html,
            tags: [
              {
                tag: 'meta',
                attrs: {
                  name: 'description',
                  content:
                    'Live the McGaffie future-day vision, learn the mechanics beneath it, and continue into the complete Vision 2031 five-year game.',
                },
                injectTo: 'head',
              },
              {
                tag: 'meta',
                attrs: { name: 'theme-color', content: '#080f24' },
                injectTo: 'head',
              },
              {
                tag: 'style',
                children: dockStyles,
                injectTo: 'head',
              },
              {
                tag: 'script',
                children:
                  "try{localStorage.removeItem('supa_url');localStorage.removeItem('supa_key')}catch(e){}",
                injectTo: 'body-prepend',
              },
              {
                tag: 'nav',
                attrs: {
                  class: 'full-app-dock',
                  'aria-label': 'Complete Vision 2031 application',
                },
                children: `
                  <a class="primary-link" data-full-app-link href="./app.html#/">Open Full Vision 2031</a>
                  <a data-full-app-link href="./app.html#/today">Daily Chapter</a>
                  <a data-full-app-link href="./app.html#/timeline">15-Quarter Map</a>
                  <a data-full-app-link href="./app.html#/academy">Academy</a>
                  <a data-full-app-link href="./app.html#/wealth-lab">Wealth Lab</a>
                  <a data-full-app-link href="./app.html#/projects">Projects</a>
                `,
                injectTo: 'body-prepend',
              },
              {
                tag: 'script',
                attrs: { type: 'module', src: '/src/landingBridge.ts' },
                injectTo: 'body',
              },
              {
                tag: 'script',
                attrs: { type: 'module', src: '/src/cloudMemory.ts' },
                injectTo: 'body',
              },
            ],
          };
        },
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        simulation: resolve(rootDir, 'index.html'),
        app: resolve(rootDir, 'app.html'),
        authCallback: resolve(rootDir, 'auth-callback.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
