import Message from "../types/Message.js";

export default interface IMailboxDriver {
  readFolder(name: string): AsyncGenerator<Message, void, unknown>
}