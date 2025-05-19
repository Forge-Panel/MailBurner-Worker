import { ChatOllama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import AiDriver, { AiAnalysis } from "../../interfaces/ai-driver.interface.js";
import { logger } from "../../utils/logger.js";

interface LangChainConfig {
  model: string;
  host: string;
}

export default class LangChainDriver implements AiDriver {
  private llm: ChatOllama;
  private component = "LangChain Driver";

  constructor(config: LangChainConfig) {
    this.llm = new ChatOllama({
      model: config.model,
      temperature: 0,
      maxRetries: 2,
      baseUrl: config.host
    });
  }

  async analyzeMessage(prompt: string): Promise<AiAnalysis> {
    try {
      const mailTool = tool(() => "Mail moving", {
        name: "move_mail_to_folder",
        description: "Move the mail message to a folder that makes most logical sense for the message to be put into.",
        schema: z.object({
          folderPath: z.string().describe("The actual folder path where the message should be moved to."),
          reasoning: z.string().describe("Explanation of why this folder was chosen."),
        }),
      });

      // Bind the tool to the model
      const llmWithTools = this.llm.bindTools([mailTool]);


      logger.debug(this.component, 'Sending prompt:', prompt);
        
      const result = await llmWithTools.invoke(prompt);
      logger.debug(this.component, 'AI Response:', JSON.stringify(result, null, 2));
      
      // First try to get the tool call result
      const toolCall = result.tool_calls?.[0];
      if (toolCall) {
        const args = toolCall.args as { folderPath: string; reasoning: string };
        logger.info(this.component, `AI recommended folder (from tool call): ${args.folderPath}`);
        return {
          folderPath: args.folderPath,
          reasoning: args.reasoning
        };
      }

      // If we still don't have a valid folder, return a default response
      logger.warn(this.component, 'No valid folder recommendation found in AI response');
      logger.debug(this.component, result);
      throw new Error("No valid folder recommendation found in AI response.");

    } catch (error) {
      logger.error(this.component, 'Error analyzing message:', error);
      throw error;
    }
  }
} 