import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'somikoron-shop';

if (!MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let cachedClient = null;
let cachedDb = null;
let connectionPromise = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb };
  if (connectionPromise) return connectionPromise;

  connectionPromise = new Promise((resolve, reject) => {
    const client = new MongoClient(MONGODB_URI, options);
    client.connect()
      .then((c) => {
        const db = c.db(MONGODB_DB);
        cachedClient = c;
        cachedDb = db;
        resolve({ client: c, db });
      })
      .catch((err) => {
        connectionPromise = null;
        reject(err);
      });
  });

  return connectionPromise;
}

export async function getDb() {
  const { db } = await connectToDatabase();
  return db;
}

export async function getCollection(name) {
  const db = await getDb();
  return db.collection(name);
}

export async function closeConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    connectionPromise = null;
  }
}

export default connectToDatabase;
