# Examples

Comprehensive examples for using `@haikal/react-pdf-viewer` in your Next.js projects.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [File Upload](#file-upload)
3. [With State Management](#with-state-management)
4. [Custom Controls](#custom-controls)
5. [Multiple PDFs](#multiple-pdfs)
6. [URL Parameters](#url-parameters)
7. [Protected PDFs](#protected-pdfs)
8. [Mobile Responsive](#mobile-responsive)

---

## Basic Usage

### Simple Preview from URL

```tsx
"use client";
import dynamic from 'next/dynamic';

const PDFPreview = dynamic(
  () => import('@haikal/react-pdf-viewer').then(mod => mod.PDFPreview),
  { ssr: false }
);

export default function SimplePDFPage() {
  return (
    <div className="h-screen">
      <PDFPreview file="/documents/report.pdf" />
    </div>
  );
}
```

### With Layout

```tsx
"use client";
import dynamic from 'next/dynamic';

const PDFPreview = dynamic(
  () => import('@haikal/react-pdf-viewer').then(mod => mod.PDFPreview),
  { ssr: false }
);

export default function PDFViewerPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold">Document Viewer</h1>
      </header>
      
      {/* PDF Viewer */}
      <main className="flex-1">
        <PDFPreview file="/sample.pdf" />
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t px-6 py-3 text-center text-sm text-gray-600">
        © 2024 Your Company
      </footer>
    </div>
  );
}
```

---

## File Upload

### Single File Upload

```tsx
"use client";
import { useState } from 'react';
import { PDFPreview } from '@haikal/react-pdf-viewer';

export default function UploadPDFPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please select a PDF file');
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Upload Section */}
      {!file && (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <label className="cursor-pointer">
              <div className="w-32 h-32 border-4 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors">
                <span className="text-4xl">📄</span>
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="mt-4 text-gray-600">Click to upload PDF</p>
            </label>
          </div>
        </div>
      )}
      
      {/* Preview Section */}
      {file && (
        <>
          <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
            <span className="font-medium">{file.name}</span>
            <button
              onClick={() => setFile(null)}
              className="text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
          <div className="flex-1">
            <PDFPreview file={file} />
          </div>
        </>
      )}
    </div>
  );
}
```

### Drag & Drop Upload

```tsx
"use client";
import { useState, useCallback } from 'react';
import { PDFPreview } from '@haikal/react-pdf-viewer';

export default function DragDropPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="h-screen">
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`h-full flex items-center justify-center ${
            isDragging ? 'bg-blue-50 border-4 border-blue-500' : 'bg-gray-50'
          }`}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">📁</div>
            <p className="text-xl font-medium mb-2">Drop PDF here</p>
            <p className="text-gray-600">or</p>
            <label className="mt-4 inline-block">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <span className="px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                Browse Files
              </span>
            </label>
          </div>
        </div>
      ) : (
        <PDFPreview file={file} />
      )}
    </div>
  );
}
```

---

## With State Management

### Using React Context

```tsx
"use client";
import { createContext, useContext, useState, ReactNode } from 'react';
import { PDFPreview } from '@haikal/react-pdf-viewer';

type PDFContextType = {
  currentPage: number;
  totalPages: number;
  setPageInfo: (page: number, total: number) => void;
};

const PDFContext = createContext<PDFContextType | null>(null);

export function PDFProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const setPageInfo = (page: number, total: number) => {
    setCurrentPage(page);
    setTotalPages(total);
  };

  return (
    <PDFContext.Provider value={{ currentPage, totalPages, setPageInfo }}>
      {children}
    </PDFContext.Provider>
  );
}

export function usePDF() {
  const context = useContext(PDFContext);
  if (!context) throw new Error('usePDF must be used within PDFProvider');
  return context;
}

function PDFViewerWithContext() {
  const { currentPage, totalPages, setPageInfo } = usePDF();

  return (
    <div>
      <div className="bg-white p-4 text-center">
        Page {currentPage} of {totalPages}
      </div>
      <PDFPreview 
        file="/sample.pdf"
        onPageChange={setPageInfo}
      />
    </div>
  );
}

export default function Page() {
  return (
    <PDFProvider>
      <PDFViewerWithContext />
    </PDFProvider>
  );
}
```

---

## Custom Controls

### External Controls

```tsx
"use client";
import { useState, useRef } from 'react';
import { PDFPreview } from '@haikal/react-pdf-viewer';

export default function CustomControlsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [inputPage, setInputPage] = useState('1');

  const goToPage = () => {
    const page = parseInt(inputPage);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Note: You'd need to implement this in PDFPreview or use a ref
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Custom Toolbar */}
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center gap-4">
        <h1 className="text-xl font-bold mr-auto">PDF Viewer</h1>
        
        <div className="flex items-center gap-2">
          <span className="text-sm">Page:</span>
          <input
            type="number"
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            className="w-16 px-2 py-1 rounded text-gray-900"
            min={1}
            max={totalPages}
          />
          <span className="text-sm">of {totalPages}</span>
          <button
            onClick={goToPage}
            className="px-4 py-1 bg-blue-600 rounded hover:bg-blue-700"
          >
            Go
          </button>
        </div>
      </div>
      
      {/* Viewer */}
      <div className="flex-1">
        <PDFPreview 
          file="/sample.pdf"
          onPageChange={(page, total) => {
            setCurrentPage(page);
            setTotalPages(total);
            setInputPage(page.toString());
          }}
        />
      </div>
    </div>
  );
}
```

---

## Multiple PDFs

### PDF Tabs

```tsx
"use client";
import { useState } from 'react';
import { PDFPreview } from '@haikal/react-pdf-viewer';

const documents = [
  { id: 1, name: 'Report 2024', url: '/docs/report-2024.pdf' },
  { id: 2, name: 'Financial Statement', url: '/docs/financial.pdf' },
  { id: 3, name: 'Presentation', url: '/docs/presentation.pdf' },
];

export default function MultiPDFPage() {
  const [activeDoc, setActiveDoc] = useState(documents[0]);

  return (
    <div className="h-screen flex flex-col">
      {/* Tab Navigation */}
      <div className="bg-white border-b flex gap-2 px-4">
        {documents.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setActiveDoc(doc)}
            className={`px-4 py-3 border-b-2 font-medium transition-colors ${
              activeDoc.id === doc.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {doc.name}
          </button>
        ))}
      </div>
      
      {/* Viewer */}
      <div className="flex-1">
        <PDFPreview key={activeDoc.id} file={activeDoc.url} />
      </div>
    </div>
  );
}
```

### Side-by-Side Comparison

```tsx
"use client";
import { PDFPreview } from '@haikal/react-pdf-viewer';

export default function ComparePDFPage() {
  return (
    <div className="h-screen flex">
      {/* Left PDF */}
      <div className="flex-1 border-r">
        <div className="bg-gray-100 px-4 py-2 border-b">
          <h2 className="font-semibold">Document A</h2>
        </div>
        <PDFPreview file="/docs/version-1.pdf" />
      </div>
      
      {/* Right PDF */}
      <div className="flex-1">
        <div className="bg-gray-100 px-4 py-2 border-b">
          <h2 className="font-semibold">Document B</h2>
        </div>
        <PDFPreview file="/docs/version-2.pdf" />
      </div>
    </div>
  );
}
```

---

## URL Parameters

### Page Number in URL

```tsx
"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { PDFPreview } from '@haikal/react-pdf-viewer';

export default function PDFWithURLPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageParam = searchParams.get('page');

  return (
    <PDFPreview 
      file="/sample.pdf"
      onPageChange={(page) => {
        // Update URL without reload
        router.replace(`?page=${page}`, { scroll: false });
      }}
    />
  );
}
```

### Document ID from Route

```tsx
// app/documents/[id]/page.tsx
"use client";
import { use } from 'react';
import { PDFPreview } from '@haikal/react-pdf-viewer';

const documents: Record<string, string> = {
  'report-2024': '/docs/report-2024.pdf',
  'financial': '/docs/financial.pdf',
};

export default function DocumentPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  const pdfUrl = documents[id];

  if (!pdfUrl) {
    return <div>Document not found</div>;
  }

  return (
    <div className="h-screen">
      <PDFPreview file={pdfUrl} />
    </div>
  );
}
```

---

## Protected PDFs

### With Authentication

```tsx
"use client";
import { useState, useEffect } from 'react';
import { PDFPreview } from '@haikal/react-pdf-viewer';

export default function ProtectedPDFPage() {
  const [pdfBlob, setPdfBlob] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch PDF with auth token
    fetch('/api/documents/secret.pdf', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setPdfBlob(url);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load PDF:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading secure document...</div>;
  }

  if (!pdfBlob) {
    return <div>Access denied</div>;
  }

  return <PDFPreview file={pdfBlob} />;
}

function getAuthToken() {
  // Your auth logic
  return localStorage.getItem('token') || '';
}
```

---

## Mobile Responsive

### Adaptive Layout

```tsx
"use client";
import { useState } from 'react';
import { PDFPreview } from '@haikal/react-pdf-viewer';

export default function ResponsivePDFPage() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold">Document</h1>
        <button onClick={() => setShowMobileMenu(!showMobileMenu)}>
          ☰
        </button>
      </div>
      
      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold">Document Viewer</h1>
      </div>
      
      {/* PDF Viewer */}
      <div className="flex-1">
        <PDFPreview 
          file="/sample.pdf"
          className="h-full"
        />
      </div>
    </div>
  );
}
```

---

## More Examples

Check out the full examples in the repository:

- [Simple Preview](../src/app/example-simple/page.tsx)
- [Upload UI](../src/app/example-upload/page.tsx)

---

Need more examples? Open an issue on [GitHub](https://github.com/haikal/react-pdf-viewer/issues)!

