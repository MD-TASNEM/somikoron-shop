import { ObjectId } from 'mongodb';

export class OrderCollection {
  constructor(db) {
    this.collection = db.collection('orders');
  }

  generateOrderId() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const r = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${y}${m}${d}-${r}`;
  }

  async create(orderData) {
    const now = new Date();
    const orderId = this.generateOrderId();
    const subtotal = orderData.subtotal ?? orderData.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax = orderData.tax ?? Math.round(subtotal * 0.15);
    const shippingCost = orderData.shippingCost ?? (subtotal > 1000 ? 0 : 60);
    const discount = orderData.discount || 0;
    const total = subtotal + tax + shippingCost - discount;

    const order = {
      orderId,
      userId: orderData.userId ? new ObjectId(orderData.userId) : undefined,
      items: orderData.items.map((i) => ({ ...i, productId: new ObjectId(i.productId) })),
      subtotal, tax, shippingCost, discount, total,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: orderData.paymentMethod,
      shippingAddress: orderData.shippingAddress,
      notes: orderData.notes,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(order);
    return { ...order, _id: result.insertedId };
  }

  async findById(id) {
    try { return this.collection.findOne({ _id: new ObjectId(id) }); } catch { return null; }
  }

  async findByOrderId(orderId) {
    return this.collection.findOne({ orderId });
  }

  async update(id, data) {
    const set = { ...data, updatedAt: new Date() };
    if (data.status === 'shipped') set.shippedAt = new Date();
    if (data.status === 'delivered') set.deliveredAt = new Date();
    if (data.status === 'cancelled') set.cancelledAt = new Date();
    return this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: set },
      { returnDocument: 'after' }
    );
  }

  async delete(id) {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async search({ userId, status, paymentStatus, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', search, orderId } = {}) {
    const query = {};
    if (userId) query.userId = new ObjectId(userId);
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (orderId) query.orderId = orderId;
    if (search) query.$or = [
      { orderId: { $regex: search, $options: 'i' } },
      { 'shippingAddress.name': { $regex: search, $options: 'i' } },
      { 'shippingAddress.email': { $regex: search, $options: 'i' } },
    ];
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.collection.find(query).sort(sort).skip(skip).limit(limit).toArray(),
      this.collection.countDocuments(query),
    ]);
    const pages = Math.ceil(total / limit);
    return { orders, total, page, pages, hasNext: page < pages, hasPrev: page > 1 };
  }

  async updateStatus(id, status, transactionId, trackingNumber) {
    return this.update(id, { status, transactionId, trackingNumber });
  }

  async updatePaymentStatus(id, paymentStatus, transactionId) {
    return this.update(id, { paymentStatus, transactionId, ...(paymentStatus === 'paid' ? { status: 'processing' } : {}) });
  }

  async cancelOrder(id, reason) {
    return this.update(id, { status: 'cancelled', ...(reason ? { notes: `Cancelled: ${reason}` } : {}) });
  }

  async getRecentOrders(limit = 10) {
    return this.collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
  }

  async getStats(userId) {
    const match = userId ? { userId: new ObjectId(userId) } : {};
    const stats = await this.collection.aggregate([
      { $match: match },
      { $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        paidOrders: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } },
      }},
    ]).toArray();
    return stats[0] || {};
  }

  transformOrder(order) {
    const { _id, ...rest } = order;
    return { ...rest, id: _id.toString() };
  }
}
