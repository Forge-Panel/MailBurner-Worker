import Message from "../types/message.type.js";

export default interface MailDriver {
  readFolder(name: string): AsyncGenerator<string, void, unknown>
}