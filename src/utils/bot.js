import { Telegraf } from 'telegraf';
import 'dotenv/config';

const BOT_TOKEN = process.env.BOT_TOKEN;
const MINI_APP_URL = process.env.MINI_APP_URL;


if (!BOT_TOKEN || !MINI_APP_URL) {
	console.error("❌ Error: BOT_TOKEN or MINI_APP_URL is not set in the environment or .env file.");
	process.exit(1); // Exit the process with an error code
}

const bot = new Telegraf(BOT_TOKEN);

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

// Start listening for updates
bot.launch();

console.log('Video Shop Bot is running...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
