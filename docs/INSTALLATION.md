# Installation Guide

## Prerequisites

Before installing `@haikal/react-pdf-viewer`, make sure you have:

- Node.js 18.x or higher
- Next.js 14.x or 15.x
- React 18.x
- Tailwind CSS configured in your project

## Step 1: Install the Package

```bash
npm install @haikal/react-pdf-viewer pdfjs-dist
# or
yarn add @haikal/react-pdf-viewer pdfjs-dist
# or
pnpm add @haikal/react-pdf-viewer pdfjs-dist
```

**Important:** `pdfjs-dist` adalah peer dependency yang wajib diinstall.

## Step 2: Configure Next.js

Add the following to your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Required for PDF.js to work properly
    config.resolve.alias.canvas = false;
    return config;
  },
}

module.exports = nextConfig
```

## Step 3: Configure Tailwind CSS

Update your `tailwind.config.js` to include the library's components:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    
    // Add this line to include library styles
    './node_modules/@haikal/react-pdf-viewer/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Step 4: Use in Your Project

### Option 1: Simple Preview (Recommended)

Create a new page in your Next.js app:

```tsx
// app/pdf-viewer/page.tsx
"use client";

import dynamic from 'next/dynamic';

// Use dynamic import to avoid SSR issues
const PDFPreview = dynamic(
  () => import('@haikal/react-pdf-viewer').then(mod => mod.PDFPreview),
  { ssr: false }
);

export default function PDFViewerPage() {
  return (
    <div className="h-screen">
      <PDFPreview file="/your-document.pdf" />
    </div>
  );
}
```

### Option 2: With Upload UI

```tsx
// app/upload/page.tsx
"use client";

import dynamic from 'next/dynamic';

const PDFUploadPreview = dynamic(
  () => import('@haikal/react-pdf-viewer').then(mod => mod.PDFUploadPreview),
  { ssr: false }
);

export default function UploadPage() {
  return <PDFUploadPreview />;
}
```

### Option 3: Direct Import (Client Component Only)

```tsx
// app/viewer/page.tsx
"use client";

import { PDFPreview } from '@haikal/react-pdf-viewer';
import { useState } from 'react';

export default function ViewerPage() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="h-screen">
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      
      {file && <PDFPreview file={file} />}
    </div>
  );
}
```

## Step 5: Add PDF Files

Place your PDF files in the `public` folder:

```
your-project/
├── public/
│   ├── sample.pdf
│   ├── document.pdf
│   └── ...
└── ...
```

Then reference them with a forward slash:

```tsx
<PDFPreview file="/sample.pdf" />
```

## Troubleshooting

### Canvas Error

If you see a canvas-related error, make sure you've added the webpack config in `next.config.js`:

```javascript
config.resolve.alias.canvas = false;
```

### SSR Issues

Always use dynamic import with `ssr: false` for PDF components:

```tsx
const PDFPreview = dynamic(
  () => import('@haikal/react-pdf-viewer').then(mod => mod.PDFPreview),
  { ssr: false }
);
```

### Tailwind Styles Not Applied

Make sure you've added the library path to your `tailwind.config.js` content array:

```javascript
'./node_modules/@haikal/react-pdf-viewer/**/*.{js,ts,jsx,tsx}'
```

### PDF.js Worker Error

The library automatically loads the worker from CDN. If you prefer to host it yourself:

```tsx
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/path/to/pdf.worker.min.js';
```

## TypeScript Support

The library includes full TypeScript definitions. No additional @types packages needed!

```tsx
import type { PDFPreviewProps } from '@haikal/react-pdf-viewer';

const props: PDFPreviewProps = {
  file: '/sample.pdf',
  onPageChange: (page, total) => {
    console.log(`Page ${page} of ${total}`);
  },
};
```

## Next Steps

- Check out the [API Reference](./API.md)
- See [Examples](./EXAMPLES.md) for more use cases
- Read the [FAQ](./FAQ.md) for common questions

## Need Help?

- Open an issue on [GitHub](https://github.com/haikal/react-pdf-viewer/issues)
- Check the [documentation](../README.md)
- Review the [examples](../src/app) in the repository

---

Happy coding! 🚀

