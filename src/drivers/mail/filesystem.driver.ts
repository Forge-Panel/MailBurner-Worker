import MailDriver from '../../interfaces/mail-driver.interface.js';
import fs from "fs/promises"
import path from "path"
import { ParsedMail, simpleParser } from 'mailparser';


export default class FilesystemMailDriver implements MailDriver {
  constructor(private basePath: string) {}

  private getFolderPath(folderName: string): string {
    return path.join(this.basePath, folderName);
  }

  async * readFolder(folderName: string): AsyncGenerator<string, void, unknown> {
    const folderPath = this.getFolderPath(folderName);
    try {
      const files = await fs.readdir(folderPath);
      for (const file of files) {
        // Ensure we only read files, not subdirectories
        const filePath = path.join(folderPath, file);
        const stat = await fs.stat(filePath);
        if (stat.isFile()) {
          yield await fs.readFile(filePath, 'utf-8');
        }
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.warn(`Filesystem folder not found: ${folderPath}`);
        // Folder doesn't exist, yield nothing
        return;
      } else {
        console.error(`Error reading filesystem folder ${folderPath}:`, error);
        throw error;
      }
    }
  }

  async getMessageById(messageId: string, folderName: string): Promise<string | null> {
    const folderPath = this.getFolderPath(folderName);
    // Assuming messageId is the filename (we might need to check variations like .eml)
    const potentialPaths = [
      path.join(folderPath, messageId),
      path.join(folderPath, `${messageId}.eml`)
      // Add other potential extensions if needed
    ];

    for (const filePath of potentialPaths) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        // Optional: Verify if the content's Message-ID header matches?
        // For now, finding the file is sufficient for the filesystem driver.
        return content;
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          console.error(`Error reading file ${filePath}:`, error);
          throw error; // Rethrow unexpected errors
        }
        // If ENOENT, just try the next potential path
      }
    }

    console.warn(`Message file not found for ID ${messageId} in folder ${folderName}`);
    return null; // Not found
  }

  async moveMessage(messageId: string, sourceFolder: string, destinationFolder: string): Promise<void> {
    const sourceFolderPath = this.getFolderPath(sourceFolder);
    const destinationFolderPath = this.getFolderPath(destinationFolder);

    // Find the actual filename associated with the messageId
    let sourceFilePath: string | null = null;
    const potentialSourcePaths = [
      path.join(sourceFolderPath, messageId),
      path.join(sourceFolderPath, `${messageId}.eml`)
    ];

    for (const potentialPath of potentialSourcePaths) {
      try {
        await fs.access(potentialPath, fs.constants.F_OK);
        sourceFilePath = potentialPath;
        break;
      } catch {
        // File doesn't exist at this path, continue checking
      }
    }

    if (!sourceFilePath) {
      throw new Error(`Cannot move message: Source file for ID ${messageId} not found in ${sourceFolder}`);
    }

    const destinationFilePath = path.join(destinationFolderPath, path.basename(sourceFilePath));

    try {
      // Ensure destination directory exists
      await fs.mkdir(destinationFolderPath, { recursive: true });
      // Move the file
      await fs.rename(sourceFilePath, destinationFilePath);
      console.log(`Moved message ${messageId} from ${sourceFolder} to ${destinationFolder}`);
    } catch (error) {
      console.error(`Error moving message ${messageId} to ${destinationFolder}:`, error);
      throw error;
    }
  }
}