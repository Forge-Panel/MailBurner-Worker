import MessageParser from "../interfaces/message-parser.interface.js";
import EmlMessageParser from "../parsers/eml.parser.js";
import type Message from "../types/message.type.js";

export default class MessageParserService {
  static async parseMessage(rawMessage: string): Promise<Message> {
    // Detect file type using message content

    // Read first few bytes of the file
    const buffer = rawMessage;
    let parser: MessageParser;

    // Check for `.eml` structure (plain text starting with headers)
    if (buffer.startsWith('From:') || buffer.startsWith('Received:')) {
      parser = new EmlMessageParser();
    } else {
      parser = new EmlMessageParser();
    }

    // `.msg` files are binary, so reading as text would likely return gibberish
    return await parser.parseMessage(rawMessage);
  }
}