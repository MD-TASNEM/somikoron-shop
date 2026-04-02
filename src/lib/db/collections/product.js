import { ObjectId } from 'mongodb';

export class ProductCollection {
  constructor(db) {
    this.collection = db.collection('products');
  }

  async findById(id) {
    try {
      return this.collection.findOne({ _id: new ObjectId(id) });
    } catch { return null; }
  }

  async findBySlug(slug) {
    return this.collection.findOne({ slug });
  }

  async create(data) {
    const now = new Date();
    const result = await this.collection.insertOne({ ...data, rating: 0, reviews: [], createdAt: now, updatedAt: now });
    return this.collection.findOne({ _id: result.insertedId });
  }

  async update(id, data) {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  }

  async delete(id) {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  transformProduct(product) {
    const { _id, ...rest } = product;
    return { ...rest, id: _id.toString() };
  }
}
