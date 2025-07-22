const winston = require('winston');
const path = require('path');
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level.toUpperCase()}: ${message}`;

});
const logPath = path.join(process.cwd(), 'logs', 'server.log');
console.log(logPath);
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        logFormat
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: logPath,
            handleExceptions: true,
            handleRejections: true
        })
    ]
});

logger.invoice = (message) => {
    logger.info(`INVOICE: ${message}`);
}

logger.client = (message) => {
    logger.info(`Client: ${message}`);
}

logger.auth = (message) => {
    logger.info(`Auth: ${message}`);
}


module.exports = logger;

