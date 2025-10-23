# @haikal/react-pdf-viewer

Library React TypeScript untuk preview file PDF di framework Next.js menggunakan PDF.js sebagai rendering engine.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14%20%7C%2015-black)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🎯 Fitur Utama

- ✅ **Super Simple** - Tinggal import & use, auto handle semuanya!
- ✅ **Auto Proxy** - External URLs otomatis bypass CORS
- ✅ **SSR Safe** - Compatible dengan Next.js App Router
- ✅ **Self-Contained** - No external dependencies untuk users
- ✅ **Full Features** - Zoom, navigation, fullscreen, download
- ✅ **TypeScript** - Full type definitions
- ✅ **Beautiful UI** - Modern & responsive design
- ✅ **Office Support** - Konversi Word/Excel/PowerPoint → PDF via converter-service berbasis LibreOffice

## 📦 Instalasi

```bash
npm install @haikal/react-pdf-viewer
```

**That's it!** No additional dependencies needed.

## 🚀 Quick Start (3 Steps!)

### 1. Install

```bash
npm install @haikal/react-pdf-viewer
```

### 2. Copy Worker File

```bash
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
```

### 3. Use It!

```tsx
import { PDFPreview } from '@haikal/react-pdf-viewer';

export default function Page() {
  return (
    <div className="h-screen">
      {/* Local PDF */}
      <PDFPreview file="/sample.pdf" />
      
      {/* External URL - Auto proxy! ✨ */}
      <PDFPreview file="https://example.com/file.pdf" />
      
      {/* File upload */}
      <PDFPreview file={uploadedFile} />
    </div>
  );
}
```

## 📝 Office Conversion Flow

Dokumen Office (Word, Excel, PowerPoint) tidak lagi dirender langsung di browser. Gunakan service `converter-service` (Express + LibreOffice headless) untuk mengonversi file menjadi PDF, lalu tampilkan dengan `PDFPreview`.

### Menjalankan converter-service (lokal)

```bash
pnpm install
pnpm --filter converter-service dev
# POST http://localhost:3001/convert
```

Docker:

```bash
docker build -t converter-service ./converter-service
docker run -p 3001:3001 converter-service
```

Docker Compose:

```bash
docker compose up --build
```

### Contoh upload di frontend (Next.js)

```ts
async function convertDocumentToPdf(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${process.env.NEXT_PUBLIC_CONVERTER_URL}/convert`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Convert failed");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
```

Gunakan URL blob hasil konversi tersebut pada komponen `PDFPreview`. File Word/Excel/PPT otomatis dikonversi ke PDF sebelum ditampilkan.

**That's ALL!** 🎉

### (Optional) For External URLs

If you want to load PDFs from external URLs, create proxy API route:

**File:** `app/api/pdf-proxy/route.ts`
```typescript
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

**Done!** External URLs will auto-use this proxy. ✨

## 📖 API Reference

### PDFPreview Component

```typescript
interface PDFPreviewProps {
  // PDF source (required)
  file: File | string;
  
  // Optional props
  className?: string;
  onPageChange?: (page: number, total: number) => void;
  onError?: (error: Error) => void;
  proxyEndpoint?: string | false;  // Default: '/api/pdf-proxy'
  useProxy?: boolean;              // Default: true (auto-detect)
}
```

### Props Explained

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `file` | `File \| string` | **required** | PDF source: File object, URL, atau base64 |
| `className` | `string` | `''` | CSS classes tambahan |
| `onPageChange` | `function` | - | Callback saat halaman berubah |
| `onError` | `function` | - | Callback saat error |

**Note:** External URLs automatically use `/api/pdf-proxy` if available. No configuration needed! ✨

## 💡 Usage Examples

### Basic Usage

```tsx
import { PDFPreview } from '@haikal/react-pdf-viewer';

<PDFPreview file="/sample.pdf" />
```

### With File Upload

```tsx
const [file, setFile] = useState<File | null>(null);

<input 
  type="file" 
  accept=".pdf"
  onChange={(e) => setFile(e.target.files?.[0] || null)} 
/>

{file && <PDFPreview file={file} />}
```

### External URL (Auto Proxy)

```tsx
// Library akan otomatis detect & gunakan proxy!
<PDFPreview file="https://example.com/document.pdf" />
```

### With Callbacks

```tsx
<PDFPreview 
  file="/sample.pdf"
  onPageChange={(page, total) => {
    console.log(`Page ${page} of ${total}`);
  }}
  onError={(error) => {
    console.error('Failed to load PDF:', error);
  }}
/>
```

### Auto Proxy

External URLs automatically use `/api/pdf-proxy` endpoint:

```tsx
// This URL is external
<PDFPreview file="https://example.com/file.pdf" />

// Internally becomes:
// → /api/pdf-proxy?url=https%3A%2F%2Fexample.com%2Ffile.pdf

// No configuration needed! ✨
```

## 🎨 With Upload UI

Gunakan `PDFUploadPreview` untuk UI lengkap dengan drag & drop:

```tsx
import { PDFUploadPreview } from '@haikal/react-pdf-viewer';

export default function Page() {
  return <PDFUploadPreview />;
}
```

Features:
- ✅ Drag & drop upload
- ✅ Multiple file support
- ✅ File list dengan icon
- ✅ Tab navigation
- ✅ Auto preview

## ⚙️ Configuration

### Next.js Config

Tambahkan ke `next.config.js`:

```javascript
module.exports = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
}
```

### Tailwind Config

Tambahkan library path ke `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './node_modules/@haikal/react-pdf-viewer/**/*.{js,ts,jsx,tsx}',
  ],
}
```

## 🌐 External URLs & CORS

Library secara **otomatis** mendeteksi dan menggunakan proxy untuk external URLs!

### Auto Detection

```typescript
// Local - langsung
<PDFPreview file="/sample.pdf" />

// Same origin - langsung  
<PDFPreview file="http://localhost:3000/file.pdf" />

// External - auto proxy! ✨
<PDFPreview file="https://example.com/file.pdf" />
// → Internally becomes: /api/pdf-proxy?url=https://example.com/file.pdf
```

### How It Works

```typescript
// Local file - direct load
<PDFPreview file="/sample.pdf" />

// Same origin - direct load  
<PDFPreview file="http://localhost:3000/file.pdf" />

// External URL - auto proxy! ✨
<PDFPreview file="https://example.com/file.pdf" />
// → Auto transforms to: /api/pdf-proxy?url=...
```

## 🏗️ Tech Stack

- **React 18** - UI library
- **TypeScript 5** - Type safety
- **PDF.js 4.0** - PDF rendering (bundled!)
- **Next.js 14/15** - Framework support
- **Tailwind CSS 3** - Styling

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## 🐛 Troubleshooting

### Worker File Not Found

```bash
# Copy worker file
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
```

### External URL Not Loading

1. Pastikan proxy API route sudah dibuat
2. Check browser console untuk errors
3. Verify `proxyEndpoint` path benar

### SSR Errors

Component sudah SSR-safe, tapi pastikan:
- Import dari '@haikal/react-pdf-viewer' (bukan dynamic import)
- Tambahkan "use client" di top file

## 📚 Documentation

- [Installation Guide](./docs/INSTALLATION.md)
- [API Reference](./docs/API.md)  
- [Examples](./docs/EXAMPLES.md)
- [External PDF Guide](./docs/EXTERNAL_PDF_GUIDE.md)
- [FAQ](./docs/FAQ.md)

## 📝 Proyek Skripsi

Library ini merupakan bagian dari proyek skripsi:

**"Pengembangan Library Berbasis React untuk Preview Multi-Format Dokumen pada Framework Next.js"**

### Tahap Pengembangan:
- [x] **Tahap 1**: Preview PDF ✅
- [x] **Tahap 2**: Konversi Office (Word/Excel/PPT) via converter-service ✅
- [ ] **Tahap 3**: Preview TXT
- [ ] **Tahap 4**: Preview Images
- [ ] **Tahap 5**: Anotasi & Markup

## 📄 License

MIT License - feel free to use in your projects!

## 👤 Author

**Haikal** - BINUS University

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)

## ⭐ Show your support

Give a ⭐️ if this project helped you!

---

Made with ❤️ for Next.js developers

**Super simple. Super powerful. Just works.** ✨
