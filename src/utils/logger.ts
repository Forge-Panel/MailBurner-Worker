export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

class Logger {
    private static instance: Logger;
    private logLevel: LogLevel = 'debug';
    private readonly levels: Record<LogLevel, number> = {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3
    };

    private constructor() {}

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }

    public getLogLevel(): LogLevel {
        return this.logLevel;
    }

    private shouldLog(level: LogLevel): boolean {
        return this.levels[level] <= this.levels[this.logLevel];
    }

    private formatMessage(level: LogLevel, component: string, ...args: any[]): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${component}] [${level.toUpperCase()}] ${args.join(' ')}`;
    }

    public error(component: string, ...args: any[]): void {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', component, ...args));
        }
    }

    public warn(component: string, ...args: any[]): void {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', component, ...args));
        }
    }

    public info(component: string, ...args: any[]): void {
        if (this.shouldLog('info')) {
            console.log(this.formatMessage('info', component, ...args));
        }
    }

    public debug(component: string, ...args: any[]): void {
        if (this.shouldLog('debug')) {
            console.log(this.formatMessage('debug', component, ...args));
        }
    }
}

export const logger = Logger.getInstance();