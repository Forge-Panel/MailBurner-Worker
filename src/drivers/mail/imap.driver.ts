import Imap, { Box, ImapMessage } from 'node-imap';
import { simpleParser } from 'mailparser';
import { promisify } from 'util';
import MailDriver from '../../interfaces/mail-driver.interface.js';
import { logger } from '../../utils/logger.js';

export default class ImapDriver implements MailDriver {
    private connection: Imap;
    private connected: boolean = false;
    private currentBox: Box | null = null;
    private connectionTimeout: NodeJS.Timeout | null = null;
    private readonly component = 'IMAP';

    constructor(config: {
        user: string;
        password: string;
        host: string;
        port: number;
        tls: boolean;
    }) {
        logger.debug(this.component, 'Initializing IMAP connection...');
        
        this.connection = new Imap({
            user: config.user,
            password: config.password,
            host: config.host,
            port: config.port,
            tls: config.tls,
            tlsOptions: { rejectUnauthorized: false },
            connTimeout: 10000,
            authTimeout: 10000,
            debug: (msg: string) => logger.debug(this.component, msg)
        });


        this.connection.on('error', (err: Error) => {
            logger.error(this.component, 'IMAP connection error:', err);
            this.connected = false;
            this.currentBox = null;
            this.clearConnectionTimeout();
        });

        this.connection.on('end', () => {
            logger.info(this.component, 'IMAP connection ended');
            this.connected = false;
            this.currentBox = null;
            this.clearConnectionTimeout();
        });

        this.connection.on('close', (hadError: boolean) => {
            if (this.currentBox) {
                logger.info(this.component, `IMAP box ${this.currentBox.name} closed. Had error: ${hadError}`);
                this.currentBox = null;
            }
            this.clearConnectionTimeout();
        });
    }

    private clearConnectionTimeout() {
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
        }
    }

    private async connect(): Promise<void> {
        if (this.connected) {
            logger.debug(this.component, 'Already connected to IMAP server');
            return;
        }

        return new Promise((resolve, reject) => {
            this.connectionTimeout = setTimeout(() => {
                this.connection.end();
                reject(new Error('IMAP connection timeout'));
            }, 30000);

            this.connection.once('ready', () => {
                logger.info(this.component, 'IMAP connection established successfully');
                this.connected = true;
                this.clearConnectionTimeout();
                resolve();
            });

            this.connection.once('error', (err: Error) => {
                logger.error(this.component, 'IMAP connection error:', err);
                this.clearConnectionTimeout();
                reject(err);
            });

            logger.info(this.component, 'Attempting to connect to IMAP server...');
            this.connection.connect();
        });
    }

    private async openMailbox(folderName: string, readOnly: boolean = false): Promise<Box> {
        await this.connect();
        
        if (this.currentBox && this.currentBox.name === folderName && this.currentBox.readOnly === readOnly) {
            logger.debug(this.component, `Already in mailbox ${folderName} with correct mode`);
            return this.currentBox;
        }

        logger.info(this.component, `Opening mailbox: ${folderName} (ReadOnly: ${readOnly})`);
        const openBoxAsync = promisify(this.connection.openBox.bind(this.connection));
        
        try {
            this.currentBox = await openBoxAsync(folderName, readOnly);
            logger.info(this.component, `Successfully opened mailbox: ${folderName}`);
            return this.currentBox;
        } catch (err: any) {
            logger.error(this.component, `Error opening mailbox ${folderName}:`, err);
            this.currentBox = null;
            throw err;
        }
    }

    private async getMessageUid(messageId: string, folderName: string): Promise<number | null> {
        try {
            logger.info(this.component, `Searching for message ID ${messageId} in ${folderName}`);
            await this.openMailbox(folderName, true);

            return await new Promise((resolve, reject) => {
                const searchAsync = promisify(this.connection.search.bind(this.connection));
                searchAsync([['HEADER', 'MESSAGE-ID', messageId]], (err, results) => {
                    if (err) {
                        logger.error(this.component, `Error searching for message ID ${messageId}:`, err);
                        reject(err);
                        return;
                    }

                    if (!results || results.length === 0) {
                        logger.warn(this.component, `No message found with ID ${messageId}`);
                        resolve(null);
                        return;
                    }

                    const fetch = this.connection.fetch(results[0], { bodies: '', struct: true });
                    fetch.on('message', (msg: ImapMessage) => {
                        msg.once('attributes', (attrs) => {
                            if (attrs.uid) {
                                logger.debug(this.component, `Found message with UID ${attrs.uid}`);
                                resolve(attrs.uid);
                            } else {
                                logger.warn(this.component, `Message found but no UID available`);
                                resolve(null);
                            }
                        });
                    });

                    fetch.once('error', (err: Error) => {
                        logger.error(this.component, `Error fetching UID for message ID ${messageId}:`, err);
                        reject(err);
                    });

                    fetch.once('end', () => {
                        if (!results[0]) {
                            logger.warn(this.component, `No UID found for message ID ${messageId}`);
                            resolve(null);
                        }
                    });
                });
            });
        } catch (error) {
            logger.error(this.component, `Error getting UID for message ID ${messageId}:`, error);
            return null;
        }
    }

    async *readFolder(folderName: string): AsyncGenerator<string, void, unknown> {
        try {
            logger.info(this.component, `Starting to read folder: ${folderName}`);
            await this.openMailbox(folderName, true);

            if (!this.currentBox || this.currentBox.messages.total === 0) {
                logger.info(this.component, `Folder ${folderName} is empty or couldn't be opened properly`);
                return;
            }

            logger.info(this.component, `Reading ${this.currentBox.messages.total} messages from ${folderName}`);
            const fetch = this.connection.fetch('1:*', { bodies: '' });

            yield* await new Promise<string[]>((resolve, reject) => {
                const messageContents: string[] = [];
                let messageCount = 0;

                fetch.on('message', (msg: ImapMessage, seqno: number) => {
                    messageCount++;
                    logger.debug(this.component, `Processing message ${messageCount}/${this.currentBox?.messages.total}`);
                    
                    let buffer = '';
                    msg.on('body', (stream, info) => {
                        stream.on('data', (chunk) => buffer += chunk.toString('utf8'));
                    });

                    msg.once('end', () => {
                        messageContents.push(buffer);
                        logger.debug(this.component, `Completed processing message ${messageCount}`);
                    });
                });

                fetch.once('error', (err: Error) => {
                    logger.error(this.component, `Error fetching messages from ${folderName}:`, err);
                    reject(err);
                });

                fetch.once('end', () => {
                    logger.info(this.component, `Finished fetching all messages from ${folderName}`);
                    resolve(messageContents);
                });
            });

        } catch (error) {
            logger.error(this.component, `Error reading IMAP folder ${folderName}:`, error);
            throw error;
        }
    }

    async getMessageById(messageId: string, folderName: string): Promise<string | null> {
        try {
            logger.info(this.component, `Fetching message ${messageId} from ${folderName}`);
            await this.openMailbox(folderName, true);
            
            return await new Promise((resolve, reject) => {
                const fetch = this.connection.fetch(messageId, { bodies: '' });
                let messageBody: string | null = null;

                fetch.on('message', (msg: ImapMessage) => {
                    let buffer = '';
                    msg.on('body', (stream, info) => {
                        stream.on('data', (chunk) => buffer += chunk.toString('utf8'));
                    });
                    msg.once('end', () => {
                        messageBody = buffer;
                    });
                });

                fetch.once('error', (err: Error) => {
                    logger.error(this.component, `Error fetching message ${messageId}:`, err);
                    reject(err);
                });

                fetch.once('end', () => {
                    logger.info(this.component, `Finished fetching message ${messageId}`);
                    resolve(messageBody);
                });
            });
        } catch (error) {
            logger.error(this.component, `Error getting message ${messageId} from ${folderName}:`, error);
            return null;
        }
    }

    private async folderExists(folderName: string): Promise<boolean> {
        try {
            await this.connect();
            return new Promise((resolve) => {
                this.connection.getBoxes((err, boxes) => {
                    if (err) {
                        logger.error(this.component, `Error listing folders:`, err);
                        resolve(false);
                        return;
                    }
                    const exists = Object.keys(boxes).some(name => name === folderName);
                    logger.debug(this.component, `Folder ${folderName} ${exists ? 'exists' : 'does not exist'}`);
                    resolve(exists);
                });
            });
        } catch (error) {
            logger.error(this.component, `Error checking if folder ${folderName} exists:`, error);
            return false;
        }
    }

    async moveMessage(messageId: string, sourceFolder: string, destinationFolder: string): Promise<void> {
        try {
            logger.info(this.component, `Moving message ${messageId} from ${sourceFolder} to ${destinationFolder}`);
            
            // Check if destination folder exists
            const folderExists = await this.folderExists(destinationFolder);
            console.log(destinationFolder)
            if (!folderExists) {
                logger.warn(this.component, `Destination folder ${destinationFolder} does not exist, skipping move`);
                return;
            }
            
            const uid = await this.getMessageUid(messageId, sourceFolder);
            if (!uid) {
                logger.warn(this.component, `Could not find message with ID ${messageId} in folder ${sourceFolder}`);
                return;
            }

            await this.openMailbox(sourceFolder, false);
            const moveAsync = promisify(this.connection.move.bind(this.connection));
            await moveAsync(uid, destinationFolder);
            
            logger.info(this.component, `Successfully moved message with UID ${uid}`);
            this.currentBox = null;
        } catch (error) {
            logger.error(this.component, `Error moving message ${messageId}:`, error);
        }
    }

    async close(): Promise<void> {
        if (this.connected) {
            logger.info(this.component, 'Closing IMAP connection');
            this.connection.end();
            this.clearConnectionTimeout();
        }
    }
}
