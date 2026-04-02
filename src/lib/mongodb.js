import { MongoClient } from 'mongodb';

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'somikoron_shop';

if (!MONGODB_URI) {
  throw new Error('❌ Please add MONGODB_URI to .env.local');
}

// Connection options for production-grade setup
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  writeConcern: { w: 'majority' },
  readConcern: { level: 'majority' }
};

// Global cache for connection (prevents multiple connections)
let cachedClient = null;
let cachedDb = null;

/**
 * Connect to MongoDB database with connection pooling
 * @returns {Promise<{client: MongoClient, db: any}>}
 */
export async function connectToDatabase() {
  try {
    // Return cached connection if available
    if (cachedClient && cachedDb) {
      return { client: cachedClient, db: cachedDb };
    }

    console.log('🔄 Connecting to MongoDB...');
    const client = new MongoClient(MONGODB_URI, options);

    await client.connect();
    console.log('✅ Successfully connected to MongoDB');

    // Cache the connection
    cachedClient = client;
    cachedDb = client.db(MONGODB_DB);

    return { client: cachedClient, db: cachedDb };
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

/**
 * Get database instance (uses cached connection)
 * @returns {Promise<any>}
 */
export async function getDatabase() {
  const { db } = await connectToDatabase();
  return db;
}

/**
 * Get MongoDB client instance (uses cached connection)
 * @returns {Promise<MongoClient>}
 */
export async function getClient() {
  const { client } = await connectToDatabase();
  return client;
}

/**
 * Get collection from database
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<any>}
 */
export async function getCollection(collectionName) {
  const db = await getDatabase();
  return db.collection(collectionName);
}

/**
 * Check if MongoDB is connected
 * @returns {boolean}
 */
export function isConnected() {
  return cachedClient !== null && cachedDb !== null;
}

/**
 * Test database connection with ping
 * @returns {Promise<boolean>}
 */
export async function testConnection() {
  try {
    const db = await getDatabase();
    await db.admin().ping();
    console.log('🏓 MongoDB ping successful');
    return true;
  } catch (error) {
    console.error('❌ MongoDB ping failed:', error.message);
    return false;
  }
}

/**
 * Get database statistics
 * @returns {Promise<any>}
 */
export async function getDatabaseStats() {
  try {
    const db = await getDatabase();
    const stats = await db.stats();
    return stats;
  } catch (error) {
    console.error('❌ Error getting database stats:', error.message);
    throw error;
  }
}

/**
 * List all collections in the database
 * @returns {Promise<string[]>}
 */
export async function listCollections() {
  try {
    const db = await getDatabase();
    const collections = await db.listCollections().toArray();
    return collections.map(collection => collection.name);
  } catch (error) {
    console.error('❌ Error listing collections:', error.message);
    throw error;
  }
}

/**
 * Create database indexes for better performance
 */
export async function createIndexes() {
    const db = await getDatabase();

    // Product indexes
    const productsCollection = db.collection('products');
    await productsCollection.createIndex({ category: 1 });
    await productsCollection.createIndex({ price: 1 });
    await productsCollection.createIndex({ rating: -1 });
    await productsCollection.createIndex({ featured: 1, bestSeller: 1, isNew: 1 });
    await productsCollection.createIndex({
      name: 'text',
      namebn: 'text',
      description: 'text'
    });

    // User indexes
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique);
    await usersCollection.createIndex({ role: 1 });
    await usersCollection.createIndex({ createdAt: -1 });

    // Order indexes
    const ordersCollection = db.collection('orders');
    await ordersCollection.createIndex({ user: 1 });
    await ordersCollection.createIndex({ status: 1 });
    await ordersCollection.createIndex({ paymentStatus: 1 });
    await ordersCollection.createIndex({ createdAt: -1 });
    await ordersCollection.createIndex({ transactionId: 1 }, { sparse);

    console.log('📊 Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating database indexes:', error);
    throw error;
  }
}

/**
 * Handle graceful shutdown
 */
export async function gracefulShutdown() {
  console.log('🔄 Starting graceful shutdown...');
  try {
    await closeConnection();
    console.log('✅ Graceful shutdown completed');
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Setup graceful shutdown handlers
if (typeof process !== 'undefined') {
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
  process.on('beforeExit', gracefulShutdown);
}

// Export types for use in other files

// Create an object with all functions for default export
const mongodbUtils = {
  connectToDatabase,
  getDatabase,
  getClient,
  closeConnection,
  isConnected,
  testConnection,
  getDatabaseStats,
  listCollections,
  createIndexes,
  gracefulShutdown
};

// Default export for convenience
export default mongodbUtils;
