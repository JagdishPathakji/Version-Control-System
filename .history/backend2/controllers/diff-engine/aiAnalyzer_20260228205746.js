async function aiAnalyzer({ filePath="", leftContent="", rightContent="", mode=""}) {

    const { ChatOllama } = await import("@langchain/ollama");

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

    Format your response in **Markdown only**. Do NOT use HTML or any other format.
    `;

    const response = await llm.invoke(prompt);
    return response.content
}

module.exports = aiAnalyzer