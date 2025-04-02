import IMessageParser from "../interfaces/MessageParser.js";
import EmlParser from "../MessageParsers/Eml.js";
import type Message from "../types/Message.js";


export default class MessageParserFactory {
  static async parseMessage(rawMessage: string): Promise<Message> {
    // Detect file type using message content

    // Read first few bytes of the file
    const buffer = rawMessage;
    let parser: IMessageParser;

    // Check for `.eml` structure (plain text starting with headers)
    if (buffer.startsWith('From:') || buffer.startsWith('Received:')) {
      parser = new EmlParser();
    } else {
      parser = new EmlParser();
    }

    // `.msg` files are binary, so reading as text would likely return gibberish
    return await parser.parseMessage(rawMessage);
  }
}