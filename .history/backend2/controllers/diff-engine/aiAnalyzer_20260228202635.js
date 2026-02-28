const { ChatOllama } = require("@langchain/ollama");

async function aiAnalyzer({ filePath="", leftContent="", rightContent="", mode=""}) {

    const llm = new ChatOllama({
        model: "gpt-oss:120b-cloud",
        baseUrl: "https://ollama.com",
        apiKey: "31dbc890aff540ac8fe835a4bdf7853b.Y7yR3jLgZ5CQu5WlqQOanCp0",
        temperature: 0,
    });

    const prompt = `
    You are a code reviewer. Analyze the changes in the file "${filePath}".
    Diff mode: ${mode}

    OLD CONTENT:
    ${leftContent || "<empty>"}

    NEW CONTENT:
    ${rightContent || "<empty>"}

    Provide:
    - Summary of changes
    - Suggestions or improvements
    - Risks or bugs introduced
    `;

    const response = await llm.invoke(prompt);
    return response.content
}

module.exports = aiAnalyzer