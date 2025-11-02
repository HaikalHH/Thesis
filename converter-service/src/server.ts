import express from "express";
import multer from "multer";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import { execFile } from "child_process";
import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";
import * as XLSX from "xlsx";

const app = express();

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const corsOptions: CorsOptions = {
  origin: (_origin, callback) => {
    callback(null, true);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept"],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const ALLOWED_EXTENSIONS = new Set([
  ".doc",
  ".docx",
  ".odt",
  ".rtf",
  ".ppt",
  ".pptx",
  ".odp",
  ".xls",
  ".xlsx",
  ".ods",
  ".txt",
  ".pdf",
]);

const XLSX_NORMALIZE_EXTENSIONS = new Set([".xls", ".xlsx"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

async function ensureTmpDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function buildFilterArg(
  filterName: string,
  filterOptions?: Record<string, boolean | number | string>
) {
  if (!filterOptions || Object.keys(filterOptions).length === 0) {
    return `pdf:${filterName}`;
  }

  const serialized = Object.entries(filterOptions)
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `'${key}':'${value}'`;
      }
      return `'${key}':${value}`;
    })
    .join(",");

  return `pdf:${filterName}:FilterData={${serialized}}`;
}

function writeXlsx(
  workbook: XLSX.WorkBook,
  bookType: "xlsx" | "xls" = "xlsx"
): Buffer {
  const output = XLSX.write(workbook, { type: "buffer", bookType });
  return Buffer.isBuffer(output) ? output : Buffer.from(output);
}

function guessMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".bmp":
      return "image/bmp";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

async function convertSheetToHtml(filePath: string, outDir: string) {
  await ensureTmpDir(outDir);

  const filters = [
    "html:calc_html_Web:FilterData={'HTMLWysiwygMode':true,'UseLosslessCompression':true,'ExportNotes':false}",
    "html:XHTML Calc File",
  ];

  let lastError: unknown;
  for (const filter of filters) {
    try {
      return await runHtmlExport(filter, filePath, outDir);
    } catch (error) {
      lastError = error;
      console.warn("[convert-excel] html export failed:", filter, error);
    }
  }

  if (lastError instanceof Error) throw lastError;
  throw new Error("Converted HTML not found");
}

async function runHtmlExport(
  filter: string,
  filePath: string,
  outDir: string
): Promise<string> {
  const profileDir = path.join(
    "/tmp",
    "converter-service",
    "lo-profile",
    crypto.randomUUID()
  );
  await ensureTmpDir(profileDir);

  try {
    const profileUri = `file://${profileDir.replace(/\\/g, "/")}`;
    const args = [
      `-env:UserInstallation=${profileUri}`,
      "--headless",
      "--nologo",
      "--nofirststartwizard",
      "--nolockcheck",
      "--convert-to",
      filter,
      filePath,
      "--outdir",
      outDir,
    ];

    const env = {
      ...process.env,
      SAL_USE_VCLPLUGIN: "svp",
      SAL_DISABLE_CATCH_SIGNALS: "1",
      LC_ALL: "en_US.UTF-8",
      LANG: "en_US.UTF-8",
    };

    const existing = await fs.readdir(outDir).catch(() => []);
    await Promise.all(
      existing
        .filter((entry) => entry.toLowerCase().endsWith(".html"))
        .map((entry) =>
          fs.rm(path.join(outDir, entry), { force: true }).catch(() => {})
        )
    );

    await new Promise<void>((resolve, reject) => {
      const proc = execFile(
        "soffice",
        args,
        { env, timeout: 90_000 },
        (error) => (error ? reject(error) : resolve())
      );

      proc.stderr?.on("data", (data) =>
        console.warn("[LibreOffice HTML]", data.toString())
      );
    });

    const entries = await fs.readdir(outDir);
    const htmlName = entries.find((entry) =>
      entry.toLowerCase().endsWith(".html")
    );
    if (!htmlName) {
      throw new Error("Converted HTML not found");
    }

    const htmlPath = path.join(outDir, htmlName);
    const html = await fs.readFile(htmlPath, "utf-8");

    const assetRegex = /src="([^"]+)"/gi;
    const normalizedOutDir = path.resolve(outDir);
    const seen = new Set<string>();
    let transformed = html;

    for (const match of html.matchAll(assetRegex)) {
      const src = match[1];
      if (!src || /^(data:|https?:|file:|\/\/)/i.test(src)) {
        continue;
      }
      if (seen.has(src)) continue;
      seen.add(src);

      const assetPath = path.resolve(normalizedOutDir, src);
      if (!assetPath.startsWith(normalizedOutDir)) {
        continue;
      }

      try {
        const asset = await fs.readFile(assetPath);
        const mime = guessMimeType(assetPath);
        const dataUri = `data:${mime};base64,${asset.toString("base64")}`;
        const escapedSrc = src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const pattern = new RegExp(`src="${escapedSrc}"`, "g");
        transformed = transformed.replace(pattern, `src="${dataUri}"`);
      } catch {
        // ignore missing asset
      }
    }

    return transformed;
  } finally {
    await fs.rm(profileDir, { recursive: true, force: true }).catch(() => {});
  }
}

function runSoffice(inputPath: string, outDir: string) {
  const ext = path.extname(inputPath).toLowerCase();

  // determine document types by extension
  const isExcel = [".xls", ".xlsx", ".ods"].includes(ext);
  const isWord = [".doc", ".docx", ".odt"].includes(ext);
  const isPowerPoint = [".ppt", ".pptx", ".odp"].includes(ext);

  // default to writer filter unless more specific type is detected
  let filterName = "writer_pdf_Export";
  let filterOptions: Record<string, boolean | number | string> | undefined;
  if (isExcel) {
    filterName = "calc_pdf_Export";
    filterOptions = {
      SinglePageSheets: true,
      UseLosslessCompression: true,
      ReduceImageResolution: false,
      SelectionOnly: false,
      ExportNotes: false,
      ScaleToPagesX: 1,
      ScaleToPagesY: 1,
    };
  } else if (isPowerPoint) {
    filterName = "impress_pdf_Export";
    filterOptions = {
      ExportNotesPages: false,
      ExportOnlySelectedSlides: false,
      UseLosslessCompression: true,
    };
  } else if (isWord) {
    filterOptions = {
      UseLosslessCompression: true,
      ReduceImageResolution: false,
    };
  }

  const filterArg = buildFilterArg(filterName, filterOptions);

  const args = [
    "--headless",
    "--nologo",
    "--nofirststartwizard",
    "--convert-to",
    filterArg,
    inputPath,
    "--outdir",
    outDir,
  ];

  return new Promise<void>((resolve, reject) => {
    const proc = execFile("soffice", args, { timeout: 90_000 }, (err) => {
      if (err) reject(err);
      else resolve();
    });

    proc.stderr?.on("data", (data) =>
      console.warn("[LibreOffice]", data.toString())
    );
  });
}

function normalizeExcelBuffer(buffer: Buffer, extension: string) {
  if (!XLSX_NORMALIZE_EXTENSIONS.has(extension)) {
    return buffer;
  }

  const bookType: "xls" | "xlsx" = extension === ".xls" ? "xls" : "xlsx";
  const workbook = XLSX.read(buffer, { type: "buffer" });

  if (workbook.Workbook && Array.isArray(workbook.Workbook.Names)) {
    workbook.Workbook.Names = workbook.Workbook.Names.filter((defined) => {
      const name = defined?.Name;
      if (!name) return true;
      const normalized = name.toLowerCase();
      return (
        !normalized.includes("print_area") && !normalized.includes("print_titles")
      );
    });
  }

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const pageSetup = { ...(sheet["!pageSetup"] ?? {}) };
    delete pageSetup.scale;
    delete pageSetup.scaleX;
    delete pageSetup.scaleY;
    pageSetup.fitToWidth = 1;
    pageSetup.fitToHeight = 1;
    pageSetup.orientation = "landscape";
    sheet["!pageSetup"] = pageSetup;

    if ("!printHeader" in sheet) delete sheet["!printHeader"];
    if ("!printFooter" in sheet) delete sheet["!printFooter"];
    if ("!printRanges" in sheet) delete sheet["!printRanges"];
    if ("!margins" in sheet) delete sheet["!margins"];
  }

  return writeXlsx(workbook, bookType);
}

type CacheEntry = {
  buffer: Buffer;
  createdAt: number;
};

const conversionCache = new Map<string, CacheEntry>();
const MAX_CACHE_ITEMS = 20;

function remember(hash: string, buffer: Buffer) {
  if (conversionCache.size >= MAX_CACHE_ITEMS) {
    let lruKey: string | undefined;
    let oldest = Number.POSITIVE_INFINITY;
    for (const [key, entry] of conversionCache.entries()) {
      if (entry.createdAt < oldest) {
        oldest = entry.createdAt;
        lruKey = key;
      }
    }
    if (lruKey) {
      conversionCache.delete(lruKey);
    }
  }

  conversionCache.set(hash, {
    buffer,
    createdAt: Date.now(),
  });
}

async function resolvePdfPath(
  directory: string,
  originalname: string
): Promise<string> {
  const expected = path.join(directory, `${path.parse(originalname).name}.pdf`);
  try {
    await fs.access(expected);
    return expected;
  } catch {
    // ignore and attempt to discover any PDF in folder
  }

  const entries = await fs.readdir(directory);
  const pdfFile = entries.find((entry) => entry.toLowerCase().endsWith(".pdf"));

  if (!pdfFile) {
    throw new Error("Converted PDF not found");
  }

  return path.join(directory, pdfFile);
}

app.post("/convert-excel", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).send("No file uploaded");
    return;
  }

  const extension = path.extname(req.file.originalname || "").toLowerCase();
  if (!XLSX_NORMALIZE_EXTENSIONS.has(extension)) {
    res
      .status(400)
      .send("Unsupported file type. Please upload an Excel file (.xls, .xlsx).");
    return;
  }

  const jobId = crypto.randomUUID();
  const tmpDir = path.join("/tmp", "converter-service", "excel", jobId);

  try {
    await ensureTmpDir(tmpDir);

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetNames = workbook.SheetNames ?? [];

    if (sheetNames.length === 0) {
      res.status(400).send("Workbook does not contain any sheets.");
      return;
    }

    const results: Record<string, string> = {};
    const bookType: "xls" | "xlsx" = extension === ".xls" ? "xls" : "xlsx";

    for (const [index, sheetName] of sheetNames.entries()) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;

      const displayName =
        sheetName && sheetName.trim().length > 0
          ? sheetName
          : `Sheet ${index + 1}`;

      let resultKey = displayName;
      let suffix = 2;
      while (Object.prototype.hasOwnProperty.call(results, resultKey)) {
        resultKey = `${displayName} (${suffix})`;
        suffix += 1;
      }

      const sheetDir = path.join(tmpDir, `sheet-${index + 1}`);
      await ensureTmpDir(sheetDir);

      const singleBook: XLSX.WorkBook = {
        SheetNames: [sheetName],
        Sheets: { [sheetName]: sheet },
      } as XLSX.WorkBook;

      singleBook.Workbook = {
        Sheets: [{ name: sheetName }],
      };

      const inputFile = path.join(
        sheetDir,
        `input.${bookType === "xls" ? "xls" : "xlsx"}`
      );

      const sheetBuffer = writeXlsx(singleBook, bookType);
      await fs.writeFile(inputFile, sheetBuffer);

      const html = await convertSheetToHtml(inputFile, sheetDir);
      results[resultKey] = html;
    }

    res.json({ sheets: results });
  } catch (error) {
    console.error("[convert-excel] failed:", error);
    const message =
      error instanceof Error ? error.message : "Unknown conversion error";
    res
      .status(500)
      .json({ error: `Convert Excel failed: ${message}` });
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
});

app.post("/convert", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).send("No file provided");
    return;
  }

  const { buffer, originalname } = req.file;
  const extension = path.extname(originalname || "").toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    res
      .status(400)
      .send("Unsupported file type. Please upload a document, spreadsheet, or presentation.");
    return;
  }

  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  const cached = conversionCache.get(hash);

  if (cached) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${path.parse(originalname).name}.pdf"`
    );
    res.send(cached.buffer);
    return;
  }

  const jobId = crypto.randomUUID();
  const tmpDir = path.join("/tmp", "converter-service", jobId);
  const inputPath = path.join(tmpDir, originalname);

  try {
    await ensureTmpDir(tmpDir);
    let workingBuffer = buffer;

    if (XLSX_NORMALIZE_EXTENSIONS.has(extension)) {
      try {
        workingBuffer = normalizeExcelBuffer(buffer, extension);
      } catch (excelError) {
        console.warn("[convert] excel normalization skipped:", excelError);
      }
    }

    await fs.writeFile(inputPath, workingBuffer);

    await runSoffice(inputPath, tmpDir);

    const pdfPath = await resolvePdfPath(tmpDir, originalname);
    const pdfBuffer = await fs.readFile(pdfPath);

    remember(hash, pdfBuffer);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${path.basename(pdfPath)}"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("[convert] failed:", error);
    const message =
      error instanceof Error ? error.message : "Unknown conversion error";
    res.status(500).send(`Convert failed: ${message}`);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
});

const PORT = Number(process.env.PORT ?? 3001);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Converter running on :${PORT}`);
});
