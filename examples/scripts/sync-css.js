/**
 * Script untuk sync CSS dari dist ke examples
 * Run otomatis sebelum dev server
 */

const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '../../dist/styles/docx-preview.css');
const target = path.join(__dirname, '../app/docx-preview.css');

try {
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, target);
    console.log('✅ CSS synced from dist/styles/docx-preview.css to examples/app/docx-preview.css');
  } else {
    console.warn('⚠️ dist/styles/docx-preview.css not found. Run npm run build first.');
  }
} catch (error) {
  console.error('❌ Error syncing CSS:', error.message);
  process.exit(1);
}

