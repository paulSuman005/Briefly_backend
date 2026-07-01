import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { logger } from "../utils/logger.js";
import { LLMError, ValidationError } from "../utils/error.js";
import { ragTopK, SYSTEM_PROMPT } from "../utils/variable.js";
import { similaritySearch } from "./embedding.js";

// Initialize the Gemini llm
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: process.env.GOOGLE_QNA_MODEL,
  temperature: 0.2,
  maxOutputTokens: 1000,
});


const prompt = ChatPromptTemplate.fromMessages([
  ["system", SYSTEM_PROMPT],
  ["human", "{input}"],
]);


export async function answerQuestion(question, docId) {

  const startTime = Date.now();

  if (!question?.trim()) {
    throw new ValidationError("Question cannot be empty");
  }

  const filter = { docId: docId };
  logger.info(`Q&A — question: "${question.slice(0, 80)}…" | docId: ${docId ?? "all"}`);

  try {
    // This fetches relevant text chunks from the vector database.
    const retrievedChunks = await similaritySearch(question, ragTopK, filter);
    console.log("retrieved chunks : ", retrievedChunks);

    if (retrievedChunks.length === 0) {
      return {
        answer: "No relevant content found in the document(s) for your question.",
      };
    }

    // format the context for the llm
    const formattedContext = retrievedChunks.map((chunk) => chunk.pageContent).join("\n\n---\n\n");
    console.log("formated context : ", formattedContext);

    // inject the context into the prompt
    const filledMessages = await prompt.formatMessages({
      context: formattedContext,
      input: question,
    });
    console.log("filled messages : ", filledMessages);

    const response = await llm.invoke(filledMessages);
    console.log("resposne : ", response);

    const timeTaken = Date.now() - startTime;

    return {
      answer: response.content,
      latencyMs: timeTaken
    };

  } catch (err) {
    if (err instanceof ValidationError) throw err;
    throw new LLMError(`Q&A failed: ${err.message}`);
  }
}