// src/handlers/callbackHandler.js
//
// Handles inline button clicks (callback_query). Same rule as
// messageHandler: no decisions here, just transport + render.

const { buildButtonClickEvent } = require('../n8n/eventBuilder');
const { sendEvent, N8nUnavailableError } = require('../n8n/client');
const { render } = require('../telegram/responseRenderer');
const logger = require('../utils/logger');

async function handleButtonClick(ctx) {
  const event = buildButtonClickEvent(ctx);
  logger.info('Incoming button click', { user: event.telegram_user_id, callback_data: event.callback_data });

  try {
    // Acknowledge immediately so Telegram stops showing the button's
    // loading spinner, regardless of how long n8n takes.
    await ctx.answerCbQuery();
    await ctx.sendChatAction('typing');

    const response = await sendEvent(event);
    await render(ctx, response);
  } catch (err) {
    if (err instanceof N8nUnavailableError) {
      await ctx.reply('Sorry, KOURSE.IO is temporarily unavailable. Please try again in a moment.');
      return;
    }
    logger.error('Unexpected error handling button click', { message: err.message });
    await ctx.reply('Sorry, something went wrong. Please try again in a moment.');
  }
}

module.exports = { handleButtonClick };
