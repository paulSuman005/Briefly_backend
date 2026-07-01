import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { loadSummarizationChain } from "@langchain/classic/chains";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PromptTemplate } from "@langchain/core/prompts";
import { getSummaryPromptForSmallContent, SUMMARY_SYSTEM_PROMPT_LARGE_CONTENT } from "../utils/variable.js";
import AppError, { LLMError } from "../utils/error.js";
import { logger } from "../utils/logger.js";

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: process.env.GOOGLE_SUMMARIZER_MODEL,
  temperature: 0.1,
  maxOutputTokens: 2048,
});

const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });

function extractJSON(text) {
  let cleaned = text.trim();
  const match = cleaned.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
  if (match) cleaned = match[1].trim();
  return JSON.parse(cleaned);
}

export async function summarizeDocument(fullText, filename) {
  logger.info(`Summarizing "${filename}" (${fullText.length} chars)`);
  try {
    if (fullText.length < 4000) {
      const response = await llm.invoke(getSummaryPromptForSmallContent(fullText));
      const result = extractJSON(response.content);
      return { title: result.title, summary: result.summary };
    }
    console.log("large documents")

    const chunks = await splitter.createDocuments([fullText]);

    const combinePrompt = new PromptTemplate(SUMMARY_SYSTEM_PROMPT_LARGE_CONTENT);

    const chain = loadSummarizationChain(llm, {
      type: "map_reduce",
      combinePrompt,     
      verbose: false,
    });

    const result = await chain.invoke({ input_documents: chunks });
    console.log("result without extract json : ", result);
    const parsed = extractJSON(result.text);
    console.log("result after extract json : ", parsed);
    return { title: parsed.title, summary: parsed.summary };

  } catch (err) {
    console.log("summarize error : ", err);
    throw new LLMError(`Summarisation failed: ${err.message}`);
  }
}