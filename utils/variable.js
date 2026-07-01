export const emailVerifyOTPExpiry = 15 * 60 * 1000;

export const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword',   
    'text/plain',            
];

export const ragTopK = 3;

export const SYSTEM_PROMPT = `You are a helpful assistant that answers questions based ONLY on the provided document context.
Rules:
- Answer using only the information in the context below.
- If the answer is not in the context, say: "I couldn't find that in the document."
- Be concise and factual. Do not hallucinate.
- Quote relevant sections when helpful.

Context:
{context}`;

export const getSummaryPromptForSmallContent = (fullText) => {
    return [
        {
            role: "system",
            content:
                "You are a concise summariser. Output a JSON object with exactly two fields: " +
                '"title" (a short, descriptive title) and "summary" (a one‑paragraph summary). ' +
                "Respond with ONLY valid JSON, nothing else.",
        },
        { role: "user", content: `Document:\n\n${fullText}` },
    ]
}

export const SUMMARY_SYSTEM_PROMPT_LARGE_CONTENT = {
    template: `
        You are given a set of partial summaries from a longer document.
        Combine them into a concise overall summary and invent a short, descriptive title for it.
        Return ONLY a valid JSON object with the keys "title" and "summary".
        Do not include any other text.

        Partial summaries:
        {text}

        JSON:
        `,
    inputVariables: ["text"],
}