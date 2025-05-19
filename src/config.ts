import fs from "fs";
import yaml from 'js-yaml';

export type FolderConfig = {
  name: string;
  folder_path: string,
  description: string,
}

export type MailboxConfig = {
  config: {
    driver: string;
    path?: string; // For filesystem
    host?: string; // For IMAP
    port?: number; // For IMAP
    user?: string; // For IMAP
    password?: string; // For IMAP
    tls?: boolean; // For IMAP
  },
  work_folder: string,
  folders: FolderConfig[];
}

type AiConfig = {
  driver: string,
  model: string,
  host: string,
}

type Config = {
  mailboxes: MailboxConfig[];
  ai: AiConfig;
}

// Load configuration
export default yaml.load(fs.readFileSync('./config.yml', 'utf8')) as Config;
