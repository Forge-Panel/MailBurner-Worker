import FilesystemMailboxDriver from "../lib/MailboxDrivers/Filesytem.js";


export default async function runJob() {
  // Read first 10 messages
  const mailbox = new FilesystemMailboxDriver('./test')

  for await (const message of mailbox.readFolder('Inbox')) {
    console.log(message.messageId);
    console.log(message.subject);
    console.log(message.receivedOn);
    console.log(message.from);
    console.log(message.to);
    console.log(message.cc);
    console.log(message.bcc);
    console.log(message.content.text);
    console.log()
  }
}

await runJob();