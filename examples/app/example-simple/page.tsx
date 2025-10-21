"use client";

import { useState } from 'react';
import Link from 'next/link';
import { PDFPreview, DocxPreview } from '../../../dist/index.mjs';

/**
 * Example Page - Simple Preview
 * Contoh penggunaan PDFPreview & DocxPreview tanpa UI upload
 * Support both PDF dan DOCX
 */

type FileType = 'pdf' | 'docx';

export default function ExampleSimplePage() {
  const [fileUrl, setFileUrl] = useState('/sample.pdf');
  const [fileType, setFileType] = useState<FileType>('pdf');

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Link 
              href="/"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm mb-2 inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Home
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Document Preview
            </h1>
            <p className="text-sm text-gray-600">
              Preview PDF & DOCX dari URL tanpa UI upload
            </p>
          </div>
          
          <div className="text-right">
            <div className="bg-gray-900 text-gray-100 px-4 py-2 rounded-lg text-xs font-mono inline-block">
              {fileType === 'pdf' 
                ? '<PDFPreview file={file} />'
                : '<DocxPreview file={file} />'}
            </div>
          </div>
        </div>

        {/* File Type Selector */}
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFileType('pdf');
                setFileUrl('/sample.pdf');
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                fileType === 'pdf'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📄 PDF
            </button>
            <button
              onClick={() => {
                setFileType('docx');
                setFileUrl('https://file-examples.com/wp-content/storage/2017/02/file-sample_100kB.docx');
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                fileType === 'docx'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📝 DOCX
            </button>
          </div>

          {/* URL Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder={`Masukkan URL ${fileType.toUpperCase()} (local atau external)...`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={() => setFileUrl(fileUrl)}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Load
            </button>
          </div>

          {/* Sample Buttons */}
          {fileType === 'pdf' ? (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFileUrl('/sample.pdf')}
                className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
              >
                📄 Local PDF Sample
              </button>
              <button
                onClick={() => setFileUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf')}
                className="px-3 py-1 text-xs bg-blue-200 hover:bg-blue-300 rounded"
              >
                🌐 External PDF
              </button>
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFileUrl('https://file-examples.com/wp-content/storage/2017/02/file-sample_100kB.docx')}
                className="px-3 py-1 text-xs bg-purple-200 hover:bg-purple-300 rounded"
              >
                📝 Sample DOCX (100KB)
              </button>
            </div>
          )}

          {/* Info Box */}
          <div className="text-xs bg-green-50 border border-green-200 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-green-600 text-lg">✨</span>
              <div className="flex-1">
                <p className="font-semibold text-green-900 mb-1">
                  {fileType === 'pdf' ? 'PDF: Auto Proxy Enabled!' : 'DOCX: Auto-Render to Snapshot!'}
                </p>
                <p className="text-green-700">
                  {fileType === 'pdf' 
                    ? 'External URLs akan otomatis menggunakan proxy untuk bypass CORS.'
                    : 'DOCX otomatis di-render ke snapshot image. Tidak perlu tombol generate!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview */}
      <div className="flex-1 overflow-hidden">
        {fileType === 'pdf' ? (
          <PDFPreview 
            file={fileUrl}
            onPageChange={(page: number, total: number) => {
              console.log(`Current page: ${page}/${total}`);
            }}
            onError={(error: Error) => {
              console.error('PDF Error:', error);
            }}
          />
        ) : (
          <DocxPreview 
            file={fileUrl}
            onRenderComplete={() => {
              console.log('DOCX rendered successfully!');
            }}
            onError={(error: Error) => {
              console.error('DOCX Error:', error);
            }}
          />
        )}
      </div>

      {/* Code Example */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <details className="cursor-pointer">
          <summary className="font-semibold text-gray-700 hover:text-gray-900">
            📝 Lihat Kode Implementasi
          </summary>
          <div className="mt-4 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm font-mono">{`import { PDFPreview, DocxPreview } from '@haikal/react-pdf-viewer';

export default function Page() {
  return (
    <div className="h-screen">
      {/* PDF Preview */}
      <PDFPreview file="/sample.pdf" />
      <PDFPreview file="https://example.com/file.pdf" /> {/* Auto proxy! ✨ */}
      
      {/* DOCX Preview */}
      <DocxPreview file="/sample.docx" />
      <DocxPreview file={uploadedDocxFile} /> {/* Auto snapshot! ✨ */}
    </div>
  );
}

// Optional: Dengan callbacks
<PDFPreview 
  file="/sample.pdf"
  onPageChange={(page, total) => console.log(page, total)}
  onError={(error) => console.error(error)}
/>

<DocxPreview 
  file="/sample.docx"
  onRenderComplete={() => console.log('Done!')}
  onError={(error) => console.error(error)}
/>`}</pre>
          </div>
          
          <div className="mt-3 bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>✨ Super Simple!</strong> Support PDF & DOCX. Tidak perlu <code>dynamic import</code>, 
              tidak perlu <code>ssr: false</code>, tidak perlu konfigurasi. Auto everything!
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
