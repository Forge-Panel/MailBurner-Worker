import {AddressObject, simpleParser} from "mailparser";
import Message from "../types/Message.js";
import type EmailAddress from "../types/EmailAddress.js";
import IMessageParser from "../interfaces/MessageParser.js";

export default class EmlParser implements IMessageParser {
  async parseMessage(rawMessage: string) {
    const parsedEmail = await simpleParser(rawMessage);

    return {
      messageId: parsedEmail.messageId,
      subject: parsedEmail.subject,
      from: this.getFrom(parsedEmail.from),
      receivedOn: parsedEmail.date,
      to: this.getTo(parsedEmail.to),
      cc: this.getTo(parsedEmail.cc),
      bcc: this.getTo(parsedEmail.bcc),
      content: {
        text: parsedEmail.text,
        html: parsedEmail.textAsHtml,
      },
      raw: parsedEmail
    } as Message;
  }

  private getFrom(from?: AddressObject | undefined): EmailAddress {
    if (from === undefined || from === null) {
      return undefined;
    }

    const output = {address: '', name: undefined};

    from.value.forEach(recipientValue => {
      output.address = recipientValue.address;
      output.name = recipientValue.name
    })

    return output;
  }

  private getTo(to?: AddressObject | AddressObject[] | undefined): EmailAddress[] {
    if (to === undefined || to === null) {
      return [];
    }

    const output: EmailAddress[] = []

    if (Array.isArray(to)) {
      to.forEach(recipient => {
        recipient.value.forEach(recipientValue => {
          output.push({address: recipientValue.address, name: recipientValue.name});
        })
      })
    } else {
      to.value.forEach(recipientValue => {
        output.push({address: recipientValue.address, name: recipientValue.name});
      })
    }

    return output
  }

  private getCc(cc?: AddressObject | AddressObject[] | undefined): EmailAddress[] {
    if (cc === undefined || cc === null) {
      return [];
    }

    const output: EmailAddress[] = []

    if (Array.isArray(cc)) {
      cc.forEach(recipient => {
        recipient.value.forEach(recipientValue => {
          output.push({address: recipientValue.address, name: recipientValue.name});
        })
      })
    } else {
      cc.value.forEach(recipientValue => {
        output.push({address: recipientValue.address, name: recipientValue.name});
      })
    }

    return output
  }

  private getBcc(bcc?: AddressObject | AddressObject[] | undefined): EmailAddress[] {
    if (bcc === undefined || bcc === null) {
      return [];
    }

    const output: EmailAddress[] = []

    if (Array.isArray(bcc)) {
      bcc.forEach(recipient => {
        recipient.value.forEach(recipientValue => {
          output.push({address: recipientValue.address, name: recipientValue.name});
        })
      })
    } else {
      bcc.value.forEach(recipientValue => {
        output.push({address: recipientValue.address, name: recipientValue.name});
      })
    }

    return output
  }
}