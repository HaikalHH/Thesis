"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FileUpload, PDFPreview } from "../../../dist/index.mjs";
import {
  converterEndpoint,
  convertDocxFileToPdf,
} from "../../lib/convertDocxToPdf";

type FileType = "pdf" | "docx" | null;

export default function ExampleUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewSource, setPreviewSource] = useState<File | string | null>(null);
  const [status, setStatus] = useState<"idle" | "converting">("idle");
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

  const fileType: FileType = useMemo(() => {
    if (!selectedFile) {
      return null;
    }

    if (selectedFile.type === "application/pdf") {
      return "pdf";
    }

    if (
      selectedFile.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return "docx";
    }

    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") {
      return "pdf";
    }
    if (ext === "docx") {
      return "docx";
    }

    return null;
  }, [selectedFile]);

  useEffect(() => {
    if (!selectedFile) {
      cleanupConvertedUrl();
      setPreviewSource(null);
      setStatus("idle");
      setError(null);
      return;
    }

    setError(null);

    if (fileType === "pdf") {
      cleanupConvertedUrl();
      setPreviewSource(selectedFile);
      setStatus("idle");
      return;
    }

    if (fileType !== "docx") {
      cleanupConvertedUrl();
      setPreviewSource(null);
      setStatus("idle");
      setError("Format tidak didukung. Gunakan PDF atau DOCX.");
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    cleanupConvertedUrl();
    setStatus("converting");
    setPreviewSource(null);

    convertDocxFileToPdf(selectedFile, controller.signal)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
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
        setError(
          err instanceof Error ? err.message : "Gagal mengonversi file DOCX."
        );
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [cleanupConvertedUrl, fileType, selectedFile]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center gap-2"
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
              Kembali
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Document Upload & Preview
              </h1>
              <p className="text-xs text-gray-600">
                Upload PDF atau DOCX, konversi otomatis ke PDF dan tampilkan di
                viewer
              </p>
            </div>
          </div>

          <div className="bg-gray-900 text-gray-100 px-3 py-1.5 rounded text-xs font-mono">
            {"<FileUpload /> + <PDFPreview />"}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
          <FileUpload
            onFileSelect={setSelectedFile}
            accept=".pdf,.docx"
            maxSizeMB={25}
            showFileList={true}
          />
          <div className="px-4 py-3 border-t border-gray-200 text-xs text-gray-500">
            <p>{`Service converter: ${converterEndpoint}`}</p>
            <p className="mt-1">
              Pastikan service berjalan (`pnpm dev` di converter-service atau
              Docker container).
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {status === "converting" && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  Mengonversi DOCX ke PDF...
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Proses ini dapat memakan waktu hingga 1 menit untuk file besar.
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
                <p className="font-semibold">Gagal memuat dokumen</p>
                <p className="text-sm mt-2">{error}</p>
              </div>
            </div>
          )}

          {!selectedFile && status === "idle" && !error && (
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

          {previewSource && !error && status === "idle" && (
            <PDFPreview
              file={previewSource}
              onPageChange={(page: number, total: number) => {
                console.log(`Page ${page}/${total}`);
              }}
              onError={(previewError: Error) => {
                console.error("PDF Error:", previewError);
                setError(previewError.message);
              }}
            />
          )}
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <details className="cursor-pointer">
          <summary className="font-semibold text-sm text-gray-700 hover:text-gray-900">
            💻 Lihat Kode Implementasi (Convert DOCX → PDF)
          </summary>
          <div className="mt-3 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-xs font-mono">
{`async function convertDocxToPdf(file: File) {
  const form = new FormData();
  form.append("file", file);
  const resp = await fetch(process.env.NEXT_PUBLIC_CONVERTER_URL + "/convert", {
    method: "POST",
    body: form,
  });
  if (!resp.ok) throw new Error("Convert failed");
  const blob = await resp.blob();
  return URL.createObjectURL(blob);
}

// Di komponen:
const fileType = getFileType(file);
if (fileType === "pdf") {
  setPreviewSource(file);
} else if (fileType === "docx") {
  setStatus("converting");
  const url = await convertDocxToPdf(file);
  setPreviewSource(url); // kirim ke <PDFPreview file={url} />
}`}
            </pre>
          </div>

          <div className="mt-3 bg-green-50 border border-green-200 p-3 rounded-lg">
            <p className="text-sm text-green-900">
              <strong>💡 Flow baru:</strong> Semua DOCX dikonversi ke PDF
              server-side melalui converter-service sebelum dipreview. Viewer di
              frontend sekarang cukup menggunakan komponen PDFPreview.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
