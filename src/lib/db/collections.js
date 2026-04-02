import { ObjectId, Db, MongoClient } from 'mongodb';
import { getDatabase } from '../mongodb';

// Types for সমীকরণ শপ collections
;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

>;
  createdAt: Date;
  updatedAt: Date;
}

>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod: 'cash-on-delivery' | 'sslcommerz';
  transactionId?: string;
  shippingAddress: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    district: string;
    zip: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}







// User Collection Operations
export class UserCollection {
  db: Db;

  constructor(db) {
    this.db = db;
  }

  async create(userData, '_id' | 'createdAt' | 'updatedAt'>) {
    const user, '_id'> = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await this.db.collection('users').insertOne(user);
    return result.insertedId;
  }

  async findByEmail(email) {
    return await this.db.collection('users').findOne({ email });
  }

  async findById(id) {
    return await this.db.collection('users').findOne({ _id: new ObjectId(id) });
  }

  async updateById(id) {
    const result = await this.db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    );
    return result.modifiedCount > 0;
  }

  async deleteById(id) {
    const result = await this.db.collection('users').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async findAll(page = 1, limit = 20, search?) { users: User[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex, $options: 'i' } },
          { email: { $regex, $options: 'i' } }
        ]
      };
    }

    const [users, total] = await Promise.all([
      this.db.collection('users')
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.db.collection('users').countDocuments(query)
    ]);

    return {
      users,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  async getStats() { total: number; admins: number; newThisMonth: number }> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const [total, admins, newThisMonth] = await Promise.all([
      this.db.collection('users').countDocuments(),
      this.db.collection('users').countDocuments({ role: 'admin' }),
      this.db.collection('users').countDocuments({ createdAt: { $gte)
    ]);

    return { total, admins, newThisMonth };
  }
}

// Product Collection Operations
export class ProductCollection {
  db: Db;

  constructor(db) {
    this.db = db;
  }

  async create(productData, '_id' | 'createdAt' | 'updatedAt'>) {
    const product, '_id'> = {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await this.db.collection('products').insertOne(product);
    return result.insertedId;
  }

  async findBySlug(slug) {
    return await this.db.collection('products').findOne({ slug });
  }

  async findById(id) {
    return await this.db.collection('products').findOne({ _id: new ObjectId(id) });
  }

  async findAll(filters: {
    category?: string;
    badge?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  } = {}, sort: {
    field: string;
    order: 1 | -1;
  } = { field: 'createdAt', order: -1 }, page = 1, limit = 20) { products: Product[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    if (filters.category) query.category = filters.category;
    if (filters.badge) query.badge = filters.badge;
    if (filters.inStock) query.stock = { $gt: 0 };
    
    if (filters.search) {
      query.$or = [
        { name: { $regex, $options: 'i' } },
        { nameBn: { $regex, $options: 'i' } },
        { description: { $regex, $options: 'i' } }
      ];
    }
    
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    const [products, total] = await Promise.all([
      this.db.collection('products')
        .find(query)
        .sort({ [sort.field]: sort.order })
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.db.collection('products').countDocuments(query)
    ]);

    return {
      products,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  async updateById(id) {
    const result = await this.db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    );
    return result.modifiedCount > 0;
  }

  async deleteById(id) {
    const result = await this.db.collection('products').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async updateMany(productIds) { matched: number; modified: number }> {
    const objectIds = productIds.map(id => new ObjectId(id));
    
    const result = await this.db.collection('products').updateMany(
      { _id: { $in,
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    );
    
    return {
      matched,
      modified: result.modifiedCount
    };
  }

  async deleteMany(productIds) { deletedCount: number; requestedCount: number }> {
    const objectIds = productIds.map(id => new ObjectId(id));
    
    const result = await this.db.collection('products').deleteMany(
      { _id: { $in);
    
    return {
      deletedCount,
      requestedCount: productIds.length
    };
  }

  async getLowStock(threshold = 10) {
    return await this.db.collection('products')
      .find({ stock: { $lt)
      .sort({ stock: 1 })
      .toArray();
  }

  async getStats() { total: number; byCategory: Record; byBadge: Record; lowStock, lowStock] = await Promise.all([
      this.db.collection('products').countDocuments(),
      this.db.collection('products').aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]).toArray(),
      this.db.collection('products').aggregate([
        { $group: { _id: '$badge', count: { $sum: 1 } } }
      ]).toArray(),
      this.db.collection('products').countDocuments({ stock: { $lt: 10 } })
    ]);

    return {
      total,
      byCategory: byCategory.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byBadge: byBadge.reduce((acc, item) => ({ ...acc, [item._id || 'none']: item.count }), {}),
      lowStock
    };
  }
}

// Order Collection Operations
export class OrderCollection {
  db: Db;

  constructor(db) {
    this.db = db;
  }

  async create(orderData, '_id' | 'createdAt' | 'updatedAt'>) {
    // Generate unique order ID
    const orderId = this.generateOrderId();
    
    const order, '_id'> = {
      ...orderData,
      orderId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await this.db.collection('orders').insertOne(order);
    return result.insertedId;
  }

  generateOrderId() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${dateStr}-${random}`;
  }

  async findByOrderId(orderId) {
    return await this.db.collection('orders').findOne({ orderId });
  }

  async findById(id) {
    return await this.db.collection('orders').findOne({ _id: new ObjectId(id) });
  }

  async findByUserId(userId, page = 1, limit = 20) { orders: Order[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      this.db.collection('orders')
        .find({ userId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.db.collection('orders').countDocuments({ userId: new ObjectId(userId) })
    ]);

    return {
      orders,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  async findAll(filters: {
    status?: string;
    paymentStatus?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}, sort: {
    field: string;
    order: 1 | -1;
  } = { field: 'createdAt', order: -1 }, page = 1, limit = 20) { orders: Order[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    if (filters.status) query.status = filters.status;
    if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
    
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }
    
    if (filters.search) {
      query.$or = [
        { orderId: { $regex, $options: 'i' } },
        { 'shippingAddress.name': { $regex, $options: 'i' } },
        { 'shippingAddress.email': { $regex, $options: 'i' } },
        { 'shippingAddress.phone': { $regex, $options: 'i' } }
      ];
    }

    const [orders, total] = await Promise.all([
      this.db.collection('orders')
        .find(query)
        .sort({ [sort.field]: sort.order })
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.db.collection('orders').countDocuments(query)
    ]);

    return {
      orders,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  async updateStatus(id, status: Order['status']) {
    const result = await this.db.collection('orders').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date() 
        } 
      }
    );
    return result.modifiedCount > 0;
  }

  async updatePaymentStatus(id, paymentStatus: Order['paymentStatus']) {
    const result = await this.db.collection('orders').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          paymentStatus,
          updatedAt: new Date() 
        } 
      }
    );
    return result.modifiedCount > 0;
  }

  async deleteById(id) {
    const result = await this.db.collection('orders').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async getStats() { total: number; revenue: number; byStatus: Record; byPaymentStatus: Record }> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const [total, revenue, byStatus, byPaymentStatus] = await Promise.all([
      this.db.collection('orders').countDocuments(),
      this.db.collection('orders').aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id, total: { $sum: '$total' } } }
      ]).toArray(),
      this.db.collection('orders').aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray(),
      this.db.collection('orders').aggregate([
        { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
      ]).toArray()
    ]);

    return {
      total,
      revenue,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byPaymentStatus: byPaymentStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {})
    };
  }
}

// Settings Collection Operations
export class SettingsCollection {
  db: Db;

  constructor(db) {
    this.db = db;
  }

  async set(key) {
    await this.db.collection('settings').updateOne(
      { key },
      { 
        $set: { 
          value,
          updatedAt: new Date() 
        } 
      },
      { upsert);
  }

  async get(key) {
    const setting = await this.db.collection('settings').findOne({ key });
    return setting?.value;
  }

  async getAll() {
    const settings = await this.db.collection('settings').find({}).toArray();
    const result = {};
    
    settings.forEach(setting => {
      result[setting.key] = setting.value;
    });
    
    return result;
  }

  async delete(key) {
    const result = await this.db.collection('settings').deleteOne({ key });
    return result.deletedCount > 0;
  }
}

// Banners Collection Operations
export class BannersCollection {
  db: Db;

  constructor(db) {
    this.db = db;
  }

  async create(bannerData, '_id' | 'createdAt'>) {
    const banner, '_id'> = {
      ...bannerData,
      createdAt: new Date()
    };
    
    const result = await this.db.collection('banners').insertOne(banner);
    return result.insertedId;
  }

  async findAll(activeOnly = true) {
    let query = {};
    if (activeOnly) query = { active: true };
    
    return await this.db.collection('banners')
      .find(query)
      .sort({ order: 1, createdAt: -1 })
      .toArray();
  }

  async findById(id) {
    return await this.db.collection('banners').findOne({ _id: new ObjectId(id) });
  }

  async updateById(id) {
    const result = await this.db.collection('banners').updateOne(
      { _id: new ObjectId(id) },
      { $set);
    return result.modifiedCount > 0;
  }

  async deleteById(id) {
    const result = await this.db.collection('banners').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async reorder(bannerOrders: Array<{ id: string; order) {
    const bulkOps = bannerOrders.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: new ObjectId(id) },
        update: { $set: { order } }
      }
    }));

    const result = await this.db.collection('banners').bulkWrite(bulkOps);
    return result.modifiedCount === bannerOrders.length;
  }
}

// Newsletter Collection Operations
export class NewsletterCollection {
  db: Db;

  constructor(db) {
    this.db = db;
  }

  async subscribe(email) {
    const subscriber, '_id'> = {
      email,
      subscribedAt: new Date()
    };
    
    const result = await this.db.collection('newsletter').insertOne(subscriber);
    return result.insertedId;
  }

  async unsubscribe(email) {
    const result = await this.db.collection('newsletter').deleteOne({ email });
    return result.deletedCount > 0;
  }

  async isSubscribed(email) {
    const subscriber = await this.db.collection('newsletter').findOne({ email });
    return !!subscriber;
  }

  async findAll(page = 1, limit = 50) { subscribers: Subscriber[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    
    const [subscribers, total] = await Promise.all([
      this.db.collection('newsletter')
        .find({})
        .sort({ subscribedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.db.collection('newsletter').countDocuments()
    ]);

    return {
      subscribers,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  async getStats() { total: number; newThisMonth: number }> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const [total, newThisMonth] = await Promise.all([
      this.db.collection('newsletter').countDocuments(),
      this.db.collection('newsletter').countDocuments({ subscribedAt: { $gte)
    ]);

    return { total, newThisMonth };
  }
}

// Collection factory function
export async function getCollection(name: 'users' | 'products' | 'orders' | 'settings' | 'banners' | 'newsletter') {
  const db = await getDatabase();
  
  switch (name) {
    case 'users':
      return new UserCollection(db);
    case 'products':
      return new ProductCollection(db);
    case 'orders':
      return new OrderCollection(db);
    case 'settings':
      return new SettingsCollection(db);
    case 'banners':
      return new BannersCollection(db);
    case 'newsletter':
      return new NewsletterCollection(db);
    default:
      throw new Error(`Unknown collection: ${name}`);
  }
}

// Helper function to get all collections
export async function getAllCollections() {
  const db = await getDatabase();
  
  return {
    users: new UserCollection(db),
    products: new ProductCollection(db),
    orders: new OrderCollection(db),
    settings: new SettingsCollection(db),
    banners: new BannersCollection(db),
    newsletter: new NewsletterCollection(db)
  };
}
