"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path - menggunakan local worker dari public folder
if (typeof window !== 'undefined') {
  // Worker file harus di-copy ke public folder:
  // cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

/**
 * PDFPreview Component
 * 
 * Library React TypeScript untuk preview file PDF menggunakan PDF.js
 * Kompatibel dengan Next.js 14/15 App Router (client component only)
 * 
 * @component
 * @example
 * ```tsx
 * <PDFPreview file="/sample.pdf" />
 * <PDFPreview file={fileObject} />
 * <PDFPreview file="data:application/pdf;base64,..." />
 * ```
 * 
 * @param {PDFPreviewProps} props - Props untuk komponen PDFPreview
 * @param {File | string} props.file - File PDF (File object, URL, atau base64 string)
 * @param {string} [props.className] - CSS class tambahan
 * @param {(page: number, total: number) => void} [props.onPageChange] - Callback saat halaman berubah
 * @param {(error: Error) => void} [props.onError] - Callback saat terjadi error
 * 
 * @description
 * Komponen ini menggunakan PDF.js untuk render PDF di browser.
 * Fitur:
 * - Navigasi halaman (next/prev)
 * - Zoom in/out dengan level zoom
 * - Loading state dan error handling
 * - Support File object, URL, dan base64
 * - Fullscreen mode
 * - Download file
 * 
 * @note Komponen ini hanya berjalan di client-side (tidak support SSR)
 */

export interface PDFPreviewProps {
  file: File | string;
  className?: string;
  onPageChange?: (page: number, total: number) => void;
  onError?: (error: Error) => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  file,
  className = '',
  onPageChange,
  onError,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load PDF document
  useEffect(() => {
    // SSR-safe: Only run in browser
    if (typeof window === 'undefined') return;
    
    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadPDF = async () => {
      try {
        let pdfData: string | ArrayBuffer | Uint8Array;

        if (file instanceof File) {
          // Handle File object
          const arrayBuffer = await file.arrayBuffer();
          pdfData = new Uint8Array(arrayBuffer);
        } else if (file.startsWith('data:')) {
          // Handle base64
          pdfData = file;
        } else {
          // Handle URL string
          let urlToFetch = file;
          
          const isExternalUrl = (file.startsWith('http://') || file.startsWith('https://')) && 
                                !file.includes(window.location.hostname) &&
                                !file.startsWith(window.location.origin);
          
          // Auto-proxy untuk external URLs (always enabled)
          if (isExternalUrl && !file.includes('/api/pdf-proxy')) {
            urlToFetch = `/api/pdf-proxy?url=${encodeURIComponent(file)}`;
            console.log('[PDFPreview] Auto-using proxy for external URL:', file);
          }
          
          // Try fetch first untuk better error handling
          try {
            const response = await fetch(urlToFetch, {
              mode: 'cors',
              credentials: 'omit',
            });
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            pdfData = new Uint8Array(arrayBuffer);
          } catch (fetchError) {
            // Fallback: let PDF.js try directly with original URL
            console.warn('[PDFPreview] Fetch failed, trying direct load:', fetchError);
            pdfData = urlToFetch;
          }
        }

        const loadingTask = pdfjsLib.getDocument(pdfData);
        const pdf = await loadingTask.promise;

        if (!isMounted) return;

        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        const error = err as Error;
        setError(error.message || 'Gagal memuat PDF');
        setLoading(false);
        onError?.(error);
      }
    };

    loadPDF();

    return () => {
      isMounted = false;
    };
  }, [file, onError]);

  // Render page
  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      const deviceScale =
        (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1) * 1.5;

      const displayViewport = page.getViewport({ scale: zoom });
      const renderViewport = page.getViewport({ scale: zoom * deviceScale });

      canvas.width = renderViewport.width;
      canvas.height = renderViewport.height;
      canvas.style.width = `${displayViewport.width}px`;
      canvas.style.height = `${displayViewport.height}px`;

      const renderContext = {
        canvasContext: context,
        viewport: renderViewport,
      };

      await page.render(renderContext).promise;
      onPageChange?.(pageNum, totalPages);
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  }, [pdfDoc, zoom, totalPages, onPageChange]);

  // Render when page or zoom changes
  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [currentPage, pdfDoc, renderPage]);

  // Navigation handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Zoom handlers
  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setZoom(1.0);
  };

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Download handler
  const downloadPDF = () => {
    if (typeof file === 'string' && !file.startsWith('data:')) {
      // Download from URL
      const link = document.createElement('a');
      link.href = file;
      link.download = 'document.pdf';
      link.click();
    } else if (file instanceof File) {
      // Download File object
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Listen for fullscreen changes (SSR-safe)
  useEffect(() => {
    if (typeof window === 'undefined' || !document) return;
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full min-h-[400px] bg-gray-50 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dokumen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full min-h-[400px] bg-gray-50 ${className}`}>
        <div className="text-center text-red-600">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold">Gagal memuat PDF</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`flex flex-col h-full bg-gray-100 ${className}`}>
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Halaman sebelumnya"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <span className="text-sm font-medium px-3">
            Halaman {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Halaman selanjutnya"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Zoom out"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          
          <button
            onClick={resetZoom}
            className="px-3 py-1 text-sm font-medium hover:bg-gray-100 rounded"
          >
            {Math.round(zoom * 100)}%
          </button>
          
          <button
            onClick={zoomIn}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Zoom in"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Fullscreen"
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>

          <button
            onClick={downloadPDF}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Download"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div className="flex-1 overflow-auto bg-gray-100 p-6">
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="shadow-lg bg-white"
          />
        </div>
      </div>
    </div>
  );
};
