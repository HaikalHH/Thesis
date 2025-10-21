# Loading External PDFs - Complete Guide

## 🚫 Masalah: CORS Restrictions

Browser tidak mengizinkan fetch PDF dari domain lain karena **CORS (Cross-Origin Resource Sharing)** policy.

### Error yang Muncul:
```
Failed to fetch
Access to fetch at 'https://example.com/file.pdf' has been blocked by CORS policy
```

---

## ✅ Solusi: API Proxy Route

### 1. Buat API Proxy di Next.js

**File: `app/api/pdf-proxy/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
  }

  // Fetch PDF from external source
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
  });

  const blob = await response.blob();
  
  // Return with CORS headers
  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'application/pdf',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
```

### 2. Gunakan Proxy di Component

```typescript
// Untuk external URLs
const externalUrl = 'https://example.com/file.pdf';
const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(externalUrl)}`;

<PDFPreview file={proxyUrl} />
```

---

## 📝 Cara Pakai di Examples

### Automatic Proxy Toggle

Di example-simple page, ada checkbox untuk enable/disable proxy:

```typescript
const [useProxy, setUseProxy] = useState(true);

// Load PDF
if (useProxy && isExternalUrl) {
  setPdfUrl(`/api/pdf-proxy?url=${encodeURIComponent(inputUrl)}`);
} else {
  setPdfUrl(inputUrl);
}
```

### Test dengan Button

Click button **External 1, 2, atau 3** untuk test PDF dari:
- ✅ W3C (CORS-enabled naturally)
- ✅ Mozilla PDF.js
- ✅ PDFObject

---

## 🎯 URL Test Cases

### ✅ URLs yang Work (dengan atau tanpa proxy):

1. **W3C Test PDF**
   ```
   https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
   ```

2. **Mozilla PDF.js Demo**
   ```
   https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf
   ```

3. **PDFObject Sample**
   ```
   https://pdfobject.com/pdf/sample.pdf
   ```

### ❌ URLs yang Butuh Proxy:

URLs dari server yang tidak set CORS headers, misalnya:
- Internal company servers
- Protected CDNs
- Custom backends tanpa CORS

---

## 🔧 Implementasi di Production

### Option 1: Next.js API Route (Recommended)

**Pros:**
- ✅ Easy to implement
- ✅ No infrastructure changes
- ✅ Works with Vercel/Netlify
- ✅ Can add authentication

**Cons:**
- ❌ Uses serverless function runtime
- ❌ May have size limits (10MB on Vercel free)

### Option 2: Dedicated Proxy Server

```typescript
// Separate Express server
app.get('/proxy', async (req, res) => {
  const { url } = req.query;
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  res.set('Content-Type', 'application/pdf');
  res.send(Buffer.from(buffer));
});
```

**Pros:**
- ✅ No size limits
- ✅ Better performance
- ✅ More control

**Cons:**
- ❌ Needs separate deployment
- ❌ More complex setup

### Option 3: CORS-Anywhere Service

**Public services** (not recommended for production):
```typescript
const corsProxy = 'https://cors-anywhere.herokuapp.com/';
const pdfUrl = corsProxy + 'https://example.com/file.pdf';
```

**Cons:**
- ❌ Rate limited
- ❌ Unreliable
- ❌ Security concerns
- ❌ Not for production

---

## 🛡️ Security Considerations

### Validate URLs

```typescript
// Check URL is valid
try {
  const parsedUrl = new URL(url);
  // Optional: whitelist domains
  const allowedDomains = ['example.com', 'yourdomain.com'];
  if (!allowedDomains.includes(parsedUrl.hostname)) {
    throw new Error('Domain not allowed');
  }
} catch (error) {
  return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
}
```

### Rate Limiting

```typescript
// Simple rate limiting
const cache = new Map();

export async function GET(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const userRequests = cache.get(ip) || [];
  
  // Max 10 requests per minute
  const recentRequests = userRequests.filter(time => now - time < 60000);
  if (recentRequests.length >= 10) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  
  recentRequests.push(now);
  cache.set(ip, recentRequests);
  
  // ... fetch PDF
}
```

### Authentication

```typescript
export async function GET(request: NextRequest) {
  // Check auth header
  const token = request.headers.get('Authorization');
  if (!token || !isValidToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... fetch PDF
}
```

---

## 📊 Performance Tips

### 1. Add Caching

```typescript
return new NextResponse(blob, {
  headers: {
    'Content-Type': 'application/pdf',
    'Cache-Control': 'public, max-age=3600', // Cache 1 hour
    'ETag': generateETag(blob),
  },
});
```

### 2. Stream Large Files

```typescript
const response = await fetch(url);
return new NextResponse(response.body, {
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Length': response.headers.get('Content-Length') || '',
  },
});
```

### 3. Use CDN

Upload PDFs to CDN with CORS enabled:
- Cloudflare R2
- AWS S3 + CloudFront
- Vercel Blob

---

## 🎯 Best Practices

### For Users of Your Library:

**Recommendation:** Host PDFs on same domain or CORS-enabled CDN.

```typescript
// ✅ Best - Same domain
<PDFPreview file="/pdfs/document.pdf" />

// ✅ Good - CDN with CORS
<PDFPreview file="https://cdn.yourdomain.com/doc.pdf" />

// ⚠️ Requires proxy - External URL
<PDFPreview file="/api/pdf-proxy?url=https://external.com/doc.pdf" />
```

### Documentation for Library Users:

Add to README:

```markdown
## External URLs

For external PDFs, create a proxy route in your Next.js app:

\`\`\`typescript
// app/api/pdf-proxy/route.ts
export async function GET(request) {
  const url = request.nextUrl.searchParams.get('url');
  const response = await fetch(url);
  const blob = await response.blob();
  return new NextResponse(blob, {
    headers: { 'Content-Type': 'application/pdf' }
  });
}
\`\`\`

Then use:
\`\`\`typescript
<PDFPreview file={`/api/pdf-proxy?url=${encodeURIComponent(externalUrl)}`} />
\`\`\`
```

---

## ✅ Test Checklist

Test these scenarios:

- [ ] Local PDF (`/sample.pdf`)
- [ ] Same-origin URL (`http://localhost:3000/sample.pdf`)
- [ ] External CORS-enabled URL (W3C, Mozilla)
- [ ] External non-CORS URL via proxy
- [ ] Invalid URL (should show error)
- [ ] Large PDF (>10MB) via proxy
- [ ] Proxy toggle works correctly
- [ ] Error messages are clear

---

## 🐛 Troubleshooting

### Proxy not working

1. **Check API route exists:**
   ```bash
   curl http://localhost:3000/api/pdf-proxy?url=https://example.com/file.pdf
   ```

2. **Check Next.js logs** for errors

3. **Verify URL encoding:**
   ```typescript
   const encoded = encodeURIComponent(url);
   console.log('Encoded:', encoded);
   ```

### Still getting CORS errors

- Make sure proxy checkbox is enabled
- Check browser Network tab
- Verify API route is being called
- Check console for errors

---

**Summary:** Gunakan API proxy route untuk handle external PDFs. Ini paling reliable dan production-ready! 🚀

