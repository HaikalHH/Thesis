const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const DEFAULT_CONVERTER_URL = (process.env.NEXT_PUBLIC_CONVERTER_URL ??
  "http://localhost:3001") as string;

export const converterBaseUrl = DEFAULT_CONVERTER_URL.replace(/\/$/, "");

export const converterEndpoint = `${converterBaseUrl}/convert`;

export async function convertDocxFileToPdf(
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

export async function convertDocxUrlToPdf(
  docxUrl: string,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch(docxUrl, { signal });

  if (!response.ok) {
    throw new Error(
      `Gagal mengambil file DOCX (${response.status} ${response.statusText})`
    );
  }

  const blob = await response.blob();
  const filename =
    docxUrl.split("/").pop() ?? `document-${Date.now().toString(16)}.docx`;

  const file = new File([blob], filename, { type: DOCX_MIME });
  return convertDocxFileToPdf(file, signal);
}
