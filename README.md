# KOURSE.IO — Telegram Bot Interface (Phase 1)

This is the **front door**, not the brain. It receives Telegram messages/button
clicks, forwards them to n8n as structured JSON, and renders whatever n8n sends
back. It holds no course data, prices, payment logic, or AI logic — see
`ARCHITECTURE RULE` in the project brief for the full reasoning.

```
CUSTOMER → TELEGRAM → THIS BOT → N8N → (AI / SHEETS / PAYSTACK) → N8N → THIS BOT → CUSTOMER
```

## 1. Technology chosen

- **Node.js + Telegraf** — Telegraf is the most widely used, actively
  maintained Telegram Bot API framework for Node. It gives clean middleware
  for commands, text messages, and `callback_query` (button) handling, plus
  built-in inline-keyboard helpers — exactly the surface area this bot needs.
- **axios** — for the single outbound call type this bot makes: POST to the
  n8n webhook.
- **No database.** Per the brief, all state lives in n8n/Google Sheets. This
  process is stateless — it can restart or scale without losing anything.
- **No React/Next.js.** There's no web frontend here; a Telegram bot doesn't
  benefit from a frontend framework, so the brief's "keep it lightweight"
  instruction is taken literally: plain Node.js modules.

## 2. Project structure

```
kourseio-telegram-bot/
├─ src/
│  ├─ config/env.js            # loads & validates environment variables
│  ├─ telegram/
│  │  ├─ bot.js                 # Telegraf setup, registers handlers
│  │  └─ responseRenderer.js    # turns n8n's JSON into Telegram messages
│  ├─ n8n/
│  │  ├─ client.js              # the only module that calls n8n
│  │  └─ eventBuilder.js        # builds the JSON payloads sent to n8n
│  ├─ handlers/
│  │  ├─ startHandler.js        # /start (n8n-driven, with minimal fallback)
│  │  ├─ messageHandler.js      # plain text messages
│  │  └─ callbackHandler.js     # inline button clicks
│  ├─ utils/logger.js
│  └─ index.js                  # entry point (long polling)
├─ .env.example
├─ .gitignore
└─ package.json
```

## 3. Install dependencies

```bash
npm install
```

## 4. Configure environment variables

```bash
cp .env.example .env
```

Fill in:

| Variable | Required | Notes |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | yes | from @BotFather — see section 7 below |
| `N8N_WEBHOOK_URL` | yes | the n8n Webhook node URL this bot posts events to |
| `N8N_API_KEY` | no | if set, sent as `Authorization: Bearer <value>` to n8n |
| `N8N_TIMEOUT_MS` | no | default `15000` |
| `PORT` | no | only relevant once you switch to webhook mode later |
| `NODE_ENV` | no | `development` or `production` |

Never commit `.env` — it's already in `.gitignore`.

## 5. Run locally

```bash
npm run dev   # nodemon, auto-restarts on file changes
# or
npm start
```

Phase 1 runs in **long-polling** mode — no public URL needed, so you can test
entirely from your machine. Message your bot on Telegram and you should see
log lines for each incoming event.

Until n8n is wired up (Phase 2), every message will hit the "temporarily
unavailable" fallback — that's expected and confirms the bot ↔ Telegram
connection works.

## 6. Deploy

Any host that can run a long-lived Node process works. Two good fits:

- **Railway** — `railway up`, set the same env vars in the dashboard. No
  extra config needed since this runs polling by default.
- **Render / Fly.io** — same idea: Node web service (or background worker),
  set env vars, `npm start`.

If you later move to **webhook mode** (recommended for production, since
polling keeps an open connection and doesn't scale as cleanly), the bot needs
a public HTTPS URL — that's a small, additive change to `src/index.js` and is
best done once Phase 2/3 are confirmed working, not before.

## 7. Create/configure the bot with BotFather

1. Open Telegram, message **@BotFather**.
2. Send `/newbot`.
3. Choose a display name (e.g. `KOURSE.IO`).
4. Choose a unique username ending in `bot` (e.g. `KourseIOBot`).
5. BotFather replies with an **API token** — put it in `.env` as
   `TELEGRAM_BOT_TOKEN`.
6. Optional but recommended, still via BotFather:
   - `/setdescription` — short description shown on the bot's profile.
   - `/setabouttext` — shown in the "About" section.
   - `/setuserpic` — upload a KOURSE.IO logo.
   - `/setcommands` — register `start - Start using KOURSE.IO` so it
     autocompletes in the Telegram UI.
7. Run `npm run dev` and message your bot — you're live in polling mode.

## 8. Connecting to n8n (Phase 2 — not yet)

Once Phase 1 is confirmed working end-to-end against Telegram:

1. In n8n, create a **Webhook** node (Production URL), set it to accept POST.
2. Put that URL in `N8N_WEBHOOK_URL`.
3. If the webhook should be protected, add header auth in n8n and set
   `N8N_API_KEY` here to match.
4. The bot already sends the event shapes described in the brief
   (`message`, `command`, `button_click`) and already knows how to render
   the response shapes (`message`, `photo`, `document`, `typing`, `error`)
   — nothing in this bot needs to change; only the n8n side gets built out.

This is intentionally where Phase 1 stops.
