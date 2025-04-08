import {ParsedMail} from "mailparser";
import EmailAddress from "./emailAddress.type.js";

type Message = {
  messageId: string;
  subject: string
  receivedOn: Date;
  from?: EmailAddress;
  to: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];
  content: {
    text: string;
    html: string;
  };
  raw: ParsedMail
}

export default Message;