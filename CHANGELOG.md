# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### ✨ Added

- `converter-service/` Express + TypeScript backend for DOCX → PDF conversion via LibreOffice headless
  - Includes Dockerfile (LibreOffice + fonts) and `.dockerignore`
  - Added `docker-compose.yml` for quick local spin-up

### 🔄 Changed

- Migrated repository tooling to pnpm (workspace + scripts)
- Replaced direct DOCX rendering with backend conversion flow
  - Removed `DocxPreview` component and DOCX utilities from the library bundle
  - Updated Next.js examples to upload/convert DOCX before previewing with `PDFPreview`

### 🧹 Removed

- Legacy DOCX documentation (CSS setup, troubleshooting, refactor notes) tied to the deprecated renderer
- Unused dependencies (`docx-preview`, `html2canvas`, `jspdf`, `jszip`) from the package

## [2.0.0] - 2025-01-21

### 🚀 Major Refactor: DocxPreview Component

#### ✨ Added

- **HTML-based DOCX rendering** instead of canvas snapshots
  - Text is now selectable and searchable
  - Better performance and smaller file size
  - Native browser rendering

- **Auto-detect page size** from DOCX metadata
  - Support A3, A4, A5, Letter, Legal, and custom sizes
  - Automatic portrait/landscape detection
  - Parse `word/document.xml` for page dimensions

- **Multi-page CSS layout**
  - Individual page separation with shadows
  - Page number badges
  - 10mm spacing between pages
  - Hover effects
  - Print-ready styling

- **New utility functions**
  - `getDocxPageSize(file)` - Parse page size from DOCX
  - `formatPageSize(pageSize)` - Format page size for display

- **Page size info display**
  - Show detected page size in toolbar (e.g., "A4 Portrait")
  - Total page count display

#### 🔧 Changed

- **Removed html2canvas dependency** for DOCX preview
  - Before: Canvas snapshot (~5-10MB for 10 pages)
  - After: HTML rendering (~1-2MB for same document)

- **Replaced xml2js with DOMParser**
  - Before: Using xml2js (Node.js dependency, ~200KB, causes browser errors)
  - After: Native browser DOMParser (0KB, no dependencies)
  - **Fix**: Resolves "Dynamic require of 'events' is not supported" error

- **CSS architecture**
  - Extracted CSS to separate file: `lib/styles/docx-preview.css`
  - CSS no longer imported in component (avoids bundling issues)
  - Users must import CSS separately in their app

- **Rendering performance**
  - Before: 2-3 seconds render time
  - After: 500-800ms render time

#### 🐛 Fixed

- **Blank white page issue** when opening example-upload
  - Cause: CSS import inside component causing bundling errors
  - Fix: Removed CSS import from component, users import separately

- **Hydration error** in Next.js
  - Cause: xml2js using Node.js modules (events, stream, etc.)
  - Fix: Replaced with native browser DOMParser

- **Dynamic require errors**
  - Error: "Dynamic require of 'events' is not supported"
  - Fix: Removed xml2js, using DOMParser instead

#### 📦 Dependencies

**Added:**
- ~~xml2js@^0.6.2~~ (removed in same version)
- ~~@types/xml2js@^0.4.14~~ (removed in same version)

**Removed:**
- xml2js (replaced with native DOMParser)
- @types/xml2js (no longer needed)

**Kept:**
- jszip@^3.10.1 (browser-compatible, used for ZIP parsing)
- docx-preview@^0.3.7 (core rendering engine)

#### 📝 Documentation

**Added:**
- `docs/DOCX_REFACTOR.md` - Complete refactor documentation
- `docs/CSS_SETUP.md` - CSS setup guide for users
- `docs/TROUBLESHOOTING_BLANK_PAGE.md` - Blank page troubleshooting

**Updated:**
- README.md - Updated usage examples with CSS import
- Installation instructions

#### 🔄 Breaking Changes

**CSS Import Required:**

Before (v1.x):
```tsx
import { DocxPreview } from '@haikal/react-pdf-viewer';
<DocxPreview file={file} />
```

After (v2.x):
```tsx
import { DocxPreview } from '@haikal/react-pdf-viewer';
import '@haikal/react-pdf-viewer/dist/styles/docx-preview.css'; // ⚠️ REQUIRED

<DocxPreview file={file} />
```

**Component API (No Breaking Changes):**
- Props remain the same
- All callbacks work as before
- Full backward compatibility for component usage

#### 🎯 Migration Guide

1. **Add CSS import** to your app:
   ```tsx
   // app/layout.tsx
   import '@haikal/react-pdf-viewer/dist/styles/docx-preview.css';
   ```

2. **No code changes needed** for component usage

3. **Rebuild your app**:
   ```bash
   npm install @haikal/react-pdf-viewer@latest
   npm run build
   ```

#### 📊 Performance Comparison

| Metric | Before (v1.x) | After (v2.x) | Improvement |
|--------|---------------|--------------|-------------|
| Rendering Time | 2-3s | 500-800ms | **60-70% faster** |
| File Size (10 pages) | 5-10MB | 1-2MB | **80% smaller** |
| Text Selectable | ❌ | ✅ | New feature |
| Page Size Detection | Hardcoded A4 | Auto-detect | New feature |
| Browser Bundle | 1.31 MB | 1.10 MB | 16% smaller |

---

## [1.0.0] - 2025-01-20

### Initial Release

- PDF preview with PDF.js
- DOCX preview with canvas snapshots
- File upload component
- Zoom controls
- Download functionality
- Error handling
- Loading states

---

## Version Format

Version format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (v1 → v2)
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes

---

**Legend:**
- ✨ Added - New features
- 🔧 Changed - Changes in existing functionality
- 🐛 Fixed - Bug fixes
- 📦 Dependencies - Dependency changes
- 📝 Documentation - Documentation changes
- 🔄 Breaking Changes - Breaking changes requiring migration
- 🎯 Migration Guide - How to migrate from previous version
