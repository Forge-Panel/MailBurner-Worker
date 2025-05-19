import Message from "../types/message.type.js";

export interface AiAnalysis {
  folderPath: string;
  reasoning: string;
}

export default interface AiDriver {
  analyzeMessage(prompt: string): Promise<AiAnalysis>;
} 