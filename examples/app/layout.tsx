import type { Metadata } from "next";
import "./globals.css";
import "./docx-preview.css";

export const metadata: Metadata = {
  title: "React PDF Viewer - Next.js Library",
  description: "Library React TypeScript untuk preview file PDF di Next.js menggunakan PDF.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

