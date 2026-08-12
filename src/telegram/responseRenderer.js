// src/telegram/responseRenderer.js
//
// Turns n8n's structured JSON response into actual Telegram output.
// This file renders instructions — it never invents them. If n8n
// didn't send it, this file doesn't decide it.
//
// Supported n8n response "type" values:
//   - "message"        { text, buttons? }
//   - "photo"           { photo_url, caption?, buttons? }
//   - "document"        { document_url, caption?, buttons? }
//   - "typing"          { }                         (loading indicator)
//   - "error"           { text? }                   (n8n-signalled error)
//
// A "buttons" array can mix two kinds of buttons:
//   - { text, callback_data }  -> inline button, click reported back to n8n
//   - { text, url }            -> inline button that opens a URL
//     (used for both "pay now" links and "access course" links —
//     the bot doesn't know or care which; n8n decided the URL)

const { Markup } = require('telegraf');
const logger = require('../utils/logger');

function buildInlineKeyboard(buttons) {
  if (!Array.isArray(buttons) || buttons.length === 0) return undefined;

  const rows = buttons.map((btn) => {
    if (btn.url) {
      return [Markup.button.url(btn.text, btn.url)];
    }
    return [Markup.button.callback(btn.text, btn.callback_data || btn.text)];
  });

  return Markup.inlineKeyboard(rows);
}

async function render(ctx, response) {
  if (!response || !response.type) {
    logger.warn('n8n response missing "type"; showing generic fallback', { response });
    await ctx.reply('Sorry, something went wrong. Please try again in a moment.');
    return;
  }

  const keyboard = buildInlineKeyboard(response.buttons);

  switch (response.type) {
    case 'message': {
      await ctx.reply(response.text || '', {
        parse_mode: 'HTML',
        ...(keyboard || {}),
      });
      break;
    }

    case 'photo': {
      await ctx.replyWithPhoto(response.photo_url, {
        caption: response.caption || '',
        parse_mode: 'HTML',
        ...(keyboard || {}),
      });
      break;
    }

    case 'document': {
      await ctx.replyWithDocument(response.document_url, {
        caption: response.caption || '',
        parse_mode: 'HTML',
        ...(keyboard || {}),
      });
      break;
    }

    case 'typing': {
      await ctx.sendChatAction('typing');
      break;
    }

    case 'error': {
      await ctx.reply(response.text || 'Sorry, something went wrong. Please try again in a moment.');
      break;
    }

    default: {
      logger.warn('Unknown n8n response type', { type: response.type });
      await ctx.reply('Sorry, something went wrong. Please try again in a moment.');
    }
  }
}

module.exports = { render };
