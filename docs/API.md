# API Reference

## Components

### PDFPreview

Main component for displaying PDF files with built-in controls.

#### Import

```tsx
import { PDFPreview } from '@haikal/react-pdf-viewer';
// or with dynamic import
import dynamic from 'next/dynamic';
const PDFPreview = dynamic(
  () => import('@haikal/react-pdf-viewer').then(mod => mod.PDFPreview),
  { ssr: false }
);
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `file` | `File \| string` | Yes | - | PDF source: File object, URL, or base64 string |
| `className` | `string` | No | `''` | Additional CSS classes for the container |
| `onPageChange` | `(page: number, total: number) => void` | No | - | Callback when page changes |
| `onError` | `(error: Error) => void` | No | - | Callback when an error occurs |

#### Usage Examples

**With File Object:**
```tsx
const [file, setFile] = useState<File | null>(null);

<PDFPreview 
  file={file}
  onPageChange={(page, total) => {
    console.log(`Viewing page ${page} of ${total}`);
  }}
/>
```

**With URL:**
```tsx
<PDFPreview 
  file="/documents/report.pdf"
  className="h-screen"
/>
```

**With Base64:**
```tsx
<PDFPreview 
  file="data:application/pdf;base64,JVBERi0xLjQK..."
  onError={(error) => {
    console.error('Failed to load PDF:', error);
  }}
/>
```

#### Features

The PDFPreview component includes:

- ✅ **Page Navigation** - Previous/Next buttons with page counter
- ✅ **Zoom Controls** - Zoom in, zoom out, and reset (50%-300%)
- ✅ **Fullscreen** - Toggle fullscreen mode
- ✅ **Download** - Download the PDF file
- ✅ **Loading State** - Animated loading spinner
- ✅ **Error Handling** - User-friendly error messages

#### Methods

The component doesn't expose methods directly. Use callbacks for state management:

```tsx
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(0);

<PDFPreview 
  file="/sample.pdf"
  onPageChange={(page, total) => {
    setCurrentPage(page);
    setTotalPages(total);
  }}
/>

// Display outside component
<p>Page {currentPage} of {totalPages}</p>
```

---

### PDFUploadPreview

Complete UI component with upload area, file list, and preview.

#### Import

```tsx
import { PDFUploadPreview } from '@haikal/react-pdf-viewer';
// or with dynamic import
import dynamic from 'next/dynamic';
const PDFUploadPreview = dynamic(
  () => import('@haikal/react-pdf-viewer').then(mod => mod.PDFUploadPreview),
  { ssr: false }
);
```

#### Props

This component doesn't accept props - it's a self-contained UI.

#### Usage

```tsx
export default function Page() {
  return <PDFUploadPreview />;
}
```

#### Features

- ✅ **Drag & Drop Upload** - Drag files or click to upload
- ✅ **Multi-file Support** - Upload multiple files at once
- ✅ **File List** - View all uploaded files with icons and sizes
- ✅ **Tab Navigation** - Preview, Detail, and Integration tabs
- ✅ **Auto-select** - Automatically selects first PDF
- ✅ **Full Preview** - All PDFPreview features included

#### UI Layout

```
┌─────────────┬──────────────────────────┐
│   Upload    │      Tab Navigation      │
│   Area      │  ┌───────────────────┐   │
│             │  │ Preview │Detail│...│   │
│   File      │  └───────────────────┘   │
│   List      │                          │
│             │    PDF Content Area      │
│             │                          │
└─────────────┴──────────────────────────┘
```

---

## Types

### PDFPreviewProps

```typescript
interface PDFPreviewProps {
  file: File | string;
  className?: string;
  onPageChange?: (page: number, total: number) => void;
  onError?: (error: Error) => void;
}
```

### File Input Types

```typescript
// File object from input
type FileInput = File;

// URL string (local or external)
type URLInput = string; // e.g., "/sample.pdf"

// Base64 string
type Base64Input = string; // e.g., "data:application/pdf;base64,..."

// Union type
type PDFFileInput = File | string;
```

---

## Callbacks

### onPageChange

Called whenever the user navigates to a different page.

```typescript
(page: number, total: number) => void
```

**Parameters:**
- `page` - Current page number (1-indexed)
- `total` - Total number of pages in the PDF

**Example:**
```tsx
<PDFPreview 
  file="/sample.pdf"
  onPageChange={(page, total) => {
    // Update URL with page number
    window.history.replaceState(null, '', `?page=${page}`);
    
    // Track analytics
    analytics.track('pdf_page_view', { page, total });
    
    // Update UI
    setPageInfo({ current: page, total });
  }}
/>
```

### onError

Called when an error occurs during PDF loading or rendering.

```typescript
(error: Error) => void
```

**Parameters:**
- `error` - Error object with message and details

**Example:**
```tsx
<PDFPreview 
  file="/sample.pdf"
  onError={(error) => {
    // Log to error tracking service
    console.error('PDF Error:', error);
    
    // Show toast notification
    toast.error(`Failed to load PDF: ${error.message}`);
    
    // Update error state
    setError(error.message);
  }}
/>
```

---

## Styling

### Custom Styling

Add custom classes via the `className` prop:

```tsx
<PDFPreview 
  file="/sample.pdf"
  className="h-screen bg-gray-100 rounded-lg shadow-xl"
/>
```

### Tailwind Classes

The component is built with Tailwind CSS. Common customizations:

```tsx
// Full height
<PDFPreview file="/sample.pdf" className="h-screen" />

// Fixed height
<PDFPreview file="/sample.pdf" className="h-[600px]" />

// Custom background
<PDFPreview file="/sample.pdf" className="bg-gradient-to-b from-gray-50 to-gray-100" />

// With border and shadow
<PDFPreview file="/sample.pdf" className="border-2 border-gray-300 shadow-2xl rounded-xl" />
```

### CSS Override

For more control, use CSS modules or styled-components:

```tsx
// With CSS Module
import styles from './viewer.module.css';

<PDFPreview file="/sample.pdf" className={styles.customViewer} />
```

```css
/* viewer.module.css */
.customViewer {
  height: 100vh;
  background: linear-gradient(to bottom, #f3f4f6, #e5e7eb);
}

.customViewer canvas {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

---

## Error Handling

### Error States

The component handles these error scenarios:

1. **Invalid File** - File is not a valid PDF
2. **Network Error** - Failed to fetch PDF from URL
3. **Corrupt PDF** - PDF is damaged or incomplete
4. **Decode Error** - Failed to decode base64 string
5. **Rendering Error** - Failed to render specific page

### Error Display

Errors are shown with a user-friendly message:

```
┌─────────────────────────────────┐
│          ⚠️ Icon               │
│   Gagal memuat PDF              │
│   [Error message details]       │
└─────────────────────────────────┘
```

### Custom Error Handling

```tsx
const [error, setError] = useState<string | null>(null);

<PDFPreview 
  file="/sample.pdf"
  onError={(err) => {
    setError(err.message);
    // Your custom error handling
  }}
/>

{error && (
  <div className="error-banner">
    Error: {error}
  </div>
)}
```

---

## Performance

### Optimization Tips

1. **Use Dynamic Import** - Reduces initial bundle size
   ```tsx
   const PDFPreview = dynamic(
     () => import('@haikal/react-pdf-viewer').then(mod => mod.PDFPreview),
     { ssr: false }
   );
   ```

2. **Lazy Load** - Only load when needed
   ```tsx
   {showPDF && <PDFPreview file="/sample.pdf" />}
   ```

3. **Memoize Callbacks**
   ```tsx
   const handlePageChange = useCallback((page, total) => {
     console.log(`Page ${page}/${total}`);
   }, []);
   
   <PDFPreview file="/sample.pdf" onPageChange={handlePageChange} />
   ```

4. **Optimize PDF Files** - Compress PDFs before serving

### Bundle Size

- Core library: ~50KB (gzipped)
- PDF.js dependency: ~500KB (loaded from CDN)
- Total impact: Minimal with code splitting

---

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Fully Supported |
| Firefox | Latest | ✅ Fully Supported |
| Safari | Latest | ✅ Fully Supported |
| Edge | Latest | ✅ Fully Supported |
| Mobile Chrome | Latest | ✅ Fully Supported |
| Mobile Safari | Latest | ✅ Fully Supported |

---

## Advanced Usage

### With State Management

```tsx
import { create } from 'zustand';

const usePDFStore = create((set) => ({
  currentPage: 1,
  totalPages: 0,
  zoom: 1.0,
  setPage: (page) => set({ currentPage: page }),
  setTotal: (total) => set({ totalPages: total }),
}));

function PDFViewerWithStore() {
  const { currentPage, totalPages, setPage, setTotal } = usePDFStore();
  
  return (
    <PDFPreview 
      file="/sample.pdf"
      onPageChange={(page, total) => {
        setPage(page);
        setTotal(total);
      }}
    />
  );
}
```

### With URL Synchronization

```tsx
'use client';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PDFPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPage = Number(searchParams.get('page')) || 1;

  return (
    <PDFPreview 
      file="/sample.pdf"
      onPageChange={(page) => {
        router.replace(`?page=${page}`, { scroll: false });
      }}
    />
  );
}
```

---

## Related

- [Installation Guide](./INSTALLATION.md)
- [Examples](./EXAMPLES.md)
- [FAQ](./FAQ.md)
- [GitHub Repository](https://github.com/haikal/react-pdf-viewer)

