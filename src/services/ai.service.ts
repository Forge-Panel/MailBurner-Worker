import Message from "../types/message.type.js";
import { logger } from '../utils/logger.js';
import AiDriver from "../interfaces/ai-driver.interface.js";
import {FolderConfig} from "../config.js";


export default class AiService {
  // Store driver classes (constructors)
  static aiDriver: AiDriver
  private component = "AI Service"
  private folders: FolderConfig[] = []

  static injectAiDriver(aiDriver: AiDriver) {
    AiService.aiDriver = aiDriver;
  }

  constructor(folders: FolderConfig[]) {
    this.folders = folders;
  }

  private buildFolderContext(): string {
    return this.folders.map(folder => 
      `- '${folder.folder_path}': ${folder.description}`
    ).join('\n');
  }


  private buildPrompt(message: Message): string {
    return "You are an AI assistant that helps categorize emails. " +
      "Your task is to analyze the content of email messages and determine the most appropriate folder " +
      "based on the provided folder structure and descriptions.\n\n" +
      "IMPORTANT: You MUST use the move_mail_to_folder tool to provide your response. " +
      "This is the ONLY way to properly categorize the email.\n\n" +
      "Instructions:\n" +
      "1. Carefully read the email content and context\n" +
      "2. Consider the purpose and content of the email\n" +
      "3. Match it against the available folders and their descriptions\n" +
      "4. Use the move_mail_to_folder tool to specify:\n" +
      "   folderPath: The exact folder path where the message should go\n" +
      "   reasoning: A clear explanation of why this folder was chosen\n\n" +
      "DO NOT provide your response in plain text. ALWAYS use the move_mail_to_folder tool.\n\n" +
      `These are the folders you can categorize messages into:\n` +
      `${this.buildFolderContext()}\n\n` +
      "Please analyze the following message:\n" +
      `FROM=${message.from}\n` +
      `SUBJECT=${message.subject}\n\n` +
      message.content.text;
  }

  async analyzeMessage(message: Message): Promise<{ folderPath: string; reasoning: string }> {
    try {
      const analysis = await AiService.aiDriver.analyzeMessage(this.buildPrompt(message));

      // Validate the recommended folder
      if (!this.folders.some(folder => folder.folder_path === analysis.folderPath)) {
        throw new Error(`Invalid folder ${analysis.folderPath} recommended`)
      }

      return analysis;
    } catch (error) {
      logger.error(this.component, 'Error analyzing message:', error);
      throw error;
    }
  }
}