/**
 * Register a /start handler that greets the user and sends an inline "Open Catalog" web-app button.
 * @param {object} bot - Telegram bot instance (must support `.start(handler)` and `ctx.reply`).
 * @param {string} MINI_APP_URL - URL used by the inline button's `web_app` to open the catalog.
 */
export function setupBotCommands(bot, MINI_APP_URL) {
    bot.start(async (ctx) => {
        const userName = ctx.from.first_name || 'valued customer';
        const welcomeMessage = `👋 Welcome, ${userName}, to the Product Shop!
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
}