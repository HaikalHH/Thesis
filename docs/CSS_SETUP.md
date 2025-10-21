# CSS Setup Guide

## Masalah yang Diselesaikan

Komponen `DocxPreview` membutuhkan CSS untuk styling multi-page layout. Dokumentasi ini menjelaskan cara setup CSS dengan benar.

## Setup untuk Development (Examples)

### Otomatis (Recommended)

Script `sync-css.js` akan otomatis copy CSS dari `dist/index.css` ke `examples/app/docx-preview.css` setiap kali:

```bash
npm run dev          # Auto-run predev hook
npm run build        # Auto-run dalam build process
npm run sync-css     # Manual run
```

**File yang di-generate:**
- `examples/app/docx-preview.css` (auto-synced, git-ignored)

**Import di layout:**
```tsx
import "./docx-preview.css";
```

### Manual

Jika auto-sync tidak berfungsi:

```bash
# 1. Build library dulu
npm run build

# 2. Copy CSS ke examples
cd examples
npm run sync-css
```

## Setup untuk Production (Published Library)

### Opsi 1: Import CSS di Layout (Next.js App Router)

```tsx
// app/layout.tsx
import '@haikal/react-pdf-viewer/dist/index.css';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### Opsi 2: Import CSS di Component

```tsx
// app/page.tsx
import { DocxPreview } from '@haikal/react-pdf-viewer';
import '@haikal/react-pdf-viewer/dist/index.css';

export default function Page() {
  return <DocxPreview file="/document.docx" />;
}
```

### Opsi 3: Import CSS di globals.css

```css
/* app/globals.css */
@import '@haikal/react-pdf-viewer/dist/index.css';
```

### Opsi 4: Link dari public/

```tsx
// Copy dist/index.css ke public/docx-preview.css
// Lalu di layout:
import Head from 'next/head';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <link rel="stylesheet" href="/docx-preview.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## CSS Files Structure

```
dist/
├── index.css                    # Main CSS (bundled)
├── index.css.map                # Source map
└── styles/
    ├── docx-preview.css         # Original source
    └── docx-preview.css.map     # Source map
```

**Recommended:** Import `dist/index.css` (bukan `dist/styles/docx-preview.css`)

## Troubleshooting

### Error: "Can't resolve '../../../dist/index.css'"

**Penyebab:** Path CSS salah

**Solusi untuk Examples:**
```tsx
// ❌ SALAH
import "../../../dist/index.css";

// ✅ BENAR (examples/app/layout.tsx)
import "./docx-preview.css";
```

**Solusi untuk Published Package:**
```tsx
import '@haikal/react-pdf-viewer/dist/index.css';
```

### CSS tidak apply setelah import

**Checklist:**
1. ✅ File CSS sudah di-import?
2. ✅ Build library sudah di-run? (`npm run build`)
3. ✅ Dev server sudah di-restart?
4. ✅ Browser cache sudah di-clear?

**Debug:**
```bash
# Check apakah CSS exists
ls dist/index.css

# Rebuild library
npm run build

# Sync CSS (untuk examples)
cd examples && npm run sync-css

# Restart dev server
npm run dev
```

### CSS conflict dengan Tailwind

Jika ada conflict dengan Tailwind CSS:

```tsx
// Wrap DocxPreview dalam container tanpa Tailwind reset
<div className="docx-container">
  <DocxPreview file={file} />
</div>
```

```css
/* globals.css */
.docx-container {
  all: initial; /* Reset Tailwind */
}
```

### CSS tidak ter-bundle saat publish

**Checklist tsup.config.ts:**

```typescript
export default defineConfig({
  entry: ['lib/index.ts', 'lib/styles/docx-preview.css'], // ✅
  loader: {
    '.css': 'css', // ✅
  },
  noExternal: ['jszip', 'xml2js'], // ✅ Bundle dependencies
});
```

## Best Practices

### 1. Import di Root Layout (Recommended)

```tsx
// app/layout.tsx - Import sekali untuk seluruh app
import '@haikal/react-pdf-viewer/dist/index.css';
```

**Keuntungan:**
- ✅ CSS loaded once
- ✅ Available di semua pages
- ✅ Better performance

### 2. Lazy Load CSS (Advanced)

```tsx
import dynamic from 'next/dynamic';

const DocxPreview = dynamic(
  () => import('@haikal/react-pdf-viewer').then(mod => {
    import('@haikal/react-pdf-viewer/dist/index.css');
    return mod.DocxPreview;
  }),
  { ssr: false }
);
```

### 3. Conditional Import

```tsx
// Only import CSS when needed
if (fileType === 'docx') {
  import('@haikal/react-pdf-viewer/dist/index.css');
}
```

## CSS Content Overview

File `index.css` contains:

- `.docx-preview-container` - Main container
- `.docx-preview-page` - Individual page wrapper
- `.docx-page-number` - Page number badge
- `.docx-preview-content` - Content wrapper
- Loading & error states
- Print media queries
- Responsive adjustments
- Zoom transformations
- Fullscreen mode styles

**Total Size:** ~2.7 KB (uncompressed)

## Next.js Configuration

### App Router (Next.js 13+)

✅ No additional config needed - CSS import works out of the box

### Pages Router (Next.js 12)

```typescript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    });
    return config;
  },
};
```

## Testing CSS Import

```bash
# 1. Build library
npm run build

# 2. Check CSS exists
cat dist/index.css | head -20

# 3. Run examples
cd examples
npm run dev

# 4. Open browser
# http://localhost:3000/example-upload
# Upload DOCX file
# Check if multi-page layout works
```

## Support

Jika masih ada masalah dengan CSS:

1. Pastikan library version terbaru
2. Clear node_modules dan reinstall
3. Rebuild library dari source
4. Check browser console untuk CSS errors

---

**Last Updated:** 2025-01-21  
**Version:** 2.0.0

