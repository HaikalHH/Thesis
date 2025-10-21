# Quick Start Guide

Get up and running with `@haikal/react-pdf-viewer` in **3 SIMPLE steps!** ⚡

---

## 📦 Step 1: Install

```bash
npm install @haikal/react-pdf-viewer
```

That's it! No additional dependencies needed.

---

## 📄 Step 2: Copy Worker File

```bash
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
```

Or on Windows (PowerShell):
```powershell
Copy-Item node_modules/pdfjs-dist/build/pdf.worker.min.mjs -Destination public/
```

---

## 💻 Step 3: Use It!

### Simple Preview

Create `app/pdf/page.tsx`:

```tsx
import { PDFPreview } from '@haikal/react-pdf-viewer';

export default function PDFPage() {
  return (
    <div className="h-screen">
      <PDFPreview file="/sample.pdf" />
    </div>
  );
}
```

### With Upload UI

Create `app/upload/page.tsx`:

```tsx
import { PDFUploadPreview } from '@haikal/react-pdf-viewer';

export default function UploadPage() {
  return <PDFUploadPreview />;
}
```

### External URLs (Optional)

For external PDFs, create API proxy:

**File:** `app/api/pdf-proxy/route.ts`
```tsx
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'Missing URL' }, { status: 400 });

  const response = await fetch(url);
  const blob = await response.blob();
  
  return new NextResponse(blob, {
    headers: { 'Content-Type': 'application/pdf' },
  });
}
```

Now you can use external URLs:

```tsx
<PDFPreview file="https://example.com/file.pdf" />
```

---

## 🚀 Run

```bash
npm run dev
```

Visit:
- Simple: http://localhost:3000/pdf
- Upload: http://localhost:3000/upload

---

## ✅ Done!

**That's ALL!** 🎉

### What You Get:
- ✨ No `dynamic import` needed
- ✨ No `ssr: false` needed  
- ✨ No complex setup
- ✨ Auto proxy for external URLs
- ✨ Auto SSR-safe

### Key Features:
```tsx
// Local PDF
<PDFPreview file="/sample.pdf" />

// External URL - auto proxy! ✨
<PDFPreview file="https://example.com/file.pdf" />

// File upload
<PDFPreview file={uploadedFile} />

// With callbacks
<PDFPreview 
  file="/sample.pdf"
  onPageChange={(page, total) => console.log(`Page ${page}/${total}`)}
  onError={(error) => console.error(error)}
/>
```

---

## 📚 Next Steps

- Read the [Full Documentation](./README.md)
- Check out [More Examples](./docs/EXAMPLES.md)
- See [API Reference](./docs/API.md)
- Read [FAQ](./docs/FAQ.md)

---

**Made with ❤️ by Haikal**
