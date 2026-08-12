// src/handlers/messageHandler.js
//
// Handles plain text messages from the customer. Contains zero
// business logic — it packages the message, sends it to n8n, and
// renders whatever n8n sends back.

const { buildMessageEvent } = require('../n8n/eventBuilder');
const { sendEvent, N8nUnavailableError } = require('../n8n/client');
const { render } = require('../telegram/responseRenderer');
const logger = require('../utils/logger');

async function handleTextMessage(ctx) {
  const event = buildMessageEvent(ctx);
  logger.info('Incoming message', { user: event.telegram_user_id, text: event.text });

  try {
    await ctx.sendChatAction('typing');
    const response = await sendEvent(event);
    await render(ctx, response);
  } catch (err) {
    if (err instanceof N8nUnavailableError) {
      await ctx.reply('Sorry, KOURSE.IO is temporarily unavailable. Please try again in a moment.');
      return;
    }
    logger.error('Unexpected error handling message', { message: err.message });
    await ctx.reply('Sorry, something went wrong. Please try again in a moment.');
  }
}

module.exports = { handleTextMessage };
