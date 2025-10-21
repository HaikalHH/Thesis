/**
 * @haikal/react-pdf-viewer
 * 
 * Library React TypeScript untuk preview file PDF di Next.js
 * Menggunakan PDF.js sebagai engine render
 * 
 * @author Haikal
 * @version 1.0.0
 * @license MIT
 */

// PDF Preview Component
export { PDFPreview } from './components/PDFPreview';
export type { PDFPreviewProps } from './components/PDFPreview';

// DOCX Preview Component
export { DocxPreview } from './components/DocxPreview';
export type { DocxPreviewProps } from './components/DocxPreview';

// DOCX Utilities
export { getDocxPageSize, formatPageSize } from './utils/docxPageSize';
export type { PageSize } from './utils/docxPageSize';

// Generic file upload component (reusable for all formats)
export { FileUpload } from './components/FileUpload';
export type { FileUploadProps } from './components/FileUpload';

