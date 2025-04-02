import type Message from "../types/Message.js";

export default interface IMessageParser {
  parseMessage(rawMessage: string): Promise<Message>;
}