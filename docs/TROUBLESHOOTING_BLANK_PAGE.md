# Troubleshooting: Blank White Page

## Masalah

Halaman example-upload atau halaman lain yang menggunakan `DocxPreview` menampilkan halaman blank putih saat dibuka.

## Penyebab

Ada beberapa kemungkinan penyebab:

### 1. **Import CSS di dalam Component** ❌

**Masalah:**
```tsx
// lib/components/DocxPreview.tsx
import '../styles/docx-preview.css'; // ❌ ERROR saat bundled
```

**Kenapa Error:**
- Ketika library di-bundle dengan tsup, relative import CSS akan cause runtime error
- Browser tidak bisa resolve path `../styles/docx-preview.css` dari bundled file
- Mengakibatkan JavaScript error dan blank page

**Solusi:** ✅
Hapus import CSS dari component. CSS harus di-import oleh user di app mereka:

```tsx
// lib/components/DocxPreview.tsx
"use client";
import React from 'react';
import { renderAsync } from 'docx-preview';
// ❌ JANGAN import CSS di sini
```

### 2. **CSS Tidak Di-Import di App** ⚠️

**Masalah:**
User lupa import CSS styling yang diperlukan.

**Solusi:** ✅
Import CSS di layout atau component:

```tsx
// app/layout.tsx
import './docx-preview.css'; // untuk development
// atau
import '@haikal/react-pdf-viewer/dist/styles/docx-preview.css'; // untuk production
```

### 3. **JavaScript Runtime Error**

**Masalah:**
Error di library dependency (JSZip, xml2js, docx-preview)

**Cara Check:**
1. Buka browser DevTools (F12)
2. Check Console tab untuk error messages
3. Check Network tab untuk failed resources

**Common Errors:**

```
Error: Cannot find module 'jszip'
```
**Solusi:** Pastikan dependencies ter-bundle dengan benar di tsup.config.ts:

```typescript
noExternal: ['jszip', 'xml2js', 'docx-preview']
```

```
ReferenceError: window is not defined
```
**Solusi:** Pastikan component menggunakan `"use client"` directive:

```tsx
"use client"; // ✅ WAJIB di top of file
```

## Diagnostic Steps

### Step 1: Check Browser Console

```
1. Buka halaman yang blank
2. Tekan F12 untuk buka DevTools
3. Go to Console tab
4. Lihat error messages (merah)
```

**Common Error Messages:**

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `Cannot find module '../styles/...'` | CSS import di component | Hapus CSS import dari component |
| `Failed to load resource: 404` | CSS file tidak ada | Run `npm run sync-css` |
| `window is not defined` | SSR issue | Add `"use client"` |
| `JSZip is not defined` | Dependency tidak ter-bundle | Update tsup config |

### Step 2: Verify Build

```bash
# 1. Rebuild library
npm run build

# 2. Check output
ls dist/
# Should see: index.mjs, index.js, styles/docx-preview.css

# 3. Sync CSS (for examples)
cd examples
npm run sync-css
```

### Step 3: Check File Structure

```
dist/
├── index.mjs          ✅ ESM bundle
├── index.js           ✅ CJS bundle
└── styles/
    └── docx-preview.css  ✅ CSS file

examples/app/
├── layout.tsx         ✅ Import CSS here
└── docx-preview.css   ✅ Synced CSS (auto-generated)
```

### Step 4: Verify Imports

**Component Import:**
```tsx
// ✅ BENAR
import { DocxPreview } from '../../../dist/index.mjs';
import { DocxPreview } from '@haikal/react-pdf-viewer';
```

**CSS Import:**
```tsx
// ✅ BENAR (examples)
import './docx-preview.css';

// ✅ BENAR (published package)
import '@haikal/react-pdf-viewer/dist/styles/docx-preview.css';
```

## Quick Fix Checklist

- [ ] Remove CSS import dari `lib/components/DocxPreview.tsx`
- [ ] Run `npm run build` di root folder
- [ ] Run `cd examples && npm run sync-css`
- [ ] Verify `examples/app/docx-preview.css` exists
- [ ] Check `examples/app/layout.tsx` imports CSS
- [ ] Restart dev server: `npm run dev`
- [ ] Clear browser cache (Ctrl+Shift+R)
- [ ] Check browser console for errors

## Prevention

### For Library Development

**tsup.config.ts:**
```typescript
export default defineConfig({
  entry: [
    'lib/index.ts',
    'lib/styles/docx-preview.css' // CSS sebagai separate entry
  ],
  noExternal: ['jszip', 'xml2js', 'docx-preview'], // Bundle deps
  // ❌ JANGAN import CSS di component
});
```

**Component:**
```tsx
"use client";
// ❌ import '../styles/docx-preview.css'; // JANGAN!
import { renderAsync } from 'docx-preview';
```

### For Library Users

**Always:**
1. Import CSS di layout atau component
2. Check browser console untuk errors
3. Verify file structure
4. Clear cache saat update library

## Testing After Fix

```bash
# 1. Start dev server
npm run dev

# 2. Open browser
http://localhost:3000/example-upload

# 3. Expected: Page loads with upload UI
# 4. Upload DOCX file
# 5. Expected: Multi-page preview dengan styling
```

## Related Issues

- [CSS Setup Guide](./CSS_SETUP.md)
- [DOCX Refactor Documentation](./DOCX_REFACTOR.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

---

**Last Updated:** 2025-01-21  
**Status:** ✅ Fixed

