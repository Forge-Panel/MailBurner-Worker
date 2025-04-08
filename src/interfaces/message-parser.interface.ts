import Message from "../types/message.type.js";

export default interface MessageParser {
  parseMessage(rawMessage: string): Promise<Message>;
}