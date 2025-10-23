"use client";

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            React Document Viewer
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Library React TypeScript untuk Preview PDF di Next.js (Office via converter-service)
          </p>
          <p className="text-sm text-gray-500">
            Powered by PDF.js • Compatible dengan Next.js 14/15 App Router • Full TypeScript
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
          {/* Example 1 - Simple Preview */}
          <Link href="/example-simple">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-500">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Preview Mode
              </h2>
              <p className="text-gray-600 mb-4">
                Preview PDF dari URL atau otomatis konversi Word/Excel/PPT → PDF sebelum ditampilkan. Cocok untuk integrasi cepat.
              </p>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono">
                {'<PDFPreview file={source} />'}
              </div>
              <div className="mt-3 flex gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">📄 PDF</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">📝 Office → PDF</span>
              </div>
            </div>
          </Link>

          {/* Example 2 - With Upload UI */}
          <Link href="/example-upload">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload Mode
              </h2>
              <p className="text-gray-600 mb-4">
                UI lengkap dengan drag & drop upload, file list, dan auto-preview. Word, Excel, dan PowerPoint otomatis dikonversi ke PDF oleh converter-service.
              </p>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono">
                {'<FileUpload /> + <AutoPreview />'}
              </div>
              <div className="mt-3 flex gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">📄 PDF</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">📝 Office → PDF</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">✨ Auto</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ✨ Fitur Utama
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">Fast & Responsive</h4>
              <p className="text-sm text-gray-600">Render PDF cepat dengan PDF.js engine</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">Zoom Controls</h4>
              <p className="text-sm text-gray-600">Zoom in/out dan navigasi halaman</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">Error Handling</h4>
              <p className="text-sm text-gray-600">Loading state dan error handling yang robust</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Proyek Skripsi: Pengembangan Library Berbasis React untuk Preview Multi-Format Dokumen</p>
          <p className="mt-2">Next.js 14/15 • React 18 • TypeScript • PDF.js • LibreOffice • Tailwind CSS</p>
          <p className="mt-3 text-xs">
            Support: <span className="font-semibold">PDF</span> & <span className="font-semibold">Office (Word/Excel/PPT via converter)</span> •
            More formats coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}
