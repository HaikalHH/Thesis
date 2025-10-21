#!/usr/bin/env node

/**
 * Script untuk copy PDF.js worker file ke public folder
 * Dijalankan otomatis setelah npm install
 */

const fs = require('fs');
const path = require('path');

// Try examples node_modules first, then root node_modules
const workerSrcLocal = path.join(__dirname, '../node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
const workerSrcRoot = path.join(__dirname, '../../node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
const workerDest = path.join(__dirname, '../public/pdf.worker.min.mjs');

let workerSrc = workerSrcLocal;
if (!fs.existsSync(workerSrcLocal)) {
  workerSrc = workerSrcRoot;
}

try {
  // Check if source exists
  if (!fs.existsSync(workerSrc)) {
    console.error('❌ PDF.js worker file not found');
    console.error('   Tried:', workerSrcLocal);
    console.error('   Tried:', workerSrcRoot);
    console.error('   Note: Worker is bundled in library, but we need it in public/');
    console.error('   Run from root: npm run build');
    process.exit(1);
  }

  // Create public folder if doesn't exist
  const publicDir = path.dirname(workerDest);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Copy worker file
  fs.copyFileSync(workerSrc, workerDest);
  console.log('✅ PDF.js worker copied to public/pdf.worker.min.mjs');
} catch (error) {
  console.error('❌ Error copying PDF.js worker:', error.message);
  process.exit(1);
}

