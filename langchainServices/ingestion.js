import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import { loadDocument } from "./documentLoader.js";
import { addDocuments, deleteDocument } from "./embedding.js";
import { summarizeDocument } from "./summarizer.js";
import { logger } from "../utils/logger.js";
import { LLMError } from "../utils/error.js";


const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", ". ", " ", ""],
});

export async function ingestDocument(docId, filePath, originalName) {
  try {
    //Load raw pages/content from file
    const rawDocs = await loadDocument(filePath, originalName);
    logger.info(`Loaded ${rawDocs.length} page(s) from "${originalName}"`);

    //Split into chunks
    const chunks = await splitter.splitDocuments(rawDocs);
    logger.info(`Split into ${chunks.length} chunks`);
    console.log("chunks map : ", chunks);

    // Attach docId to every chunk's metadata so we can filter/delete later
    const enrichedChunks = chunks.map((chunk) => ({
      ...chunk,
      metadata: {
        docId: docId.toString(),
        pageIndex: chunk.metadata.pageIndex,
        filename: originalName,
      },
    }));

    //Embed + store in ChromaDB
    await addDocuments(docId, enrichedChunks);

    const fullText = rawDocs.map((d) => d.pageContent).join("\n\n");
    const { title, summary } = await summarizeDocument(fullText, originalName);

    logger.info(`Ingestion complete for docId=${docId}`);

    return {
      docId,
      filename: originalName,
      chunkCount: enrichedChunks.length,
      summary,
      title
    };
  } catch (err) {
    await deleteDocument(docId);
    throw new LLMError(`Ingestion failed: ${err.message}`);
  } finally {
    try {
      await fs.unlink(filePath);
    } catch (e) {
      logger.error(`Failed to delete temp file ${filePath}: ${e.message}`, { stack: e.stack });
    }
  }
}