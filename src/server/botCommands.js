import { Product } from './database.js';

/**
 * Register bot commands including /start and /products.
 * @param {object} bot - Telegram bot instance (must support `.start(handler)` and `ctx.reply`).
 * @param {string} MINI_APP_URL - URL used by the inline button's `web_app` to open the catalog.
 */
export function setupBotCommands(bot, MINI_APP_URL) {
    bot.start(async (ctx) => {
        const userName = ctx.from.first_name || 'valued customer';
        const welcomeMessage = `👋 Welcome, ${userName}, to the Product Shop!
Click the button below to open the catalog.`;

        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '🚀 Open Catalog',
                        web_app: {
                            url: MINI_APP_URL
                        }
                    }],
                    [{
                        text: '📦 View Products',
                        callback_data: 'view_products'
                    }]
                ]
            }
        };

        await ctx.reply(welcomeMessage, keyboard);
    });

    bot.action('view_products', async (ctx) => {
        try {
            await ctx.answerCbQuery();

            const products = await Product.find({});
            console.log(`Found ${products.length} products`);

            if (products.length === 0) {
                await ctx.reply('No products available at the moment.');
                return;
            }

            await ctx.reply('📦 *Available Products:*\n', { parse_mode: 'Markdown' });

            for (const product of products) {
                const caption = `*${product.title}*\n\n${product.description}\n\n💰 Price: *$${product.price}*`;

                if (product.thumbnail) {
                    try {
                        console.log(`Sending photo for ${product.title}: ${product.thumbnail}`);
                        await ctx.replyWithPhoto(product.thumbnail, {
                            caption: caption,
                            parse_mode: 'Markdown'
                        });
                    } catch (photoError) {
                        console.error(`Failed to send photo for ${product.title}:`, photoError.message);
                        // Fallback to text if image fails
                        await ctx.reply(`📦 ${caption}`, { parse_mode: 'Markdown' });
                    }
                } else {
                    await ctx.reply(`📦 ${caption}`, { parse_mode: 'Markdown' });
                }
            }
        } catch (error) {
            console.error('Error in view_products handler:', error);
            await ctx.reply('Sorry, there was an error loading the products. Please try again later.');
        }
    });

    bot.help(async (ctx) => {
        const helpMessage = `📖 *Available Commands:*

/start - Open the main menu
/help - Show this help message
/products - View all products

You can also send me any message and I'll respond!`;

        await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
    });

    bot.command('products', async (ctx) => {
        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '🚀 Open Catalog',
                        web_app: {
                            url: MINI_APP_URL
                        }
                    }],
                    [{
                        text: '📦 View Products',
                        callback_data: 'view_products'
                    }]
                ]
            }
        };

        await ctx.reply('Choose how you want to view products:', keyboard);
    });

    bot.on('text', async (ctx) => {
        const message = ctx.message.text.toLowerCase();

        // Ignore commands that are already handled
        if (message.startsWith('/')) {
            return;
        }

        // Simple response with menu
        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '🚀 Open Catalog',
                        web_app: {
                            url: MINI_APP_URL
                        }
                    }],
                    [{
                        text: '📦 View Products',
                        callback_data: 'view_products'
                    }]
                ]
            }
        };

        await ctx.reply(
            `👋 Hi! I received your message: "${ctx.message.text}"\n\nUse the buttons below to browse products or send /help for more options.`,
            keyboard
        );
    });
}