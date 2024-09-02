import { createLogger, format, transports } from 'winston';

const logging = {
  level: process.env.LOGGING_LEVEL || 'info',
};

const { combine, colorize, splat, printf, timestamp } = format;

const keysToFilter = ['password', 'token'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatter = printf((info: any) => {
  const { level, message, timestamp: ts, ...restMeta } = info;

  const meta =
    restMeta && Object.keys(restMeta).length
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? JSON.stringify(restMeta, (key: any, value: any) => (keysToFilter.includes(key) ? '******' : value), 2)
      : restMeta instanceof Object
      ? ''
      : restMeta;

  return `[ ${ts} ] - [ ${level} ] ${message} ${meta}`;
});

const LoggerService = createLogger({
  level: logging.level,
  format: combine(splat(), colorize(), timestamp(), formatter),
  transports: [new transports.Console()],
});

export default LoggerService;
