// src/config/env.js
//
// Single source of truth for environment/config values.
// Nothing else in the app should call process.env directly —
// import `config` from here instead.

require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    // Fail loudly at startup rather than limping along without a token/URL.
    // eslint-disable-next-line no-console
    console.error(`[config] Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const config = {
  telegram: {
    botToken: required('TELEGRAM_BOT_TOKEN'),
  },
  n8n: {
    webhookUrl: required('N8N_WEBHOOK_URL'),
    apiKey: process.env.N8N_API_KEY || null, // optional
    timeoutMs: Number(process.env.N8N_TIMEOUT_MS) || 15000,
  },
  server: {
    port: Number(process.env.PORT) || 3000,
  },
  env: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
};

module.exports = config;
