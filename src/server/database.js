import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Establishes a connection to the MongoDB instance specified by the MONGO_URL environment variable.
 *
 * Attempts to connect using the database name "marketBot". If the connection fails, the underlying
 * error is rethrown.
 *
 * @throws {Error} The error raised while attempting to connect to MongoDB.
 */
export async function connectDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URL, { dbName: 'marketBot' });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
}

const productSchema = new mongoose.Schema({}, { strict: false });
export const Product = mongoose.model('Product', productSchema, 'products');