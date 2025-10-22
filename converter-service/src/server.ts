import express from "express";
import multer from "multer";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import { execFile } from "child_process";
import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";

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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

async function ensureTmpDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function runSoffice(inputPath: string, outputDir: string) {
  return new Promise<void>((resolve, reject) => {
    execFile(
      "soffice",
      [
        "--headless",
        "--nologo",
        "--nofirststartwizard",
        "--convert-to",
        "pdf:writer_pdf_Export",
        inputPath,
        "--outdir",
        outputDir,
      ],
      { timeout: 60_000 },
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      }
    );
  });
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

app.post("/convert", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).send("No file provided");
    return;
  }

  const { buffer, originalname } = req.file;
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
    await fs.writeFile(inputPath, buffer);

    await runSoffice(inputPath, tmpDir);

    const pdfPath = path.join(tmpDir, `${path.parse(originalname).name}.pdf`);
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
