import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['lib/index.ts', 'lib/styles/docx-preview.css'],
  format: ['esm', 'cjs'],
  dts: false, // Skip type definitions for now - tsup has issues with JSX
  splitting: false,
  sourcemap: true,
  clean: true,
  loader: {
    '.css': 'css',
  },
  external: [
    'react',
    'react-dom',
    'next',
  ],
  // Bundle all document processing libraries into the library
  noExternal: [
    'pdfjs-dist',
    'docx-preview',
    'html2canvas',
    'jspdf',
    'jszip',
    'xml2js',
  ],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});

