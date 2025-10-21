"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { renderAsync } from 'docx-preview';
import { getDocxPageSize, formatPageSize, type PageSize } from '../utils/docxPageSize';

/**
 * DocxPreview Component
 * 
 * Library React TypeScript untuk preview file DOCX di Next.js
 * Render langsung ke HTML dengan deteksi ukuran halaman otomatis
 * 
 * @component
 * @example
 * ```tsx
 * <DocxPreview file={fileObject} />
 * <DocxPreview file="/sample.docx" />
 * ```
 * 
 * @param {DocxPreviewProps} props - Props untuk komponen DocxPreview
 * @param {File | string} props.file - File DOCX (File object atau URL)
 * @param {string} [props.className] - CSS class tambahan
 * @param {(error: Error) => void} [props.onError] - Callback saat terjadi error
 * @param {() => void} [props.onRenderComplete] - Callback saat render selesai
 * 
 * @description
 * Komponen ini menggunakan docx-preview untuk render DOCX langsung ke HTML.
 * Fitur:
 * - Auto-detect ukuran halaman dari metadata DOCX
 * - Support A3, A4, A5, Letter, Legal, dan custom sizes
 * - Multi-page layout dengan CSS
 * - Loading state dan error handling
 * - Support File object dan URL
 * - Zoom controls
 * - Fullscreen mode
 * - Download file
 * - Text selectable (HTML, bukan gambar)
 * 
 * @note Komponen ini hanya berjalan di client-side (tidak support SSR)
 */

export interface DocxPreviewProps {
  file: File | string;
  className?: string;
  onError?: (error: Error) => void;
  onRenderComplete?: () => void;
}

export const DocxPreview: React.FC<DocxPreviewProps> = ({
  file,
  className = '',
  onError,
  onRenderComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderContainerRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState<PageSize | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  // Load and render DOCX
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadAndRenderDocx = async () => {
      // Ensure container ref is available
      if (!renderContainerRef.current) {
        console.error('[DocxPreview] Render container ref not ready, retrying...');
        // Retry after a short delay
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!renderContainerRef.current) {
          throw new Error('Render container tidak tersedia');
        }
      }

      try {
        console.log('[DocxPreview] Starting to load document...');
        
        // Get file data
        let fileData: Blob;

        if (file instanceof File) {
          fileData = file;
          console.log('[DocxPreview] File loaded:', file.name, file.size, 'bytes');
        } else {
          // Fetch from URL
          console.log('[DocxPreview] Fetching from URL:', file);
          const response = await fetch(file);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          fileData = await response.blob();
          console.log('[DocxPreview] File fetched, size:', fileData.size, 'bytes');
        }

        if (!isMounted) {
          console.log('[DocxPreview] Component unmounted, aborting...');
          return;
        }

        // Parse page size dari metadata DOCX
        console.log('[DocxPreview] Detecting page size...');
        const detectedPageSize = await getDocxPageSize(fileData);
        console.log('[DocxPreview] Page size detected:', detectedPageSize);
        
        if (!isMounted) return;
        
        setPageSize(detectedPageSize);

        // Clear container
        if (renderContainerRef.current) {
          renderContainerRef.current.innerHTML = '';
          console.log('[DocxPreview] Container cleared');
        }

        // Render DOCX to HTML dengan docx-preview
        if (!renderContainerRef.current) {
          console.error('[DocxPreview] Render container not available');
          return;
        }

        console.log('[DocxPreview] Starting docx-preview rendering...');
        
        await renderAsync(fileData, renderContainerRef.current, undefined, {
          className: 'docx-preview-content',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          renderHeaders: true,
          renderFooters: true,
          breakPages: true,
          experimental: true,
        });

        console.log('[DocxPreview] docx-preview rendering complete');

        if (!isMounted) return;

        // Wait for rendering to complete
        console.log('[DocxPreview] Waiting for DOM to settle...');
        await new Promise(resolve => setTimeout(resolve, 300));

        // Apply custom styling untuk page size
        if (renderContainerRef.current) {
          const sections = renderContainerRef.current.querySelectorAll('section.docx');
          console.log('[DocxPreview] Found', sections.length, 'sections/pages');
          setTotalPages(sections.length || 1);

          // Apply dynamic page size ke setiap section
          sections.forEach((section, index) => {
            const htmlSection = section as HTMLElement;
            
            // Set page dimensions
            htmlSection.style.width = `${detectedPageSize.widthMm}mm`;
            htmlSection.style.minHeight = `${detectedPageSize.heightMm}mm`;
            htmlSection.style.maxWidth = `${detectedPageSize.widthMm}mm`;
            
            // Add page wrapper class
            htmlSection.classList.add('docx-preview-page');
            
            // Add page number
            const pageNumber = document.createElement('div');
            pageNumber.className = 'docx-page-number';
            pageNumber.textContent = `Halaman ${index + 1}`;
            htmlSection.style.position = 'relative';
            htmlSection.insertBefore(pageNumber, htmlSection.firstChild);
          });

          console.log('[DocxPreview] Wrapping in container...');
          
          // Wrap in container
          const wrapper = document.createElement('div');
          wrapper.className = 'docx-preview-container';
          
          // Move all sections to wrapper
          while (renderContainerRef.current.firstChild) {
            wrapper.appendChild(renderContainerRef.current.firstChild);
          }
          
          renderContainerRef.current.appendChild(wrapper);
          console.log('[DocxPreview] Styling applied successfully');
        }

        console.log('[DocxPreview] Rendering complete!');
        setLoading(false);
        onRenderComplete?.();
      } catch (err) {
        if (!isMounted) return;
        const error = err as Error;
        setError(error.message || 'Gagal memuat dokumen DOCX');
        setLoading(false);
        onError?.(error);
        console.error('[DocxPreview] Error:', error);
      }
    };

    // Start loading with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      loadAndRenderDocx();
    }, 50);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [file, onError, onRenderComplete]);

  // Zoom handlers
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 2.0));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1.0);
  }, []);

  // Fullscreen handler
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Download handler
  const downloadFile = useCallback(() => {
    if (typeof file === 'string' && !file.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = file;
      link.download = 'document.docx';
      link.click();
    } else if (file instanceof File) {
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [file]);

  // Listen for fullscreen changes
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

  // Note: Do not early-return on loading; keep the render container mounted
  // so the ref is available for the renderer. Show a loading overlay instead.

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full min-h-[400px] bg-gray-50 ${className}`}>
        <div className="text-center text-red-600">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold">Gagal memuat dokumen DOCX</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`flex flex-col h-full ${isFullscreen ? 'docx-preview-fullscreen bg-gray-900' : 'bg-gray-100'} ${className}`}>
      {/* Toolbar */}
      <div className={`docx-toolbar border-b px-4 py-3 flex items-center justify-between ${isFullscreen ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {/* File Info */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 text-sm ${isFullscreen ? 'text-gray-200' : 'text-gray-600'}`}>
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">
              {file instanceof File ? file.name : 'Document.docx'}
            </span>
          </div>
          
          {/* Page Size Info */}
          {pageSize && (
            <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${isFullscreen ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>{formatPageSize(pageSize)}</span>
            </div>
          )}
          
          {totalPages > 0 && (
            <div className={`text-xs px-2 py-1 rounded ${isFullscreen ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              {totalPages} {totalPages === 1 ? 'halaman' : 'halaman'}
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className={`p-2 rounded transition-colors ${isFullscreen ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
            aria-label="Zoom out"
            title="Perkecil"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>

          <button
            onClick={resetZoom}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${isFullscreen ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            onClick={zoomIn}
            className={`p-2 rounded transition-colors ${isFullscreen ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
            aria-label="Zoom in"
            title="Perbesar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>

          <div className={`w-px h-6 mx-2 ${isFullscreen ? 'bg-gray-700' : 'bg-gray-300'}`}></div>

          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded transition-colors ${isFullscreen ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
            aria-label="Fullscreen"
            title={isFullscreen ? 'Keluar fullscreen' : 'Fullscreen'}
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
            onClick={downloadFile}
            className={`p-2 rounded transition-colors ${isFullscreen ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
            aria-label="Download"
            title="Download file"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="docx-preview-loading-spinner mx-auto mb-4"></div>
              <p className={`${isFullscreen ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Memuat dokumen DOCX...</p>
              <p className={`text-sm mt-2 ${isFullscreen ? 'text-gray-400' : 'text-gray-500'}`}>Mendeteksi ukuran halaman dan rendering...</p>
            </div>
          </div>
        )}
        <div 
          ref={renderContainerRef}
          className="docx-preview-zoom-wrapper"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
          }}
        />
      </div>
    </div>
  );
};
