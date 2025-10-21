# Examples - @haikal/react-pdf-viewer

Ini adalah aplikasi Next.js yang mendemonstrasikan penggunaan library `@haikal/react-pdf-viewer`.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

Script `postinstall` akan otomatis copy PDF.js worker file ke folder `public/`.

### 2. Verify Worker File

Check bahwa file ini ada:
```
examples/public/pdf.worker.min.mjs
```

Jika tidak ada, jalankan manual:
```bash
npm run copy-worker
```

### 3. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Struktur

```
examples/
├── app/
│   ├── page.tsx              # Home page dengan navigation
│   ├── example-simple/       # Contoh simple preview
│   │   └── page.tsx
│   └── example-upload/       # Contoh dengan upload UI
│       └── page.tsx
├── public/
│   ├── sample.pdf            # Sample PDF file
│   └── pdf.worker.min.mjs    # PDF.js worker (auto-copied)
└── scripts/
    └── copy-pdf-worker.js    # Script untuk copy worker
```

## 📖 Examples

### 1. Simple Preview (example-simple)

Menampilkan PDF dari URL tanpa UI upload. Cocok untuk menampilkan dokumen statis.

**Features:**
- Load PDF dari URL
- All PDF viewer controls (zoom, navigation, fullscreen, download)
- Input URL untuk testing berbagai PDF

**URL:** http://localhost:3000/example-simple

### 2. Upload UI (example-upload)

UI lengkap dengan drag & drop upload, file list, dan preview sesuai design mockup.

**Features:**
- Drag & drop file upload
- Multiple file support
- File list dengan icon dan size
- Tab navigation (Preview, Detail, Integrasi)
- Auto-select first PDF
- Full preview functionality

**URL:** http://localhost:3000/example-upload

## 🔧 Development

### Run Development Server

```bash
npm run dev
```

### Build untuk Production

```bash
npm run build
npm start
```

### Copy Worker Manual

Jika worker file hilang atau perlu di-update:

```bash
npm run copy-worker
```

## ⚠️ Important Notes

### PDF.js Worker Required

**Library ini membutuhkan PDF.js worker file di folder `public/`.**

File ini akan otomatis di-copy saat `npm install` (via postinstall script).

Jika ada error seperti:
```
Setting up fake worker failed...
```

Jalankan:
```bash
npm run copy-worker
```

### Import dari Library

Examples ini mengimport langsung dari source code library:

```tsx
// Import dari ../lib/ (local development)
import('../../../lib').then(mod => mod.PDFPreview)
```

Saat library di-publish ke npm, users akan install dan import seperti ini:

```tsx
// Import dari npm package
import { PDFPreview } from '@haikal/react-pdf-viewer';
```

## 🐛 Troubleshooting

### Worker file not found

**Error:**
```
Module not found: Can't resolve '/pdf.worker.min.mjs'
```

**Solution:**
```bash
npm run copy-worker
```

### PDF tidak load

1. Check worker file ada di `public/pdf.worker.min.mjs`
2. Check PDF file ada di `public/sample.pdf`
3. Check browser console untuk errors
4. Try restart dev server

### Module not found: pdfjs-dist

```bash
npm install pdfjs-dist
```

## 📝 Notes untuk Development

- Library source code ada di folder `../lib/`
- Examples ini mengimport langsung dari `../lib/` untuk development
- Saat library di-publish, users akan import dari package name
- Worker file tidak di-commit ke git (ada di .gitignore)
- Worker file akan auto-copy saat npm install

## 🎨 Customization

Anda bisa memodifikasi examples ini untuk testing atau menambah contoh baru. Struktur sudah modular dan mudah diperluas.

### Menambah Example Baru

1. Buat folder baru di `app/`:
   ```
   app/example-new/page.tsx
   ```

2. Import library:
   ```tsx
   import dynamic from 'next/dynamic';
   
   const PDFPreview = dynamic(
     () => import('../../../lib').then(mod => mod.PDFPreview),
     { ssr: false }
   );
   ```

3. Gunakan component sesuai kebutuhan

## 📚 Dokumentasi

Untuk dokumentasi lengkap library, lihat:
- [Main README](../README.md)
- [API Documentation](../docs/API.md)
- [Troubleshooting Guide](../docs/TROUBLESHOOTING.md)
- [FAQ](../docs/FAQ.md)

---

**Happy coding! 🚀**

Jika ada pertanyaan, buka issue di GitHub atau lihat dokumentasi lengkap di folder `docs/`.
