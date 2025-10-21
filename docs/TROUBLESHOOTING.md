# Troubleshooting Guide

## Common Issues and Solutions

### Module not found: 'pdfjs-dist/build/pdf.worker.min.js'

**Error:**
```
Module not found: Can't resolve 'pdfjs-dist/build/pdf.worker.min.js'
```

**Cause:**
`pdfjs-dist` belum diinstall di proyek Next.js Anda.

**Solution:**
```bash
npm install pdfjs-dist
```

Library ini membutuhkan `pdfjs-dist` sebagai peer dependency.

---

### PDF.js Worker Configuration

**Library ini menggunakan LOCAL worker file dari folder `public/`:**

```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
```

**Setup Worker (PENTING!):**

Worker file **HARUS** di-copy ke folder `public/` proyek Anda:

```bash
# Windows (PowerShell)
Copy-Item node_modules/pdfjs-dist/build/pdf.worker.min.mjs -Destination public/

# Mac/Linux
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
```

**Automatic Setup:**

Buat script `scripts/copy-pdf-worker.js`:

```javascript
const fs = require('fs');
const path = require('path');

const workerSrc = path.join(__dirname, '../node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
const workerDest = path.join(__dirname, '../public/pdf.worker.min.mjs');

fs.copyFileSync(workerSrc, workerDest);
console.log('✅ PDF.js worker copied');
```

Tambahkan ke `package.json`:

```json
{
  "scripts": {
    "postinstall": "node scripts/copy-pdf-worker.js",
    "build": "node scripts/copy-pdf-worker.js && next build"
  }
}
```

**Kenapa Local Worker?**
- ✅ Tidak butuh internet/CDN
- ✅ Lebih cepat (no external requests)
- ✅ Tidak ada CORS issues
- ✅ Works offline
- ✅ More reliable

---

### Error: "window is not defined"

**Cause:**
Component di-render di server-side.

**Solution:**
Gunakan dynamic import dengan `ssr: false`:

```tsx
import dynamic from 'next/dynamic';

const PDFPreview = dynamic(
  () => import('@haikal/react-pdf-viewer').then(mod => mod.PDFPreview),
  { ssr: false }
);
```

---

### Tailwind styles tidak muncul

**Cause:**
Library path tidak ada di Tailwind config.

**Solution:**
Update `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './node_modules/@haikal/react-pdf-viewer/**/*.{js,ts,jsx,tsx}',
  ],
}
```

---

### PDF tidak load / blank screen

**Possible causes:**

1. **File path salah:**
   ```tsx
   // ✅ Correct
   <PDFPreview file="/sample.pdf" />
   
   // ❌ Wrong (missing leading slash)
   <PDFPreview file="sample.pdf" />
   ```

2. **File belum di public folder:**
   ```
   your-project/
   └── public/
       └── sample.pdf  ← Harus ada di sini
   ```

3. **CORS issue untuk external URL:**
   ```tsx
   // External URL butuh CORS enabled
   <PDFPreview file="https://example.com/file.pdf" />
   ```
   
   Check console untuk CORS errors.

---

### PDF load tapi sangat lambat

**Solutions:**

1. **Compress PDF file:**
   - Gunakan tools seperti Adobe Acrobat, PDFtk, atau online compressor
   - Target: < 10MB untuk performa optimal

2. **Host di CDN:**
   - Upload PDF ke CDN (Vercel, Cloudflare, AWS S3)
   - Enable caching

3. **Lazy load component:**
   ```tsx
   {showPDF && <PDFPreview file="/large.pdf" />}
   ```

---

### Build error di Next.js

**Error:**
```
Module parse failed: Unexpected token
```

**Solution:**
Add webpack config to `next.config.js`:

```javascript
module.exports = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
}
```

---

### TypeScript errors

**Error:**
```
Cannot find module '@haikal/react-pdf-viewer' or its corresponding type declarations
```

**Solution:**

1. Install library:
   ```bash
   npm install @haikal/react-pdf-viewer
   ```

2. Library includes TypeScript definitions, tidak perlu install `@types`.

3. Jika masih error, restart TypeScript server:
   - VS Code: Cmd/Ctrl + Shift + P → "Restart TS Server"

---

### Development: Changes tidak update

**For library development:**

1. Rebuild library:
   ```bash
   npm run build
   ```

2. Restart Next.js dev server:
   ```bash
   cd examples
   npm run dev
   ```

---

### Production: PDF tidak load setelah deploy

**Check:**

1. **PDF files di-deploy:**
   - Vercel/Netlify: Files di `public/` auto-deployed
   - Check file accessible di browser: `your-domain.com/sample.pdf`

2. **Environment:**
   - PDF.js butuh browser APIs
   - Pastikan component di-render di client (bukan server)

3. **Worker CDN accessible:**
   - Check network tab di browser dev tools
   - Worker harus load dari unpkg.com

---

### Browser-specific issues

#### Safari

**Issue:** Fullscreen mode UI berbeda

**Solution:** This is normal. Safari has different fullscreen API behavior.

#### Firefox

**Issue:** PDF rendering slightly slower

**Solution:** Normal behavior. Firefox's canvas performance slightly different.

#### Mobile browsers

**Issue:** Touch gestures tidak smooth

**Solution:** Add touch event handlers if needed (future enhancement).

---

### Performance optimization

**Tips:**

1. **Preload PDF:**
   ```tsx
   <link rel="preload" href="/sample.pdf" as="fetch" />
   ```

2. **Cache worker:**
   Worker dari CDN otomatis di-cache oleh browser.

3. **Code splitting:**
   Library sudah support dynamic import untuk optimal bundle size.

4. **Memoize callbacks:**
   ```tsx
   const handlePageChange = useCallback((page, total) => {
     console.log(page, total);
   }, []);
   ```

---

### Still having issues?

1. Check browser console for errors
2. Try with sample PDF first
3. Test in different browser
4. Check [FAQ](./FAQ.md)
5. Open issue on [GitHub](https://github.com/haikal/react-pdf-viewer/issues)

---

## Debug Checklist

Before reporting issues, check:

- [ ] `pdfjs-dist` installed
- [ ] Next.js config has webpack alias
- [ ] Using dynamic import with `ssr: false`
- [ ] PDF file exists and accessible
- [ ] Tailwind config includes library path
- [ ] Browser console shows no errors
- [ ] Using latest version of library
- [ ] Node.js version >= 18
- [ ] Next.js version >= 14

---

**Need more help?** Open an issue with:
- Error message (full stack trace)
- Your configuration files
- Steps to reproduce
- Expected vs actual behavior

