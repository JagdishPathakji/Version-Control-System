import { ChatOllama } from "@langchain/ollama";

async function aiAnalyzer({ filePath, leftContent, rightContent, mode }) {

    const llm = new ChatOllama({
        model: "gpt-oss:120b-cloud",
        baseUrl: "https://ollama.com",
        apiKey: "31dbc890aff540ac8fe835a4bdf7853b.Y7yR3jLgZ5CQu5WlqQOanCp0",
        temperature: 0,
    });

    const prompt = ``;

    const response = await llm.invoke(prompt);
    return response.content
}



