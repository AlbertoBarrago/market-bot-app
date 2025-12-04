import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

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

mongoose.connect(process.env.MONGO_URL, { dbName: 'marketBot' })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

const bot = new Telegraf(BOT_TOKEN);
const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({});
        const transformed = products.map(p => {
            const doc = p.toObject();
            doc.id = doc._id.toString();
            delete doc._id;
            return doc;
        });
        res.json(transformed);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

app.use(bot.webhookCallback(WEBHOOK_PATH));

app.use(express.static(DIST_PATH));
console.log(`✅ Serving static files from: ${DIST_PATH}`);

bot.start(async (ctx) => {
    const userName = ctx.from.first_name || 'valued customer';
    const welcomeMessage = `👋 Welcome, ${userName}, to the Video Shop! 
You can browse and purchase exclusive video content right here in Telegram.

Click the button below to open the catalog.`;

    const keyboard = {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: '🚀 Open Catalog',
                    web_app: {
                        url: MINI_APP_URL
                    }
                }]
            ]
        }
    };

    await ctx.reply(welcomeMessage, keyboard);
});

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
            console.log(`Video Shop Bot (Webhook Mode) is active.`);
        });

    } catch (error) {
        console.error('Fatal error during setup:', error);
        process.exit(1);
    }
}

void startProductionBot();

process.once('SIGINT', () => { bot.stop('SIGINT'); process.exit(0); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); process.exit(0); });