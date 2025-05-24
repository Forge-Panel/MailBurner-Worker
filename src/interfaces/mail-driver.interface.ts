export default interface MailDriver {
  readFolder(folderName: string): AsyncGenerator<string, void, unknown>;
  getMessageById(messageId: string, folderName: string): Promise<string | null>; // Returns raw message string or null
  moveMessage(messageId: string, sourceFolder: string, destinationFolder: string): Promise<void>;
}