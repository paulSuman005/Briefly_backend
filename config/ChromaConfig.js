import "dotenv/config";
import { CloudClient } from "chromadb";
import { logger } from "../utils/logger.js";

const { CHROMA_API_KEY, CHROMA_TENANT, CHROMA_DB } = process.env;

if (!CHROMA_API_KEY || !CHROMA_TENANT || !CHROMA_DB) {
  throw new Error(
    "Missing Chroma Cloud config. Required env vars: CHROMA_API_KEY, CHROMA_TENANT, CHROMA_DB"
  );
}

const chromaClient = new CloudClient({
  apiKey:   CHROMA_API_KEY,
  tenant:   CHROMA_TENANT,
  database: CHROMA_DB,
});

logger.info(`Chroma Cloud client ready — db: ${CHROMA_DB}, tenant: ${CHROMA_TENANT}`);

export default chromaClient;