import {AddressObject, simpleParser} from "mailparser";
import Message from "../types/message.type.js";
import type EmailAddressType from "../types/emailAddress.type.js";
import MessageParser from "../interfaces/message-parser.interface.js";

export default class EmlMessageParser implements MessageParser {
  async parseMessage(rawMessage: string) {
    const parsedEmail = await simpleParser(rawMessage);

    return {
      messageId: parsedEmail.messageId,
      subject: parsedEmail.subject,
      from: this.getFrom(parsedEmail.from),
      receivedOn: parsedEmail.date,
      to: this.getTo(parsedEmail.to),
      cc: this.getCc(parsedEmail.cc),
      bcc: this.getBcc(parsedEmail.bcc),
      content: {
        text: parsedEmail.text,
        html: parsedEmail.textAsHtml,
      },
      raw: parsedEmail
    } as Message;
  }

  private getFrom(from?: AddressObject | undefined): EmailAddressType {
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

  private getTo(to?: AddressObject | AddressObject[] | undefined): EmailAddressType[] {
    if (to === undefined || to === null) {
      return [];
    }

    const output: EmailAddressType[] = []

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

  private getCc(cc?: AddressObject | AddressObject[] | undefined): EmailAddressType[] {
    if (cc === undefined || cc === null) {
      return [];
    }

    const output: EmailAddressType[] = []

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

  private getBcc(bcc?: AddressObject | AddressObject[] | undefined): EmailAddressType[] {
    if (bcc === undefined || bcc === null) {
      return [];
    }

    const output: EmailAddressType[] = []

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