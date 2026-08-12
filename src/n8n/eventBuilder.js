// src/n8n/eventBuilder.js
//
// Turns a Telegraf ctx into the plain, predictable JSON shape n8n expects.
// No decisions are made here — just field mapping.

function baseFields(ctx) {
  const from = ctx.from || {};
  const chat = ctx.chat || {};
  return {
    telegram_user_id: String(from.id || ''),
    username: from.username || null,
    first_name: from.first_name || null,
    last_name: from.last_name || null,
    chat_id: String(chat.id || ''),
    timestamp: new Date().toISOString(),
  };
}

function buildMessageEvent(ctx) {
  const msg = ctx.message || {};
  return {
    event: 'message',
    ...baseFields(ctx),
    message_id: String(msg.message_id || ''),
    message_type: 'text',
    text: msg.text || '',
  };
}

function buildCommandEvent(ctx, command) {
  const msg = ctx.message || {};
  return {
    event: 'command',
    ...baseFields(ctx),
    message_id: String(msg.message_id || ''),
    command, // e.g. "start"
    text: msg.text || '',
  };
}

function buildButtonClickEvent(ctx) {
  const callbackQuery = ctx.callbackQuery || {};
  return {
    event: 'button_click',
    ...baseFields(ctx),
    callback_data: callbackQuery.data || '',
  };
}

module.exports = { buildMessageEvent, buildCommandEvent, buildButtonClickEvent };
