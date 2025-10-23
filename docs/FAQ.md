# Frequently Asked Questions (FAQ)

## General Questions

### What is @haikal/react-pdf-viewer?

`@haikal/react-pdf-viewer` is a React TypeScript library for previewing PDF files in Next.js applications. It uses PDF.js as the rendering engine and provides a beautiful, customizable UI with features like zoom, navigation, fullscreen, and download.

### Is it free to use?

Yes! This library is open-source and released under the MIT License. You can use it in personal and commercial projects for free.

### What versions of Next.js are supported?

The library is compatible with Next.js 14 and 15, specifically designed for the App Router.

---

## Installation & Setup

### How do I install the library?

```bash
npm install @haikal/react-pdf-viewer
```

Then configure Next.js and Tailwind CSS as described in the [Installation Guide](./INSTALLATION.md).

### Do I need to install PDF.js separately?

No! PDF.js (`pdfjs-dist`) is included as a dependency. The worker file is automatically loaded from CDN.

### Why do I need to configure webpack in next.config.js?

PDF.js relies on canvas operations that aren't available in Node.js environment. The webpack configuration tells Next.js to skip canvas during server-side rendering:

```javascript
config.resolve.alias.canvas = false;
```

### Can I use this with the Pages Router?

While designed for App Router, you can use it with Pages Router by ensuring:
1. The component is client-side only
2. Use dynamic import with `ssr: false`
3. Configure webpack in `next.config.js`

---

## Usage Questions

### How do I avoid SSR errors?

Always use dynamic import with `ssr: false`:

```tsx
const PDFPreview = dynamic(
  () => import('@haikal/react-pdf-viewer').then(mod => mod.PDFPreview),
  { ssr: false }
);
```

### Can I display PDFs from external URLs?

Yes! Just pass the URL to the `file` prop:

```tsx
<PDFPreview file="https://example.com/document.pdf" />
```

Make sure CORS is properly configured on the external server.

### How do I handle File objects from input uploads?

```tsx
const [file, setFile] = useState<File | null>(null);

<input 
  type="file" 
  onChange={(e) => setFile(e.target.files?.[0] || null)} 
/>
<PDFPreview file={file} />
```

### Can I use base64 encoded PDFs?

Yes! Pass a data URL:

```tsx
<PDFPreview file="data:application/pdf;base64,JVBERi0xLjQK..." />
```

### How do I track which page the user is viewing?

Use the `onPageChange` callback:

```tsx
<PDFPreview 
  file="/sample.pdf"
  onPageChange={(page, total) => {
    console.log(`User is on page ${page} of ${total}`);
  }}
/>
```

---

## Features & Functionality

### What features are included?

- ✅ Page navigation (previous/next)
- ✅ Zoom controls (in/out/reset)
- ✅ Fullscreen mode
- ✅ Download functionality
- ✅ Loading states
- ✅ Error handling
- ✅ Drag & drop upload (PDFUploadPreview)
- ✅ Mobile responsive

### Can I customize the toolbar?

The built-in toolbar is part of the component. For a completely custom UI, you can:
1. Build your own component using PDF.js directly
2. Submit a feature request for customization options
3. Fork the library and modify it

### Does it support password-protected PDFs?

Not yet. This is a planned feature for a future release. Currently, only unprotected PDFs are supported.

### Can I display multiple PDFs side-by-side?

Yes! Just use multiple `PDFPreview` components:

```tsx
<div className="flex">
  <PDFPreview file="/doc1.pdf" />
  <PDFPreview file="/doc2.pdf" />
</div>
```

See the [examples](./EXAMPLES.md#side-by-side-comparison) for more details.

### How do I disable specific features (like download)?

Currently, all features are bundled together. We're considering adding props to toggle features in a future release. Track this on our [GitHub Issues](https://github.com/haikal/react-pdf-viewer/issues).

---

## Styling & Customization

### How do I change the styling?

Use the `className` prop to add Tailwind classes:

```tsx
<PDFPreview 
  file="/sample.pdf"
  className="h-screen bg-gray-100 rounded-xl shadow-2xl"
/>
```

### Can I change the toolbar colors?

The toolbar uses Tailwind's default gray colors. To customize:

1. **Override with Tailwind**: Use the `className` prop
2. **CSS Modules**: Wrap in a styled container
3. **Global CSS**: Target the component's classes (not recommended)

### Does it work with other CSS frameworks?

The library is built with Tailwind CSS. Using other frameworks may require additional configuration or style overrides.

---

## Performance

### How large of a PDF can it handle?

The library can handle PDFs of any size, but:
- **Loading time** increases with file size
- **Memory usage** increases with file size
- **Best performance**: PDFs under 10MB
- **Acceptable**: PDFs up to 50MB
- **May lag**: PDFs over 100MB

Consider optimizing/compressing large PDFs before serving.

### Does it load the entire PDF at once?

The library loads the PDF document metadata first, then renders pages on-demand. This is efficient for large documents.

### How can I improve performance?

1. **Compress PDFs** before serving
2. **Use CDN** for faster delivery
3. **Lazy load** the component
4. **Dynamic import** to reduce initial bundle
5. **Cache PDFs** on the server/browser

---

## Error Handling

### What happens if the PDF fails to load?

The component displays a user-friendly error message. You can also handle errors with the `onError` callback:

```tsx
<PDFPreview 
  file="/sample.pdf"
  onError={(error) => {
    console.error('PDF Error:', error);
    // Show toast notification, log to service, etc.
  }}
/>
```

### Common errors and solutions

**"Failed to fetch"**
- Check if the PDF URL is correct
- Verify CORS settings for external URLs
- Ensure the file exists

**"Invalid PDF structure"**
- The file might be corrupted
- Try opening it in another PDF viewer
- Re-export/re-save the PDF

**"Canvas not found"**
- Make sure you added the webpack config
- Verify you're using dynamic import with `ssr: false`

---

## Browser Compatibility

### Which browsers are supported?

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ |
| Firefox 88+ | ✅ |
| Safari 14+ | ✅ |
| Edge 90+ | ✅ |

Older browsers may work but aren't officially tested.

### Does it work on mobile?

Yes! The library is fully responsive and works on:
- Mobile Chrome (Android)
- Mobile Safari (iOS)
- Samsung Internet
- Other modern mobile browsers

### Any known browser issues?

- **Safari**: Fullscreen API works but UI differs slightly
- **Firefox**: PDF.js performs slightly slower than Chrome
- **IE11**: Not supported (Next.js doesn't support IE11)

---

## Deployment

### Does it work on Vercel?

Yes! The library works perfectly on Vercel with no special configuration needed.

### What about other hosting platforms?

Yes, it works on:
- ✅ Vercel
- ✅ Netlify
- ✅ AWS Amplify
- ✅ Cloudflare Pages
- ✅ Any Node.js hosting

### Do I need special server configuration?

No special server configuration needed. Just ensure:
1. Static files (PDFs) are served correctly
2. CORS is configured if serving from external domain

---

## Development

### Can I contribute to this project?

Yes! Contributions are welcome. See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

### How do I report bugs?

Open an issue on [GitHub](https://github.com/haikal/react-pdf-viewer/issues) with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details

### Is there a roadmap?

This adalah fase pertama (PDF) dari proyek tugas akhir. Roadmap terbaru:

- [x] Phase 2: Office conversion (Word/Excel/PPT via converter-service)
- [ ] Phase 3: TXT preview
- [ ] Phase 4: Image preview
- [ ] Phase 5: Annotations & markup tools

---

## TypeScript

### Does it include TypeScript definitions?

Yes! Full TypeScript support with type definitions included. No need for `@types` packages.

### How do I type the file prop?

```typescript
import type { PDFPreviewProps } from '@haikal/react-pdf-viewer';

const props: PDFPreviewProps = {
  file: '/sample.pdf', // or File object or base64 string
  onPageChange: (page, total) => { /* ... */ },
};
```

---

## Troubleshooting

### The PDF shows but zoom/navigation doesn't work

Make sure you're passing a valid PDF file and check the browser console for errors.

### Styles are not applied

Ensure Tailwind CSS is configured and includes the library path:

```javascript
// tailwind.config.js
content: [
  './node_modules/@haikal/react-pdf-viewer/**/*.{js,ts,jsx,tsx}',
]
```

### Getting "window is not defined" error

Use dynamic import with `ssr: false`:

```tsx
const PDFPreview = dynamic(
  () => import('@haikal/react-pdf-viewer').then(mod => mod.PDFPreview),
  { ssr: false }
);
```

### PDF loads but shows blank page

This can happen if:
1. The PDF is corrupted
2. Canvas rendering failed
3. The PDF has security restrictions

Check the browser console for specific errors.

---

## License & Attribution

### What license is this under?

MIT License. You can use it freely in personal and commercial projects.

### Do I need to give credit?

Not required, but appreciated! A link back to the [GitHub repo](https://github.com/haikal/react-pdf-viewer) or mention in your docs would be nice.

### Can I use it in a commercial product?

Yes! The MIT License allows commercial use.

---

## Still have questions?

- 📖 Check the [Documentation](../README.md)
- 💬 Open a [GitHub Discussion](https://github.com/haikal/react-pdf-viewer/discussions)
- 🐛 Report bugs on [GitHub Issues](https://github.com/haikal/react-pdf-viewer/issues)
- 📧 Email: [your-email@example.com]

---

**Happy coding! 🚀**
