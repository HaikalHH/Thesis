"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FileUpload, PDFPreview, DocxPreview } from '../../../dist/index.mjs';

/**
 * Example Page - With Upload UI (Composition Pattern)
 * Contoh penggunaan FileUpload + PDFPreview/DocxPreview dengan composition
 * Auto-detect file type (PDF atau DOCX) dan render component yang sesuai
 */
export default function ExampleUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Auto-detect file type
  const getFileType = (file: File | null): 'pdf' | 'docx' | null => {
    if (!file) return null;
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
    // Fallback: check extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'docx') return 'docx';
    return null;
  };
  
  const fileType = getFileType(selectedFile);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Document Upload & Preview
              </h1>
              <p className="text-xs text-gray-600">
                Upload PDF/DOCX + Auto Preview (Composition Pattern)
              </p>
            </div>
          </div>
          
          <div className="bg-gray-900 text-gray-100 px-3 py-1.5 rounded text-xs font-mono">
            {'<FileUpload /> + <Preview />'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Upload Section */}
        <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
          <FileUpload
            onFileSelect={setSelectedFile}
            accept=".pdf,.docx"
            maxSizeMB={10}
            showFileList={true}
          />
        </div>

        {/* Preview Section */}
        <div className="flex-1 overflow-hidden">
          {selectedFile ? (
            <>
              {fileType === 'pdf' && (
                <PDFPreview 
                  file={selectedFile}
                  onPageChange={(page: number, total: number) => {
                    console.log(`Page ${page}/${total}`);
                  }}
                  onError={(error: Error) => {
                    console.error('PDF Error:', error);
                  }}
                />
              )}
              {fileType === 'docx' && (
                <DocxPreview 
                  file={selectedFile}
                  onRenderComplete={() => {
                    console.log('DOCX rendered successfully!');
                  }}
                  onError={(error: Error) => {
                    console.error('DOCX Error:', error);
                  }}
                />
              )}
              {!fileType && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-red-600">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-semibold">Format tidak didukung</p>
                    <p className="text-sm mt-2">Hanya support PDF dan DOCX</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <svg 
                  className="w-24 h-24 text-gray-300 mx-auto mb-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                <p className="text-gray-500 text-lg font-medium mb-2">
                  Tidak ada file yang dipilih
                </p>
                <p className="text-gray-400 text-sm">
                  Upload file PDF atau DOCX untuk melihat preview
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with Code Example */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <details className="cursor-pointer">
          <summary className="font-semibold text-sm text-gray-700 hover:text-gray-900">
            💻 Lihat Kode Implementasi (Auto-Detect Pattern)
          </summary>
          <div className="mt-3 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-xs font-mono">{`import { FileUpload, PDFPreview, DocxPreview } from '@haikal/react-pdf-viewer';
import { useState } from 'react';

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Auto-detect file type
  const getFileType = (file: File | null) => {
    if (!file) return null;
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return 'docx';
    }
    return null;
  };
  
  const fileType = getFileType(selectedFile);

  return (
    <div className="flex">
      {/* Upload Section - Support both PDF & DOCX */}
      <FileUpload
        onFileSelect={setSelectedFile}
        accept=".pdf,.docx"
        maxSizeMB={10}
      />

      {/* Preview Section - Auto switch based on file type */}
      {fileType === 'pdf' && <PDFPreview file={selectedFile} />}
      {fileType === 'docx' && <DocxPreview file={selectedFile} />}
    </div>
  );
}

// ✨ Keuntungan Auto-Detect Pattern:
// 1. Satu FileUpload untuk multiple formats
// 2. Auto render component yang sesuai
// 3. Flexible & extensible
// 4. User experience yang smooth`}</pre>
          </div>
          
          <div className="mt-3 bg-green-50 border border-green-200 p-3 rounded-lg">
            <p className="text-sm text-green-900">
              <strong>💡 Smart Pattern:</strong> FileUpload support multiple formats, lalu auto-detect 
              file type dan render component yang sesuai (PDFPreview atau DocxPreview)!
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
