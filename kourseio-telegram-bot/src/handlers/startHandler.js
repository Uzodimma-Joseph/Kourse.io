// src/handlers/startHandler.js
//
// /start still goes to n8n first — n8n controls the real welcome
// experience (copy, buttons, personalization). This file only holds
// a minimal, static fallback for when n8n can't be reached, so a new
// customer never sees a raw error on their very first interaction.
//
// The fallback buttons below are just callback_data labels — n8n
// decides what happens when any of them are clicked. No logic lives
// behind them here.

const { Markup } = require('telegraf');
const { buildCommandEvent } = require('../n8n/eventBuilder');
const { sendEvent, N8nUnavailableError } = require('../n8n/client');
const { render } = require('../telegram/responseRenderer');
const logger = require('../utils/logger');

const FALLBACK_TEXT = [
  'Welcome to KOURSE.IO 👋',
  '',
  'Your AI-powered course assistant.',
  '',
  'What would you like to do?',
].join('\n');

const FALLBACK_KEYBOARD = Markup.inlineKeyboard([
  [Markup.button.callback('📚 Browse Courses', 'browse_courses')],
  [Markup.button.callback('🔎 Find a Course', 'find_course')],
  [Markup.button.callback('🎯 Get Recommendation', 'recommend_course')],
  [Markup.button.callback('📖 Request a Course/Book', 'request_product')],
  [Markup.button.callback('🛒 My Purchases', 'my_purchases')],
  [Markup.button.callback('❓ Help', 'help')],
]);

async function handleStart(ctx) {
  const event = buildCommandEvent(ctx, 'start');
  logger.info('Incoming /start', { user: event.telegram_user_id });

  try {
    await ctx.sendChatAction('typing');
    const response = await sendEvent(event);
    await render(ctx, response);
  } catch (err) {
    if (err instanceof N8nUnavailableError) {
      // Minimal local fallback only — n8n still owns the real welcome flow.
      await ctx.reply(FALLBACK_TEXT, FALLBACK_KEYBOARD);
      return;
    }
    logger.error('Unexpected error handling /start', { message: err.message });
    await ctx.reply('Sorry, something went wrong. Please try again in a moment.');
  }
}

module.exports = { handleStart };
