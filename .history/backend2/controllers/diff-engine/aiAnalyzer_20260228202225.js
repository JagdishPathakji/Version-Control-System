import { ChatOllama } from "@langchain/ollama";

const llm = new ChatOllama({
    model: "gpt-oss:120b-cloud",
    baseUrl: "https://ollama.com",
    apiKey: "",
    temperature: 0,
});

const prompt = `
        You are a precise and factual AI assistant.

        Your task is to answer the user's question using ONLY the information provided in the context below.

        STRICT RULES:
        1. Do NOT use any outside knowledge.
        2. Do NOT make assumptions.
        3. If the answer is not clearly present in the context, say:
        "The answer is not available in the provided context."
        4. Do NOT fabricate information.
        5. Keep the answer concise and directly supported by the context.

        ---------------------
        CONTEXT:
        ${context}
        ---------------------

        QUESTION:
        ${state.query}

        FINAL ANSWER:
    `;

    const response = await llm.invoke(prompt);
    
