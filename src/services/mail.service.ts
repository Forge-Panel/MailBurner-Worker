import MailDriver from "../interfaces/mail-driver.interface.js";
import Message from "../types/message.type.js";
import MessageParserService from "./message-parser.service.js";
import { MailboxConfig } from "../config.js"


export default class MailService {
  // Store driver classes (constructors)
  static mailDrivers: Record<string, new (...args: unknown[]) => MailDriver> = {};
  private currentMailDriver: MailDriver;

  static registerMailDriver(name: string, mailDriverClass: new (...args: unknown[]) => MailDriver) {
    MailService.mailDrivers[name] = mailDriverClass;
  }

  constructor(config: MailboxConfig) {
    const DriverClass = MailService.mailDrivers[config.config.driver];

    if (!DriverClass) {
      throw new Error(`MailDriver class ${config.config.driver} not registered.`);
    }

    // Instantiate the driver based on its type
    if (config.config.driver === 'filesystem') {
      if (!config.config.path) {
        throw new Error('Filesystem driver requires a \'path\' in the configuration.');
      }
      this.currentMailDriver = new DriverClass(config.config.path);
    } else if (config.config.driver === 'imap') {
      if (!config.config.host || !config.config.port || !config.config.user || !config.config.password) {
        throw new Error('IMAP configuration is incomplete. Required fields: host, port, user, password');
      }
      this.currentMailDriver = new DriverClass({
        host: config.config.host,
        port: config.config.port,
        user: config.config.user,
        password: config.config.password,
        tls: config.config.tls ?? true
      });
    } else {
      // Handle other potential drivers or throw an error
      throw new Error(`Unsupported mail driver type: ${config.config.driver}`);
    }
  }

  async * readFolder(folderName: string): AsyncGenerator<Message, void, unknown> {
    for await (const rawMessage of this.currentMailDriver.readFolder(folderName)) {
      // Added check for empty/null rawMessage, though driver should ideally not yield them
      if (rawMessage) {
        yield MessageParserService.parseMessage(rawMessage);
      }
    }
  }

  async getMessageById(messageId: string, folderName: string): Promise<Message | null> {
    const rawMessage = await this.currentMailDriver.getMessageById(messageId, folderName);
    if (rawMessage) {
      return MessageParserService.parseMessage(rawMessage);
    }
    return null;
  }

  async moveMessage(messageId: string, sourceFolder: string, destinationFolder: string): Promise<void> {
    await this.currentMailDriver.moveMessage(messageId, sourceFolder, destinationFolder);
    // Note: If using IMAP, the underlying driver invalidates its currentBox state.
    // The MailService instance itself doesn't need specific state changes here.
  }

  // Optional: Add a method to explicitly close the driver connection if needed
  async closeConnection(): Promise<void> {
    if (typeof (this.currentMailDriver as any).close === 'function') {
      await (this.currentMailDriver as any).close();
    }
  }
}