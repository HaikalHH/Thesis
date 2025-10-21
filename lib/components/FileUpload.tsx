/**
 * FileUpload Component
 * 
 * Generic file upload component dengan drag & drop support
 * Bisa digunakan untuk berbagai format file (PDF, DOCX, Excel, dll)
 * 
 * @example
 * ```tsx
 * import { FileUpload } from '@haikal/react-pdf-viewer';
 * import { PDFPreview } from '@haikal/react-pdf-viewer';
 * 
 * const [selectedFile, setSelectedFile] = useState<File | null>(null);
 * 
 * <FileUpload 
 *   onFileSelect={setSelectedFile}
 *   accept=".pdf"
 * />
 * {selectedFile && <PDFPreview file={selectedFile} />}
 * ```
 */

"use client";

import React, { useState, useCallback, useRef } from 'react';

export interface FileUploadProps {
  /**
   * Callback saat file dipilih
   */
  onFileSelect?: (file: File | null) => void;
  
  /**
   * Accepted file types (e.g., ".pdf,.docx")
   * Default: all files
   */
  accept?: string;
  
  /**
   * Maximum file size in MB
   * Default: 10MB
   */
  maxSizeMB?: number;
  
  /**
   * Allow multiple files
   * Default: false
   */
  multiple?: boolean;
  
  /**
   * Custom className
   */
  className?: string;
  
  /**
   * Show file list
   * Default: true
   */
  showFileList?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = '*',
  maxSizeMB = 10,
  multiple = false,
  className = '',
  showFileList = true,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File terlalu besar (${fileSizeMB.toFixed(2)}MB). Maksimal ${maxSizeMB}MB.`;
    }

    // Check file type if accept is specified
    if (accept !== '*') {
      const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
      const fileName = file.name.toLowerCase();
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileName.endsWith(type);
        }
        return file.type === type;
      });
      
      if (!isAccepted) {
        return `Format file tidak didukung. Harap pilih file: ${accept}`;
      }
    }

    return null;
  };

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;

    const fileArray = Array.from(newFiles);
    const validFiles: File[] = [];
    
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        setError(error);
        return;
      }
      validFiles.push(file);
    }

    setError(null);
    
    if (multiple) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      setSelectedIndex(updatedFiles.length - 1);
      onFileSelect?.(validFiles[validFiles.length - 1]);
    } else {
      setFiles(validFiles);
      setSelectedIndex(0);
      onFileSelect?.(validFiles[0]);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [files, multiple, accept, maxSizeMB, onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleFileSelect = (index: number) => {
    setSelectedIndex(index);
    onFileSelect?.(files[index]);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    
    if (newFiles.length === 0) {
      setSelectedIndex(0);
      onFileSelect?.(null);
    } else if (selectedIndex >= newFiles.length) {
      setSelectedIndex(newFiles.length - 1);
      onFileSelect?.(newFiles[newFiles.length - 1]);
    } else {
      onFileSelect?.(newFiles[selectedIndex]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const selectedFile = files[selectedIndex];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Upload Area */}
      <div className="p-6 bg-white border-b border-gray-200">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragging 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileInput}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-3">
            <svg 
              className="w-12 h-12 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            
            <div>
              <p className="text-base font-semibold text-gray-700">
                {isDragging ? 'Drop file di sini' : 'Klik atau drag & drop file'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {accept === '*' ? 'Semua format' : accept} • Maksimal {maxSizeMB}MB
              </p>
            </div>
            
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Pilih File
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* File List */}
      {showFileList && files.length > 0 && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="px-6 py-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              File yang dipilih ({files.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  onClick={() => handleFileSelect(index)}
                  className={`
                    flex items-center justify-between p-3 rounded-lg cursor-pointer
                    transition-colors
                    ${index === selectedIndex 
                      ? 'bg-primary-100 border border-primary-300' 
                      : 'bg-white border border-gray-200 hover:border-primary-200'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <svg 
                      className="w-8 h-8 text-red-500 flex-shrink-0" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      {files.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <svg 
              className="w-16 h-16 text-gray-300 mx-auto mb-4" 
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
            <p className="text-gray-500 text-sm">
              Belum ada file yang dipilih
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

