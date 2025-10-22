# Composition Pattern - Modular Design

## 🎯 Konsep

Library ini menggunakan **Composition Pattern** untuk memisahkan:
1. **FileUpload** - Generic upload component (reusable untuk semua format)
2. **PDFPreview** - PDF viewer component
3. **User** - Compose keduanya sesuai kebutuhan

## 💡 Kenapa Composition Pattern?

### Keuntungan:
- ✅ **Reusable** - `FileUpload` bisa dipakai untuk PDF, DOCX, Excel, dll
- ✅ **Flexible** - User control layout & styling sendiri
- ✅ **Modular** - Easy to extend & customize
- ✅ **Maintainable** - Separation of concerns
- ✅ **Scalable** - Siap untuk format lain

### VS Monolithic Component:
```tsx
// ❌ Monolithic (Deprecated)
<PDFUploadPreview />  // Terikat ke PDF saja

// ✅ Composition (Recommended)
<FileUpload onFileSelect={setFile} accept=".pdf" />
<PDFPreview file={selectedFile} />
```

---

## 📦 Components

### 1. FileUpload (Generic)

Component untuk upload file dengan drag & drop support.

**Props:**
```typescript
interface FileUploadProps {
  onFileSelect?: (file: File | null) => void;  // Callback saat file dipilih
  accept?: string;              // File types (default: '*')
  maxSizeMB?: number;           // Max size (default: 10MB)
  multiple?: boolean;           // Multiple files (default: false)
  className?: string;           // Custom styling
  showFileList?: boolean;       // Show file list (default: true)
}
```

**Features:**
- ✅ Drag & drop
- ✅ File validation (size, type)
- ✅ File list management
- ✅ Remove files
- ✅ Error handling

### 2. PDFPreview

Component untuk preview PDF.

**Props:**
```typescript
interface PDFPreviewProps {
  file: File | string;          // PDF source
  className?: string;           // Custom styling
  onPageChange?: (page, total) => void;  // Page change callback
  onError?: (error) => void;    // Error callback
}
```

**Features:**
- ✅ Page navigation
- ✅ Zoom controls
- ✅ Fullscreen
- ✅ Download
- ✅ Auto proxy untuk external URLs

---

## 🚀 Usage Examples

### Basic Composition (PDF)

```tsx
import { FileUpload, PDFPreview } from '@haikal/react-pdf-viewer';
import { useState } from 'react';

export default function PDFViewerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="flex">
      {/* Upload Section */}
      <div className="w-96">
        <FileUpload
          onFileSelect={setSelectedFile}
          accept=".pdf"
          maxSizeMB={10}
        />
      </div>

      {/* Preview Section */}
      <div className="flex-1">
        {selectedFile && <PDFPreview file={selectedFile} />}
      </div>
    </div>
  );
}
```

### Advanced: Multiple Formats

```tsx
import { FileUpload, PDFPreview } from '@haikal/react-pdf-viewer';
import { useEffect, useState } from 'react';

async function convertDocxToPdf(file: File) {
  const form = new FormData();
  form.append('file', file);
  const resp = await fetch(`${process.env.NEXT_PUBLIC_CONVERTER_URL}/convert`, {
    method: 'POST',
    body: form,
  });
  if (!resp.ok) throw new Error('Convert failed');
  const blob = await resp.blob();
  return URL.createObjectURL(blob);
}

function DocxPreviewViaPdf({ file }: { file: File }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    convertDocxToPdf(file)
      .then((url) => {
        if (!active) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setPdfUrl(url);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Convert failed');
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file]);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!pdfUrl) return <div>Converting DOCX…</div>;
  return <PDFPreview file={pdfUrl} />;
}

export default function MultiFormatViewer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getFileExtension = (file: File) =>
    file.name.split('.').pop()?.toLowerCase();

  const renderPreview = () => {
    if (!selectedFile) return <EmptyState />;

    const ext = getFileExtension(selectedFile);

    switch (ext) {
      case 'pdf':
        return <PDFPreview file={selectedFile} />;
      case 'docx':
        return <DocxPreviewViaPdf file={selectedFile} />;
      default:
        return <div>Format tidak didukung</div>;
    }
  };

  return (
    <div className="flex h-screen">
      <FileUpload
        onFileSelect={setSelectedFile}
        accept=".pdf,.docx"
        maxSizeMB={25}
      />
      <div className="flex-1">{renderPreview()}</div>
    </div>
  );
}
```

### Custom Layout: Tabs

```tsx
import { FileUpload, PDFPreview } from '@haikal/react-pdf-viewer';
import { useState } from 'react';

export default function TabbedViewer() {
  const [files, setFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const handleFileSelect = (file: File | null) => {
    if (file && !files.includes(file)) {
      setFiles([...files, file]);
      setActiveTab(files.length);
    }
  };

  return (
    <div>
      <FileUpload
        onFileSelect={handleFileSelect}
        accept=".pdf"
        multiple={true}
      />

      {/* Tabs */}
      <div className="flex border-b">
        {files.map((file, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={activeTab === index ? 'active' : ''}
          >
            {file.name}
          </button>
        ))}
      </div>

      {/* Preview */}
      {files[activeTab] && <PDFPreview file={files[activeTab]} />}
    </div>
  );
}
```

### With URL Support

```tsx
import { PDFPreview } from '@haikal/react-pdf-viewer';
import { useState } from 'react';

export default function URLViewer() {
  const [url, setUrl] = useState('');

  return (
    <div>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter PDF URL..."
      />
      
      {url && <PDFPreview file={url} />}
    </div>
  );
}
```

---

## 🎨 Layout Examples

### Side by Side
```tsx
<div className="flex">
  <FileUpload className="w-96" />
  <PDFPreview className="flex-1" />
</div>
```

### Vertical Stack
```tsx
<div className="flex flex-col">
  <FileUpload className="h-48" />
  <PDFPreview className="flex-1" />
</div>
```

### Modal Upload
```tsx
<Modal>
  <FileUpload onFileSelect={(file) => {
    setFile(file);
    closeModal();
  }} />
</Modal>
<PDFPreview file={selectedFile} />
```

### Full Page
```tsx
<div className="h-screen flex">
  <FileUpload className="w-1/3" />
  <PDFPreview className="w-2/3" />
</div>
```

---

## 🔄 Migration dari Monolithic

### Before (Deprecated):
```tsx
import { PDFUploadPreview } from '@haikal/react-pdf-viewer';

export default function Page() {
  return <PDFUploadPreview />;
}
```

### After (Recommended):
```tsx
import { FileUpload, PDFPreview } from '@haikal/react-pdf-viewer';
import { useState } from 'react';

export default function Page() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="flex">
      <FileUpload onFileSelect={setFile} accept=".pdf" />
      {file && <PDFPreview file={file} />}
    </div>
  );
}
```

---

## 🎓 Best Practices

### 1. State Management
```tsx
// ✅ Good: Single source of truth
const [selectedFile, setSelectedFile] = useState<File | null>(null);

// ❌ Bad: Duplicate state
const [uploadedFile, setUploadedFile] = useState<File | null>(null);
const [previewFile, setPreviewFile] = useState<File | null>(null);
```

### 2. Error Handling
```tsx
const [error, setError] = useState<string | null>(null);

<FileUpload onFileSelect={setSelectedFile} />
<PDFPreview 
  file={selectedFile}
  onError={(err) => setError(err.message)}
/>
{error && <ErrorDisplay message={error} />}
```

### 3. Loading States
```tsx
const [isLoading, setIsLoading] = useState(false);

<FileUpload onFileSelect={(file) => {
  setIsLoading(true);
  setSelectedFile(file);
}} />
<PDFPreview 
  file={selectedFile}
  onPageChange={() => setIsLoading(false)}
/>
```

### 4. Responsive Design
```tsx
<div className="flex flex-col md:flex-row">
  <FileUpload className="w-full md:w-96" />
  <PDFPreview className="flex-1" />
</div>
```

---

## 🚀 Future: Multi-Format Support

Dengan composition pattern, sangat mudah untuk support format lain:

```tsx
// PDF Preview Library (v1.0.0) ✅
import { FileUpload, PDFPreview } from '@haikal/react-pdf-viewer';

// DOCX Preview Library (v2.0.0) - Coming soon
import { DOCXPreview } from '@haikal/react-docx-viewer';

// Excel Preview Library (v3.0.0) - Coming soon
import { ExcelPreview } from '@haikal/react-excel-viewer';

// Unified Usage:
<FileUpload onFileSelect={setFile} accept=".pdf,.docx,.xlsx" />
{renderPreview(file)}  // Auto-detect format
```

**Modular & Scalable!** 🎉

---

## 📊 Comparison

| Feature | Monolithic | Composition |
|---------|-----------|-------------|
| Reusability | ❌ PDF only | ✅ All formats |
| Flexibility | ❌ Fixed layout | ✅ Custom layout |
| Bundle Size | Larger | Smaller (tree-shaking) |
| Extensibility | ❌ Hard | ✅ Easy |
| Maintenance | ❌ Complex | ✅ Simple |
| Learning Curve | Easy | Easy |

---

## 💡 Tips

1. **Use TypeScript** - Better type safety
2. **Memoize Callbacks** - Better performance
3. **Error Boundaries** - Graceful error handling
4. **Loading States** - Better UX
5. **Responsive Design** - Mobile-first

---

**Composition Pattern = Better Architecture!** 🏗️✨

_Made with ❤️ by Haikal - BINUS University_
