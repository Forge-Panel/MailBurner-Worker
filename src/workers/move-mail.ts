import MailService from "../services/mail.service.js";
import AiService from "../services/ai.service.js";
import { logger } from '../utils/logger.js';
import config from '../config.js';


const component = 'MoveMail';

export default async function runJob() {
  // Load mailbox configuration
  const mailConfig = config.mailboxes[0]

  // Instantiate services
  const mailboxService = new MailService(mailConfig);
  const aiService = new AiService(mailConfig.folders);

  logger.info(component, `Scanning ${mailConfig.config.user} ${mailConfig.work_folder} folder for messages`)

  try {
    // Read messages from the work folder
    for await (const message of mailboxService.readFolder(mailConfig.work_folder)) {
      logger.info(component, `Subject: ${message.subject}`);

      // Analyze the message to determine the target folder
      try {
        const analysis = await aiService.analyzeMessage(message);

        // Move the message to the recommended folder
        try {
          await mailboxService.moveMessage(message.messageId, mailConfig.work_folder, analysis.folderPath);
          logger.info(component, `✓ Successfully moved message to ${analysis.folderPath}`);
        } catch (error) {
          logger.error(component, `✗ Failed to move message to ${analysis.folderPath}:`, error);
        }
      } catch (error) {
        logger.error(component, `✗ Failed to analyze message - skipping:`, error);
      }

    }
  } catch (error) {
    logger.error(component, 'Error processing messages:', error);
  } finally {
    // Close the connection if the driver supports it
    if (typeof (mailboxService as any).closeConnection === 'function') {
      await (mailboxService as any).closeConnection();
    }
  }
}
