import { ChatOllama } from "@langchain/ollama";

const llm = new ChatOllama({
  model: "llama3",
  temperature: 0,
  maxRetries: 2,
  baseUrl: 'http://localhost:11434'
});

const aiMsg = await llm.invoke([
  [
    "system",
    "You will answer any question i will give you",
  ],
  ["human", "What is the smallest country in the world?"],
]);

console.log(aiMsg);