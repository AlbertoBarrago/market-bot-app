import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase } from './database.js';
import { setupEndpoints } from './endpoints.js';
import { setupBotCommands } from './botCommands.js';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN ? process.env.BOT_TOKEN.trim() : null;
const MINI_APP_URL = process.env.MINI_APP_URL ? process.env.MINI_APP_URL.trim() : null;
const WEBHOOK_PATH = `/webhook/${BOT_TOKEN}`;
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../');
const DIST_PATH = path.join(ROOT_DIR, 'dist');

if (!BOT_TOKEN || !MINI_APP_URL) {
    console.error("❌ Error: BOT_TOKEN or MINI_APP_URL environment secrets are missing.");
    process.exit(1);
}

await connectDatabase();

const bot = new Telegraf(BOT_TOKEN);
const app = setupEndpoints(bot, WEBHOOK_PATH, DIST_PATH);

setupBotCommands(bot, MINI_APP_URL);

/**
 * Configure the Telegram webhook and start the HTTP server for production.
 *
 * Attempts to set the bot webhook to `MINI_APP_URL + WEBHOOK_PATH` and starts the HTTP server listening on `PORT`.
 * Logs success or failure for the webhook setup and the server start. On any setup error, logs the error and exits the process with code 1.
 */
async function startProductionBot() {
    try {
        const fullWebhookUrl = `${MINI_APP_URL}${WEBHOOK_PATH}`;
        const setHook = await bot.telegram.setWebhook(fullWebhookUrl);

        if (setHook) {
            console.log(`✅ Telegram Webhook set successfully to: ${fullWebhookUrl}`);
        } else {
            console.error("❌ Failed to set Telegram Webhook via API call.");
        }

        app.listen(PORT, () => {
            console.log(`🌐 Server is running and listening on port ${PORT}`);
        });

    } catch (error) {
        console.error('Fatal error during setup:', error);
        process.exit(1);
    }
}

void startProductionBot();

process.once('SIGINT', () => { bot.stop('SIGINT'); process.exit(0); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); process.exit(0); });