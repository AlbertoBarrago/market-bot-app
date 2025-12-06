import express from 'express';
import { Product } from './database.js';

/**
 * Create and configure an Express application with CORS headers, a products API route, bot webhook middleware, and static file serving.
 *
 * The GET /api/products endpoint responds with a JSON array of all Product documents where each item has an `id` string derived from `_id` (the original `_id` is removed). On failure that route responds with status 500 and `{ error: <message> }`.
 *
 * @param {object} bot - Bot instance exposing `webhookCallback(path)` middleware.
 * @param {string} WEBHOOK_PATH - Path at which the bot webhook middleware is mounted.
 * @param {string} DIST_PATH - Filesystem directory served as static assets.
 * @returns {import('express').Application} The configured Express application.
 */
export function setupEndpoints(bot, WEBHOOK_PATH, DIST_PATH) {
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
            res.status(500).json({ error: e.message });
        }
    });

    app.use(bot.webhookCallback(WEBHOOK_PATH));
    app.use(express.static(DIST_PATH));

    return app;
}