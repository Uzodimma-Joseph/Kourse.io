// src/telegram/bot.js
//
// Owns the Telegram connection only. Registers handlers, doesn't
// contain their logic (that lives under src/handlers/).

const { Telegraf } = require('telegraf');
const config = require('../config/env');
const logger = require('../utils/logger');

const { handleStart } = require('../handlers/startHandler');
const { handleTextMessage } = require('../handlers/messageHandler');
const { handleButtonClick } = require('../handlers/callbackHandler');

function createBot() {
  const bot = new Telegraf(config.telegram.botToken);

  bot.command('start', handleStart);
  bot.on('text', handleTextMessage);
  bot.on('callback_query', handleButtonClick);

  // Global safety net: Telegraf calls this for any handler that throws
  // or rejects. Customers never see the raw error; it's logged instead.
  bot.catch((err, ctx) => {
    logger.error('Unhandled bot error', {
      message: err.message,
      update_type: ctx.updateType,
    });
    ctx.reply('Sorry, something went wrong. Please try again in a moment.').catch(() => {});
  });

  return bot;
}

module.exports = { createBot };
