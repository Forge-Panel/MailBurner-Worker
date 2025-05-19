// import { ChatOllama } from "@langchain/ollama";
// import { tool } from "@langchain/core/tools";
// import { z } from "zod";
//
//
// function moveMessageToFolder(message: Message) {
//   const llm = new ChatOllama({
//     model: "llama3.2:3b",
//     temperature: 0,
//     maxRetries: 2,
//     baseUrl: 'http://localhost:11434'
//   });
//
//   const weatherTool = tool(() => "Mail moving", {
//     name: "move_mail_to_folder",
//     description: "Move the mail message to a folder that makes most logical sense for the message to be put into.",
//     schema: z.object({
//       folderName: z.string().describe("Name of the folder the message should be put into."),
//     }),
//   });
//
// // Bind the tool to the model
//   const llmWithTools = llm.bindTools([weatherTool]);
//
//   const resultFromTool = await llmWithTools.invoke(
//     "These are my folders on my mailbox:\n" +
//     "'Invoices' Any message that contains transactions or invoices data.\n" +
//     "'Trash' Messages that are unimportant, spam, phishing, scam, etc.\n" +
//     "'Discounts' Messages that contain a promo/discount code or referral link.\n" +
//     "The following is a message I have received, please use the move_mail_to_folder tool to determine where this message should be stored:\n" +
//     `${message}`
//   );
//
//   console.log(resultFromTool);
// }