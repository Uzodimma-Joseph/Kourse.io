// src/n8n/client.js
//
// The ONLY module that talks to n8n. Sends structured events, returns
// n8n's structured response. This file must never contain business
// logic (no course lists, no prices, no payment decisions) — it is a
// dumb transport layer, same as the Telegram side.

const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');

const client = axios.create({
  baseURL: config.n8n.webhookUrl,
  timeout: config.n8n.timeoutMs,
  headers: {
    'Content-Type': 'application/json',
    ...(config.n8n.apiKey ? { Authorization: `Bearer ${config.n8n.apiKey}` } : {}),
  },
});

/**
 * Send a structured event to n8n and return its structured response.
 * @param {object} event - e.g. { event: 'message', telegram_user_id, text, ... }
 * @returns {Promise<object>} n8n's response payload (see responseRenderer for shape)
 */
async function sendEvent(event) {
  try {
    const { data } = await client.post('', event);
    return data;
  } catch (err) {
    // Log full detail server-side only. Callers get a generic signal
    // and are responsible for showing a safe, generic message to the customer.
    logger.error('n8n request failed', {
      event: event.event,
      telegram_user_id: event.telegram_user_id,
      message: err.message,
      status: err.response ? err.response.status : undefined,
    });
    throw new N8nUnavailableError('Failed to reach n8n', err);
  }
}

class N8nUnavailableError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'N8nUnavailableError';
    this.cause = cause;
  }
}

module.exports = { sendEvent, N8nUnavailableError };
