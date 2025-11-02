"use client";

import { useEffect, useMemo, useState } from "react";

interface ExcelTabsPreviewProps {
  sheets: Record<string, string>;
}

export default function ExcelTabsPreview({ sheets }: ExcelTabsPreviewProps) {
  const sheetNames = useMemo(() => Object.keys(sheets), [sheets]);
  const [active, setActive] = useState<string>(() => sheetNames[0] ?? "");

  useEffect(() => {
    if (sheetNames.length === 0) {
      setActive("");
      return;
    }

    if (!sheetNames.includes(active)) {
      setActive(sheetNames[0]);
    }
  }, [active, sheetNames]);

  if (sheetNames.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        Tidak ada sheet yang ditemukan.
      </div>
    );
  }

  const activeKey = sheets[active] ? active : sheetNames[0];
  const activeHtml = sheets[activeKey] ?? "";

  return (
    <>
      <div className="flex flex-col w-full h-full bg-white">
        <div className="flex gap-2 border-b border-gray-300 bg-gray-100 p-2 overflow-x-auto">
          {sheetNames.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setActive(name)}
              className={`px-4 py-1 rounded-t-lg text-sm whitespace-nowrap transition-colors ${
                activeKey === name
                  ? "bg-white text-gray-900 border border-b-0 border-gray-300"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300 border border-transparent"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <div
          className="flex-1 overflow-auto border border-gray-300 border-t-0 p-6 bg-[repeating-linear-gradient(0deg,#f8f8f8,#f8f8f8_24px,#ffffff_24px,#ffffff_48px)]"
          dangerouslySetInnerHTML={{ __html: activeHtml }}
        />
      </div>

      <style jsx global>{`
        table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 1rem;
        }
        td,
        th {
          border: 1px solid #ccc;
          padding: 4px 8px;
        }
        th {
          background-color: #f3f3f3;
          font-weight: bold;
        }
        tr:nth-child(even) td {
          background-color: #fafafa;
        }
        body,
        td,
        th {
          color: #333;
          font-family: Arial, sans-serif;
          font-size: 14px;
        }
      `}</style>
    </>
  );
}
