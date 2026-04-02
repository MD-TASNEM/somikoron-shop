import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export class UserCollection {
  constructor(db) {
    this.collection = db.collection('users');
  }

  async hashPassword(password) {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(password, hashed) {
    return bcrypt.compare(password, hashed);
  }

  async create(userData) {
    const existing = await this.collection.findOne({ email: userData.email });
    if (existing) throw new Error('User with this email already exists');
    const hashed = await this.hashPassword(userData.password);
    const doc = { ...userData, password: hashed, role: userData.role || 'user', createdAt: new Date() };
    const result = await this.collection.insertOne(doc);
    return this.collection.findOne({ _id: result.insertedId });
  }

  async findById(id) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    return this.collection.findOne({ _id });
  }

  async findByEmail(email) {
    return this.collection.findOne({ email }, { projection: { password: 0 } });
  }

  async findByEmailWithPassword(email) {
    return this.collection.findOne({ email });
  }

  async update(id, data) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    if (data.password) data.password = await this.hashPassword(data.password);
    await this.collection.updateOne({ _id }, { $set: { ...data, updatedAt: new Date() } });
    return this.findById(_id);
  }

  async delete(id) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await this.collection.deleteOne({ _id });
    return result.deletedCount > 0;
  }

  async findAll({ page = 1, limit = 20, role, search, sortBy = 'createdAt', sortOrder = 'desc' } = {}) {
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.collection.find(filter, { projection: { password: 0 } }).sort(sort).skip(skip).limit(limit).toArray(),
      this.collection.countDocuments(filter),
    ]);
    return { users, total, page, pages: Math.ceil(total / limit) };
  }

  async getStats() {
    const [total, users, admins] = await Promise.all([
      this.collection.countDocuments(),
      this.collection.countDocuments({ role: 'user' }),
      this.collection.countDocuments({ role: 'admin' }),
    ]);
    return { total, users, admins };
  }

  getCollection() { return this.collection; }
}

export default UserCollection;
