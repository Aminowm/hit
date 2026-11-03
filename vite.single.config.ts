import { readFileSync } from 'node:fs';
import { defineConfig, mergeConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import base from './vite.config';

/**
 * Builds the whole app into ONE self-contained HTML file (dist-single/index.html):
 * scripts, styles and fonts are inlined, so it opens by double-click in Chrome
 * (file://), works offline, and needs no server.
 */
const favicon = `data:image/svg+xml;base64,${readFileSync('public/favicon.svg').toString('base64')}`;

export default mergeConfig(
  base,
  defineConfig({
    publicDir: false,
    plugins: [
      viteSingleFile(),
      { name: 'inline-favicon', transformIndexHtml: (html: string) => html.replace('./favicon.svg', favicon) },
    ],
    build: {
      outDir: 'dist-single',
      emptyOutDir: true,
      assetsInlineLimit: () => true,
    },
  }),
);
