import winston = require('winston')
const { combine, timestamp, printf } = winston.format;

// Create logger
export const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        printf(({ level, message, timestamp }) => {
            // return `[${timestamp}] ${level}: ${message}`
            return message
        })
    ),
    level: 'info',
    silent: false
})
