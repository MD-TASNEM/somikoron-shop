import { getCollection } from './mongodb.js';
import { ObjectId } from 'mongodb';

/**
 * USERS COLLECTION HELPERS
 */
export const Users = {
  async create(userData) {
    const users = await getCollection('users');
    const result = await users.insertOne(userData);
    return result.insertedId;
  },

  async findByEmail(email) {
    const users = await getCollection('users');
    return users.findOne({ email });
  },

  async findById(id) {
    const users = await getCollection('users');
    return users.findOne({ _id: new ObjectId(id) });
  },

  async update(id, updates) {
    const users = await getCollection('users');
    const result = await users.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return result.modifiedCount;
  },

  async delete(id) {
    const users = await getCollection('users');
    return users.deleteOne({ _id: new ObjectId(id) });
  },

  async getAll(page = 1, limit = 10) {
    const users = await getCollection('users');
    const skip = (page - 1) * limit;
    const data = await users
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    const total = await users.countDocuments();
    return { data, total, pages: Math.ceil(total / limit) };
  }
};

/**
 * PRODUCTS COLLECTION HELPERS
 */
export const Products = {
  async create(productData) {
    const products = await getCollection('products');
    const result = await products.insertOne({
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result.insertedId;
  },

  async findBySlug(slug) {
    const products = await getCollection('products');
    return products.findOne({ slug });
  },

  async findById(id) {
    const products = await getCollection('products');
    return products.findOne({ _id: new ObjectId(id) });
  },

  async update(id, updates) {
    const products = await getCollection('products');
    return products.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  },

  async delete(id) {
    const products = await getCollection('products');
    return products.deleteOne({ _id: new ObjectId(id) });
  },

  async getAll(filters = {}, page = 1, limit = 12) {
    const products = await getCollection('products');
    const skip = (page - 1) * limit;

    const query = {};
    if (filters.category) query.category = filters.category;
    if (filters.badge) query.badge = filters.badge;

    const data = await products
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await products.countDocuments(query);
    return { data, total, pages: Math.ceil(total / limit) };
  }
};

/**
 * ORDERS COLLECTION HELPERS
 */
export const Orders = {
  async create(orderData) {
    const orders = await getCollection('orders');
    const result = await orders.insertOne({
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result.insertedId;
  },

  async findById(id) {
    const orders = await getCollection('orders');
    return orders.findOne({ _id: new ObjectId(id) });
  },

  async findByOrderId(orderId) {
    const orders = await getCollection('orders');
    return orders.findOne({ orderId });
  },

  async update(id, updates) {
    const orders = await getCollection('orders');
    return orders.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  },

  async getAll(filters = {}, page = 1, limit = 10) {
    const orders = await getCollection('orders');
    const skip = (page - 1) * limit;

    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.userId) query.userId = new ObjectId(filters.userId);

    const data = await orders
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await orders.countDocuments(query);
    return { data, total, pages: Math.ceil(total / limit) };
  }
};

/**
 * SETTINGS COLLECTION HELPERS
 */
export const Settings = {
  async get(key) {
    const settings = await getCollection('settings');
    return settings.findOne({ key });
  },

  async set(key, value) {
    const settings = await getCollection('settings');
    return settings.updateOne(
      { key },
      { $set: { value, updatedAt: new Date() } },
      { upsert: true }
    );
  },

  async getAll() {
    const settings = await getCollection('settings');
    const docs = await settings.find({}).toArray();
    return docs.reduce((acc, doc) => ({
      ...acc,
      [doc.key]: doc.value
    }), {});
  }
};

    // Create all indexes
    await Promise.all([
      productService.createIndexes(),
      userService.createIndexes(),
      orderService.createIndexes()
    ]);

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Seed data function
export async function seedDatabase() {
    const db = await getDatabase();
    const { ProductService } = await import('../models/Product');

    const productService = new ProductService(db);

    // Check if products already exist
    const existingProducts = await productService.findAll({ limit: 1 });
    if (existingProducts.total > 0) {
      console.log('Database already seeded');
      return;
    }

    // Seed products
    const seedProducts = [
      {
        name: 'Customized Photo Frame',
        namebn: 'কাস্টমাইজড ফটো ফ্রেম',
        price: 12.99,
        originalPrice: 15.99,
        category: 'photo-frames',
        badge: 'featured''/images/products/photo-frame-1.jpg'],
        description: 'Beautiful customized photo frame perfect for your memories.',
        stock: 50,
        featured,
      {
        name: 'Elegant Nikah Nama Cover',
        namebn: 'সুন্দর নিকাহ নামা কভার',
        price: 25.99,
        category: 'nikah-nama',
        badge: 'best-seller''/images/products/nikah-nama-1.jpg'],
        description: 'Elegant nikah nama cover with beautiful designs.',
        stock: 30,
        featured,
      {
        name: 'Personalized Coffee Mug',
        namebn: 'ব্যক্তিগতকৃত কফি মাগ',
        price: 8.99,
        category: 'cups',
        badge: 'featured''/images/products/mug-1.jpg'],
        description: 'High-quality coffee mug with personalized design.',
        stock: 100,
        featured,
      {
        name: 'Ceramic Dinner Plate Set',
        namebn: 'সিরামিক ডিনার প্লেট সেট',
        price: 35.50,
        category: 'plates',
        badge: 'new''/images/products/plate-1.jpg'],
        description: 'Beautiful ceramic dinner plate set for your dining table.',
        stock: 25,
        featured,
      {
        name: 'Premium File Folder',
        namebn: 'প্রিমিয়াম ফাইল ফোল্ডার',
        price: 6.99,
        category: 'files',
        badge: 'best-seller''/images/products/file-1.jpg'],
        description: 'Durable and stylish file folder for office use.',
        stock: 75,
        featured,
      {
        name: 'Custom Engraved Pen',
        namebn: 'কাস্টম খোদাই করা কলম',
        price: 4.99,
        category: 'pens',
        badge: 'best-seller''/images/products/pen-1.jpg'],
        description: 'Premium quality pen with custom engraving.',
        stock: 200,
        featured,
      {
        name: 'Engineering Scale Set',
        namebn: 'ইঞ্জিনিয়ারিং স্কেল সেট',
        price: 14.99,
        category: 'scales',
        badge: 'featured''/images/products/scale-1.jpg'],
        description: 'Professional engineering scale set for students.',
        stock: 40,
        featured,
      {
        name: 'Wooden Photo Frame',
        namebn: 'কাঠের ফটো ফ্রেম',
        price: 18.99,
        category: 'photo-frames',
        badge: 'best-seller''/images/products/wooden-frame-1.jpg'],
        description: 'Classic wooden photo frame with elegant finish.',
        stock: 35,
        featured,
        isNew: false
      }
    ];

    for (const product of seedProducts) {
      await productService.create(product);
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
