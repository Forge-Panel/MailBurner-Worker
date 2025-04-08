import IMailboxDriver from "../interfaces/mail-driver.interface.js";
import fs from "fs/promises"
import path from "path"


export default class FilesystemMailDriver implements IMailboxDriver {
  constructor(private path) {}

  readFolders(): object[] {
    return []
  }

  async * readFolder(name: string) {
    const folderPath = path.join(this.path, name);
    const files = await fs.readdir(folderPath);

    for (const file of files) {
      yield await fs.readFile(path.join(folderPath, file), 'utf-8');
    }
  }
}