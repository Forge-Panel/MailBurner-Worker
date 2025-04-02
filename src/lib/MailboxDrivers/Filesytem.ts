import IMailboxDriver from "../interfaces/MailBoxDriver.js";
import fs from "fs/promises"
import path from "path"
import type Message from "../types/Message.js";
import MessageParserFactory from "../factory/MessageParser.js";


export default class FilesystemMailboxDriver implements IMailboxDriver {
  constructor(private path) {}

  readFolders(): object[] {
    return []
  }

  async * readFolder(name: string) {
    const folderPath = path.join(this.path, name);
    const files = await fs.readdir(folderPath);

    for (const file of files) {
      const content = await fs.readFile(path.join(folderPath, file), 'utf-8');

      yield await MessageParserFactory.parseMessage(content)
    }
  }
}