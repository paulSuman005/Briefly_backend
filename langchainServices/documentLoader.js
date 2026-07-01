import fs from "fs/promises";
import path from "path";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { logger } from "../utils/logger.js";
import { UnsupportedFileError } from "../utils/error.js";

const LOADER_MAP = {
  ".pdf":  (fp) => new PDFLoader(fp, { splitPages: true }),
  ".docx": (fp) => new DocxLoader(fp),
  ".doc":  (fp) => new DocxLoader(fp),
  ".txt":  (fp) => new TextLoader(fp),
};


export async function loadDocument(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const loaderFactory = LOADER_MAP[ext];

  if (!loaderFactory) {
    throw new UnsupportedFileError(ext || "unknown");
  }

  // Verify file is accessible before loading
  await fs.access(filePath).catch(() => {
    throw new Error(`File not accessible at path: ${filePath}`);
  });

  logger.info(`Loading document: ${originalName} (${ext})`);

  const loader = loaderFactory(filePath);
  const docs = await loader.load();

  // Enrich every page/chunk with source metadata
  return docs.map((doc, idx) => ({
    ...doc,
    metadata: {
      ...doc.metadata,
      source: originalName,
      pageIndex: doc.metadata.loc?.pageNumber ?? idx,
    },
  }));
}