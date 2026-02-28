import { ChatOllama } from "@langchain/ollama";

const llm = new ChatOllama({
    model: "gpt-oss:120b-cloud",
    baseUrl: "https://ollama.com",
    apiKey: "",
    temperature: 0,
});

const prompt = `
`;

const response = await llm.invoke(prompt);
console.log(response.content)