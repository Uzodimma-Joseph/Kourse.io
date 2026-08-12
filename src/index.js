// src/index.js
//
// Entry point. Phase 1: long-polling (simplest to run locally and to
// verify against BotFather/n8n before wiring up a public webhook).

const { createBot } = require('./telegram/bot');
const config = require('./config/env');
const logger = require('./utils/logger');

const bot = createBot();

bot.launch()
  .then(() => {
    logger.info('KOURSE.IO Telegram bot is running (polling mode)', { env: config.env });
  })
  .catch((err) => {
    logger.error('Failed to launch bot', { message: err.message });
    process.exit(1);
  });

// Graceful shutdown for Ctrl+C / platform restarts (e.g. Railway deploys)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
