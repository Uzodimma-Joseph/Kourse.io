// src/utils/logger.js
//
// Minimal structured logger. Swap for pino/winston later without
// touching any calling code, since everything imports this module.

function timestamp() {
  return new Date().toISOString();
}

const logger = {
  info: (msg, meta = {}) => {
    console.log(`[${timestamp()}] [INFO] ${msg}`, Object.keys(meta).length ? meta : '');
  },
  warn: (msg, meta = {}) => {
    console.warn(`[${timestamp()}] [WARN] ${msg}`, Object.keys(meta).length ? meta : '');
  },
  error: (msg, meta = {}) => {
    console.error(`[${timestamp()}] [ERROR] ${msg}`, Object.keys(meta).length ? meta : '');
  },
};

module.exports = logger;
