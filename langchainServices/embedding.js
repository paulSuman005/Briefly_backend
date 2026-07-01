import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import chromaClient from "../config/ChromaConfig.js";
import { logger } from "../utils/logger.js";
import { VectorStoreError } from "../utils/error.js";

const COLLECTION_NAME = process.env.CHROMA_COLLECTION || "Briefly";
const GEMINI_MAX_CHARS = 8000;

let embeddings = null;
let collection = null;

function getEmbeddings() {
  if (!embeddings) {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("Missing GOOGLE_API_KEY");
    }
    embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: "gemini-embedding-001",
    });
    logger.info("Gemini embeddings initialized");
  }
  return embeddings;
}

async function getCollection() {
  if (collection) return collection;

  collection = await chromaClient.getOrCreateCollection({ 
    name: COLLECTION_NAME 
  });
  
  logger.info(`Chroma collection "${COLLECTION_NAME}" ready`);
  return collection;
}

function sanitiseChunks(chunks) {
  return chunks
    .map((chunk) => {
      let text = (chunk.pageContent ?? "")
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+/g, " ")
        .trim();
      if (text.length > GEMINI_MAX_CHARS) {
        logger.warn(`Chunk truncated ${text.length} -> ${GEMINI_MAX_CHARS}`);
        text = text.slice(0, GEMINI_MAX_CHARS);
      }
      return { ...chunk, pageContent: text };
    })
    .filter((chunk) => chunk.pageContent.length > 0);
}

function assertEmbeddingsValid(vectors) {
  const invalid = vectors.some((v) => !Array.isArray(v) || v.length === 0);
  if (invalid) {
    throw new Error("Gemini returned empty embeddings");
  }
}

export async function addDocuments(docId, chunks) {
  try {
    const clean = sanitiseChunks(chunks);
    if (clean.length === 0) {
      throw new Error("No valid chunks found");
    }

    logger.info(`Embedding ${clean.length} chunks`);

    const texts = clean.map((c) => c.pageContent);
    const emb = getEmbeddings();
    const vectors = await emb.embedDocuments(texts);
    assertEmbeddingsValid(vectors);

    const col = await getCollection();
    const ids = clean.map((_, i) => `${docId}_chunks_${i}`);
    const metadatas = clean.map((c) => c.metadata ?? {});

    await col.add({
      ids,
      embeddings: vectors,
      documents: texts,
      metadatas,
    });

    logger.info(`Added ${ids.length} vectors to Chroma`);
    return ids;
  } catch (err) {
    throw new VectorStoreError(`Failed to add documents: ${err.message}`);
  }
}

export async function similaritySearch(query, k, filter) {
  try {
    const emb = getEmbeddings();
    const queryEmbedding = await emb.embedQuery(query);

    const col = await getCollection();
    const result = await col.query({
      queryEmbeddings: [queryEmbedding],
      nResults: k,
      where: filter,
    });

    return result.documents[0].map((text, i) => ({
      pageContent: text,
      metadata: result.metadatas[0][i] || {},
      id: result.ids[0][i],
    }));
  } catch (err) {
    throw new VectorStoreError(`Similarity search failed: ${err.message}`);
  }
}

export async function deleteDocument(docId) {
  try {
    const col = await getCollection();
    await col.delete({
      where: { docId: {  $eq: docId.toString() } },
    });
    logger.info(`Deleted all chunks for docId=${docId}`);
  } catch (err) {
    throw new VectorStoreError(`Delete failed: ${err.message}`);
  }
}
