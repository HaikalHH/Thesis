/**
 * Utility untuk mendapatkan ukuran halaman dari file DOCX
 * Parse metadata dari word/document.xml
 * Menggunakan DOMParser native browser (tidak perlu xml2js)
 */

import JSZip from 'jszip';

export interface PageSize {
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
  orientation: 'portrait' | 'landscape';
  standardSize?: 'A3' | 'A4' | 'A5' | 'Letter' | 'Legal' | 'Custom';
}

/**
 * Konversi TWIPS ke milimeter
 * 1 inch = 1440 TWIPS
 * 1 inch = 25.4 mm
 */
function twipsToMm(twips: number): number {
  return (twips / 1440) * 25.4;
}

/**
 * Konversi milimeter ke pixel (96 DPI)
 */
function mmToPx(mm: number): number {
  return (mm / 25.4) * 96;
}

/**
 * Deteksi standard page size berdasarkan dimensi
 */
function detectStandardSize(widthMm: number, heightMm: number): PageSize['standardSize'] {
  const tolerance = 2; // toleransi 2mm
  
  const sizes = {
    A3: { width: 297, height: 420 },
    A4: { width: 210, height: 297 },
    A5: { width: 148, height: 210 },
    Letter: { width: 215.9, height: 279.4 },
    Legal: { width: 215.9, height: 355.6 },
  };

  for (const [name, size] of Object.entries(sizes)) {
    if (
      Math.abs(widthMm - size.width) < tolerance &&
      Math.abs(heightMm - size.height) < tolerance
    ) {
      return name as PageSize['standardSize'];
    }
  }

  return 'Custom';
}

/**
 * Parse ukuran halaman dari file DOCX
 * Membaca metadata dari word/document.xml
 * Menggunakan DOMParser native browser
 */
export async function getDocxPageSize(file: File | Blob): Promise<PageSize> {
  try {
    console.log('[getDocxPageSize] Loading ZIP...');
    const zip = await JSZip.loadAsync(file);
    console.log('[getDocxPageSize] ZIP loaded, finding document.xml...');
    
    const xmlFile = zip.file('word/document.xml');
    
    if (!xmlFile) {
      console.error('[getDocxPageSize] word/document.xml not found');
      throw new Error('File DOCX tidak valid: word/document.xml tidak ditemukan');
    }

    console.log('[getDocxPageSize] Reading XML content...');
    const xmlString = await xmlFile.async('string');
    console.log('[getDocxPageSize] XML loaded, size:', xmlString.length, 'bytes');
    
    // Parse XML menggunakan DOMParser (native browser)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    console.log('[getDocxPageSize] XML parsed');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      console.error('[getDocxPageSize] XML parse error:', parseError.textContent);
      throw new Error('Error parsing XML: ' + parseError.textContent);
    }

    // Find pgSz element (page size)
    // Path: w:document > w:body > w:sectPr > w:pgSz
    // atau w:document > w:body > w:p[last] > w:pPr > w:sectPr > w:pgSz
    
    console.log('[getDocxPageSize] Searching for pgSz element...');
    let pgSzElement = xmlDoc.querySelector('sectPr > pgSz');
    console.log('[getDocxPageSize] Try 1 (sectPr > pgSz):', pgSzElement ? 'found' : 'not found');
    
    // Try alternative path if not found
    if (!pgSzElement) {
      pgSzElement = xmlDoc.querySelector('pPr > sectPr > pgSz');
      console.log('[getDocxPageSize] Try 2 (pPr > sectPr > pgSz):', pgSzElement ? 'found' : 'not found');
    }
    
    // Try with namespace prefix
    if (!pgSzElement) {
      pgSzElement = xmlDoc.querySelector('[*|pgSz]');
      console.log('[getDocxPageSize] Try 3 ([*|pgSz]):', pgSzElement ? 'found' : 'not found');
    }
    
    if (!pgSzElement) {
      // Default ke A4 jika tidak ada page size
      console.warn('Page size tidak ditemukan, menggunakan A4 default');
      return {
        widthMm: 210,
        heightMm: 297,
        widthPx: mmToPx(210),
        heightPx: mmToPx(297),
        orientation: 'portrait',
        standardSize: 'A4',
      };
    }

    // Get attributes (w:w, w:h, w:orient)
    const widthAttr = pgSzElement.getAttribute('w:w') || pgSzElement.getAttribute('w');
    const heightAttr = pgSzElement.getAttribute('w:h') || pgSzElement.getAttribute('h');
    const orientAttr = pgSzElement.getAttribute('w:orient') || pgSzElement.getAttribute('orient');
    
    if (!widthAttr || !heightAttr) {
      throw new Error('Width atau height tidak ditemukan di pgSz element');
    }

    // Parse width dan height dari TWIPS
    let widthMm = twipsToMm(parseInt(widthAttr));
    let heightMm = twipsToMm(parseInt(heightAttr));
    
    // Check orientation
    const isLandscape = orientAttr === 'landscape';
    
    // Swap jika landscape
    if (isLandscape) {
      [widthMm, heightMm] = [heightMm, widthMm];
    }

    const widthPx = mmToPx(widthMm);
    const heightPx = mmToPx(heightMm);
    const orientation = isLandscape ? 'landscape' : 'portrait';
    const standardSize = detectStandardSize(widthMm, heightMm);

    return {
      widthMm,
      heightMm,
      widthPx,
      heightPx,
      orientation,
      standardSize,
    };
  } catch (error) {
    console.error('Error parsing DOCX page size:', error);
    
    // Fallback ke A4 portrait
    return {
      widthMm: 210,
      heightMm: 297,
      widthPx: mmToPx(210),
      heightPx: mmToPx(297),
      orientation: 'portrait',
      standardSize: 'A4',
    };
  }
}

/**
 * Format page size untuk display
 */
export function formatPageSize(pageSize: PageSize): string {
  if (pageSize.standardSize && pageSize.standardSize !== 'Custom') {
    return `${pageSize.standardSize} ${pageSize.orientation === 'landscape' ? 'Landscape' : 'Portrait'}`;
  }
  
  return `${Math.round(pageSize.widthMm)}mm × ${Math.round(pageSize.heightMm)}mm`;
}

