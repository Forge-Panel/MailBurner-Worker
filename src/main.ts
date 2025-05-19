import MailService from "./services/mail.service.js";
import FilesystemMailDriver from "./drivers/mail/filesystem.driver.js";
import ImapDriver from "./drivers/mail/imap.driver.js";
import AiService from "./services/ai.service.js";
import LangChainDriver from "./drivers/ai/langchain.driver.js";
import runJob from "./workers/move-mail.js";
import config from "./config.js"


// Register available driver classes
MailService.registerMailDriver('filesystem', FilesystemMailDriver);
MailService.registerMailDriver('imap', ImapDriver);

AiService.injectAiDriver(new LangChainDriver(config.ai))

// Run the job with the mail configuration
runJob();
