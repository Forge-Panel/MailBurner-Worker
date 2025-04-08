import MailDriver from "../interfaces/mail-driver.interface.js";


export default class MailService {
  static mailDrivers: Record<string, MailDriver> = {};
  private currentMailDriver?: MailDriver;

  static registerMailDriver(name: string, mailDriver: MailDriver) {
    MailService.mailDrivers[name] = mailDriver;
  }

  private fetchMailDriver(name: string) {
    try {
      return MailService.mailDrivers['filesystem'];
    } catch (e) {
      console.error(e);
      throw new Error(`MailDriver ${name} not registered.`);
    }
  }

  constructor() {
    this.currentMailDriver = MailService.mailDrivers['filesystem'];

  }
}