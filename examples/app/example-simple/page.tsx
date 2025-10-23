"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PDFPreview } from "../../../dist/index.mjs";
import {
  convertRemoteFileToPdf,
  converterEndpoint,
} from "../../lib/convertToPdf";

type PreviewMode = "pdf" | "word" | "presentation" | "spreadsheet";

const PDF_SAMPLE = "/sample.pdf";
const WORD_SAMPLE =
  "https://file-examples.com/wp-content/storage/2017/02/file-sample_100kB.docx";
const PPT_SAMPLE =
  "https://filesamples.com/samples/document/pptx/sample2.pptx";
const SHEET_SAMPLE =
  "https://filesamples.com/samples/document/xlsx/sample3.xlsx";

const INITIAL_URLS: Record<PreviewMode, string> = {
  pdf: PDF_SAMPLE,
  word: WORD_SAMPLE,
  presentation: PPT_SAMPLE,
  spreadsheet: SHEET_SAMPLE,
};

export default function ExampleSimplePage() {
  const [mode, setMode] = useState<PreviewMode>("pdf");
  const [urls, setUrls] = useState<Record<PreviewMode, string>>(INITIAL_URLS);
  const [inputValue, setInputValue] = useState<string>(INITIAL_URLS.pdf);
  const [previewSource, setPreviewSource] = useState<File | string>(
    INITIAL_URLS.pdf
  );
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  const convertedUrlRef = useRef<string | null>(null);

  const cleanupConvertedUrl = useCallback(() => {
    if (convertedUrlRef.current) {
      URL.revokeObjectURL(convertedUrlRef.current);
      convertedUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupConvertedUrl();
    };
  }, [cleanupConvertedUrl]);

  useEffect(() => {
    setInputValue(urls[mode]);
  }, [mode, urls]);

  useEffect(() => {
    setError(null);

    if (mode === "pdf") {
      cleanupConvertedUrl();
      setPreviewSource(urls.pdf);
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    setStatus("loading");
    cleanupConvertedUrl();

    convertRemoteFileToPdf(urls[mode], controller.signal)
      .then((url) => {
        convertedUrlRef.current = url;
        setPreviewSource(url);
        setStatus("idle");
      })
      .catch((err) => {
        if (controller.signal.aborted) {
          return;
        }
        cleanupConvertedUrl();
        setStatus("idle");
        setError(err instanceof Error ? err.message : "Konversi gagal.");
      });

    return () => {
      controller.abort();
    };
  }, [cleanupConvertedUrl, mode, urls]);

  const handleLoad = () => {
    const trimmed = inputValue.trim();
    setUrls((prev) => ({
      ...prev,
      [mode]: trimmed,
    }));
  };

  const setUrlForMode = useCallback(
    (targetMode: PreviewMode, value: string) => {
      setUrls((prev) => ({
        ...prev,
        [targetMode]: value,
      }));
      if (mode === targetMode) {
        setInputValue(value);
      }
    },
    [mode]
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm mb-2 inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Kembali ke Home
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Document Preview</h1>
            <p className="text-sm text-gray-600">
              Preview PDF langsung atau konversi Word/Excel/PPT → PDF dengan backend
            </p>
          </div>

          <div className="text-right">
            <div className="bg-gray-900 text-gray-100 px-4 py-2 rounded-lg text-xs font-mono inline-block">
              {"<PDFPreview file={source} />"}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setMode("pdf")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === "pdf"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📄 PDF
            </button>
            <button
              onClick={() => setMode("word")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === "word"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📝 Word → PDF
            </button>
            <button
              onClick={() => setMode("presentation")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === "presentation"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🎞️ PowerPoint → PDF
            </button>
            <button
              onClick={() => setMode("spreadsheet")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === "spreadsheet"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📊 Excel → PDF
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder={`Masukkan URL ${mode.toUpperCase()}...`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleLoad}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Load
            </button>
          </div>

          {mode === "pdf" ? (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setUrlForMode("pdf", PDF_SAMPLE)}
                className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
              >
                📄 Local PDF Sample
              </button>
              <button
                onClick={() =>
                  setUrlForMode(
                    "pdf",
                    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                  )
                }
                className="px-3 py-1 text-xs bg-blue-200 hover:bg-blue-300 rounded"
              >
                🌐 External PDF
              </button>
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setUrlForMode("word", WORD_SAMPLE)}
                className={`px-3 py-1 text-xs rounded ${
                  mode === "word"
                    ? "bg-purple-200 hover:bg-purple-300"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                📝 Word Sample
              </button>
              <button
                onClick={() => setUrlForMode("presentation", PPT_SAMPLE)}
                className={`px-3 py-1 text-xs rounded ${
                  mode === "presentation"
                    ? "bg-orange-200 hover:bg-orange-300"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                🎞️ PPT Sample
              </button>
              <button
                onClick={() => setUrlForMode("spreadsheet", SHEET_SAMPLE)}
                className={`px-3 py-1 text-xs rounded ${
                  mode === "spreadsheet"
                    ? "bg-green-200 hover:bg-green-300"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                📊 Excel Sample
              </button>
            </div>
          )}

          <div className="text-xs bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 text-lg">ℹ️</span>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-1">
                  Mode konversi membutuhkan converter-service
                </p>
                <p className="text-blue-700">
                  Aplikasi akan mengambil file sumber (Word/Excel/PPT), mengirim
                  ke <code>{converterEndpoint}</code> untuk konversi PDF, lalu
                  menampilkan hasilnya dengan PDFPreview.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {status === "loading" && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                Mengonversi dokumen ke PDF...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-red-600 max-w-md">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="font-semibold">Konversi gagal</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          </div>
        )}

        {!error && status === "idle" && (
          <PDFPreview
            file={previewSource}
            onPageChange={(page: number, total: number) => {
              console.log(`Current page: ${page}/${total}`);
            }}
            onError={(previewError: Error) => {
              console.error("PDF Error:", previewError);
              setError(previewError.message);
            }}
          />
        )}
      </div>

      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <details className="cursor-pointer">
          <summary className="font-semibold text-gray-700 hover:text-gray-900">
            📝 Lihat Kode Implementasi
          </summary>
          <div className="mt-4 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm font-mono">
{`const source = mode === "pdf"
  ? urls.pdf
  : await convertRemoteFileToPdf(urls[mode]);

return <PDFPreview file={source} />;`}
            </pre>
          </div>

          <div className="mt-3 bg-green-50 border border-green-200 p-3 rounded-lg">
            <p className="text-sm text-green-900">
              <strong>✨ Satu viewer untuk semuanya:</strong> Dokumen Office tidak lagi
              dirender di browser. Word, Excel, dan PowerPoint dikonversi dulu
              menjadi PDF di backend, kemudian di-preview menggunakan komponen
              PDFPreview.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
