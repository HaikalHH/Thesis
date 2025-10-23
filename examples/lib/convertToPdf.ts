const DEFAULT_CONVERTER_URL = (process.env.NEXT_PUBLIC_CONVERTER_URL ??
  "http://localhost:3001") as string;

export const converterBaseUrl = DEFAULT_CONVERTER_URL.replace(/\/$/, "");

export const converterEndpoint = `${converterBaseUrl}/convert`;

const CONVERTIBLE_MIME_TYPES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.presentation",
  "application/vnd.oasis.opendocument.spreadsheet",
  "text/plain",
]);

const CONVERTIBLE_EXTENSIONS = new Set([
  "doc",
  "docx",
  "odt",
  "rtf",
  "ppt",
  "pptx",
  "odp",
  "xls",
  "xlsx",
  "ods",
  "txt",
]);

export function isConvertibleFile(file: File): boolean {
  if (!file) return false;
  if (file.type && CONVERTIBLE_MIME_TYPES.has(file.type)) {
    return true;
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  return !!ext && CONVERTIBLE_EXTENSIONS.has(ext);
}

export function isPdfFile(file: File): boolean {
  if (!file) return false;
  if (file.type === "application/pdf") return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "pdf";
}

export async function convertFileToPdf(
  file: File,
  signal?: AbortSignal
): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(converterEndpoint, {
    method: "POST",
    body: form,
    signal,
  });

  if (!response.ok) {
    throw new Error(`Convert failed: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

function inferFilename(url: string, fallbackExt: string): string {
  const sanitized = url.split(/[?#]/)[0];
  const rawName = sanitized.split("/").pop();
  if (rawName && rawName.includes(".")) {
    return rawName;
  }
  return `document-${Date.now().toString(16)}.${fallbackExt}`;
}

export async function convertRemoteFileToPdf(
  sourceUrl: string,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch(sourceUrl, { signal });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch source file (${response.status} ${response.statusText})`
    );
  }

  const blob = await response.blob();
  const ext =
    sourceUrl.split(".").pop()?.toLowerCase() ??
    (blob.type === "application/pdf" ? "pdf" : "docx");

  const filename = inferFilename(sourceUrl, ext);
  const file = new File([blob], filename, { type: blob.type || "" });
  return convertFileToPdf(file, signal);
}
