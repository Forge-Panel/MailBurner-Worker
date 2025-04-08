import FilesystemMailboxDriver from "../lib/MailboxDrivers/Filesytem.js";


export default async function runJob() {
  // Read first 10 messages
  const mailbox = new FilesystemMailboxDriver('./test')

  for await (const message of mailbox.readFolder('AI_processing')) {
    console.log('------------------')
    console.log()
    console.log(message.content.text);
    console.log()
  }
}

await runJob();