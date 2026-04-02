import { Db, ObjectId } from 'mongodb';



;
  phone: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

;
  phone: string;
  paymentMethod: 'cash-on-delivery' | 'bank-transfer' | 'sslcommerz' | 'whatsapp';
  notes?: string;
}



export class OrderService {
  db: Db;
  collectionName = 'orders';

  constructor(db) {
    this.db = db;
  }

  // Create indexes for better performance
  async createIndexes() {
    const collection = this.db.collection(this.collectionName);
    await collection.createIndex({ user: 1 });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ paymentStatus: 1 });
    await collection.createIndex({ createdAt: -1 });
    await collection.createIndex({ transactionId: 1 }, { sparse);
  }

  // Create a new order
  async create(orderData) {
    const collection = this.db.collection(this.collectionName);
    const now = new Date();

    // Calculate total from items
    const total = orderData.items.reduce((sum, item) => sum + item.total, 0);

    const order, '_id' | 'id'> = {
      ...orderData,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt,
      updatedAt: now
    };

    const result = await collection.insertOne(order);
    const createdOrder = await this.findById(result.insertedId);
    
    if (!createdOrder) {
      throw new Error('Failed to create order');
    }
    
    return createdOrder;
  }

  // Find order by ID
  async findById(id) {
    const collection = this.db.collection(this.collectionName);
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    
    const order = await collection.findOne({ _id });
    return order ? this.transformOrder(order) : null;
  }

  // Find orders by user ID
  async findByUserId(userId, options: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    orders: Order[];
    total: number;
    page: number;
    pages: number;
  }> {
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const collection = this.db.collection(this.collectionName);
    const skip = (page - 1) * limit;
    const _id = typeof userId === 'string' ? new ObjectId(userId) : userId;

    // Build filter
    const filter = { user: _id };
    
    if (status) {
      filter.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries
    const orders = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(filter);

    return {
      orders: orders.map(o => this.transformOrder(o)),
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  // Get all orders with optional filtering
  async findAll(options: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    startDate?: Date;
    endDate?: Date;
  } = {}) {
    orders: Order[];
    total: number;
    page: number;
    pages: number;
  }> {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      paymentMethod,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate
    } = options;

    const collection = this.db.collection(this.collectionName);
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }
    
    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    if (search) {
      filter.$or = [
        { transactionId: { $regex, $options: 'i' } },
        { phone: { $regex, $options: 'i' } },
        { 'shippingAddress.city': { $regex, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries
    const orders = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(filter);

    return {
      orders: orders.map(o => this.transformOrder(o)),
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  // Update an order
  async update(id) {
    const collection = this.db.collection(this.collectionName);
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    
    const updateDoc = {
      $set: {
        ...updateData,
        updatedAt: new Date()
      }
    };

    const result = await collection.updateOne({ _id }, updateDoc);
    
    if (result.matchedCount === 0) {
      return null;
    }
    
    return this.findById(_id);
  }

  // Update order status
  async updateStatus(id, status: Order['status']) {
    return this.update(id, { status });
  }

  // Update payment status
  async updatePaymentStatus(id, paymentStatus: Order['paymentStatus'], transactionId?) {
    return this.update(id, { paymentStatus, transactionId });
  }

  // Delete an order
  async delete(id) {
    const collection = this.db.collection(this.collectionName);
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.deleteOne({ _id });
    return result.deletedCount > 0;
  }

  // Get order statistics
  async getOrderStatistics() {
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    refunded: number;
    totalRevenue: number;
    paidRevenue: number;
  }> {
    const collection = this.db.collection(this.collectionName);

    const [
      total,
      pending,
      confirmed,
      processing,
      shipped,
      delivered,
      cancelled,
      refunded,
      totalRevenueResult,
      paidRevenueResult
    ] = await Promise.all([
      collection.countDocuments(),
      collection.countDocuments({ status: 'pending' }),
      collection.countDocuments({ status: 'confirmed' }),
      collection.countDocuments({ status: 'processing' }),
      collection.countDocuments({ status: 'shipped' }),
      collection.countDocuments({ status: 'delivered' }),
      collection.countDocuments({ status: 'cancelled' }),
      collection.countDocuments({ status: 'refunded' }),
      collection.aggregate([
        { $group: { _id, total: { $sum: '$total' } } }
      ]).toArray(),
      collection.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id, total: { $sum: '$total' } } }
      ]).toArray()
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const paidRevenue = paidRevenueResult[0]?.total || 0;

    return {
      total,
      pending,
      confirmed,
      processing,
      shipped,
      delivered,
      cancelled,
      refunded,
      totalRevenue,
      paidRevenue
    };
  }

  // Get recent orders
  async getRecentOrders(limit: number = 10) {
    const collection = this.db.collection(this.collectionName);
    
    const orders = await collection
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return orders.map(o => this.transformOrder(o));
  }

  // Find order by transaction ID
  async findByTransactionId(transactionId) {
    const collection = this.db.collection(this.collectionName);
    
    const order = await collection.findOne({ transactionId });
    return order ? this.transformOrder(order) : null;
  }

  // Transform order data to include id field
  transformOrder(order) {
      ...order,
      id: order._id?.toString()
    };
  }
}
