export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG'
}

export class Logger {
    private static format(level: LogLevel, message: string): string {
        const timestamp = new Date().toISOString()
        const colors = {
            INFO: '\x1b[32m',
            WARN: '\x1b[33m',
            ERROR: '\x1b[31m',
            DEBUG: '\x1b[36m',
            RESET: '\x1b[0m'
        }

        return `${timestamp} [${colors[level]}${level}${colors.RESET}]: ${message}`
    }

    static info(message: string): void {
        console.info(this.format(LogLevel.INFO, message))
    }

    static warn(message: string): void {
        console.warn(this.format(LogLevel.WARN, message))
    }

    static error(message: string, error?: unknown): void {
        const errorDetails = error instanceof Error ? ` - ${error.stack}` : ''
        console.error(this.format(LogLevel.ERROR, `${message}${errorDetails}`))
    }
}