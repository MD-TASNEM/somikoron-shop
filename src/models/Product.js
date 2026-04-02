import { Db, ObjectId } from 'mongodb';







export class ProductService {
  db: Db;
  collectionName = 'products';

  constructor(db) {
    this.db = db;
  }

  // Create indexes for better performance
  async createIndexes() {
    const collection = this.db.collection(this.collectionName);
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ price: 1 });
    await collection.createIndex({ rating: -1 });
    await collection.createIndex({ featured: 1, bestSeller: 1, isNew: 1 });
    await collection.createIndex({
      name: 'text',
      namebn: 'text',
      description: 'text'
    });
  }

  // Create a new product
  async create(productData) {
    const collection = this.db.collection(this.collectionName);
    const now = new Date();

    const product, '_id' | 'id'> = {
      ...productData,
      rating: 0,
      reviews: 0,
      featured,
      updatedAt: now
    };

    // Auto-set badge based on boolean flags
    if (product.featured) {
      product.badge = 'featured';
    } else if (product.bestSeller) {
      product.badge = 'best-seller';
    } else if (product.isNew) {
      product.badge = 'new';
    }

    const result = await collection.insertOne(product);
    const createdProduct = await this.findById(result.insertedId);

    if (!createdProduct) {
      throw new Error('Failed to create product');
    }

    return createdProduct;
  }

  // Find product by ID
  async findById(id) {
    const collection = this.db.collection(this.collectionName);
    const _id = typeof id === 'string' ? new ObjectId(id) : id;

    const product = await collection.findOne({ _id });
    return product ? this.transformProduct(product) : null;
  }

  // Get all products with optional filtering
  async findAll(options: {
    page?: number;
    limit?: number;
    category?: string;
    featured?: boolean;
    bestSeller?: boolean;
    isNew?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    products: Product[];
    total: number;
    page: number;
    pages: number;
  }> {
    const {
      page = 1,
      limit = 20,
      category,
      featured,
      bestSeller,
      isNew,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const collection = this.db.collection(this.collectionName);
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (featured !== undefined) {
      filter.featured = featured;
    }

    if (bestSeller !== undefined) {
      filter.bestSeller = bestSeller;
    }

    if (isNew !== undefined) {
      filter.isNew = isNew;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries
    const products = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(filter);

    return {
      products: products.map(p => this.transformProduct(p)),
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  // Update a product
  async update(id) {
    const collection = this.db.collection(this.collectionName);
    const _id = typeof id === 'string' ? new ObjectId(id) : id;

    const updateDoc = {
      $set: {
        ...updateData,
        updatedAt: new Date()
      }
    };

    // Auto-set badge based on boolean flags
    if (updateData.featured !== undefined || updateData.bestSeller !== undefined || updateData.isNew !== undefined) {
      const currentProduct = await this.findById(_id);
      if (currentProduct) {
        const featured = updateData.featureed ?? currentProduct.featured;
        const bestSeller = updateData.bestSeller ?? currentProduct.bestSeller;
        const isNew = updateData.isNew ?? currentProduct.isNew;

        if (featured) {
          updateDoc.$set.badge = 'featured';
        } else if (bestSeller) {
          updateDoc.$set.badge = 'best-seller';
        } else if (isNew) {
          updateDoc.$set.badge = 'new';
        } else {
          updateDoc.$set.badge = null;
        }
      }
    }

    const result = await collection.updateOne({ _id }, updateDoc);

    if (result.matchedCount === 0) {
      return null;
    }

    return this.findById(_id);
  }

  // Delete a product
  async delete(id) {
    const collection = this.db.collection(this.collectionName);
    const _id = typeof id === 'string' ? new ObjectId(id) : id;

    const result = await collection.deleteOne({ _id });
    return result.deletedCount > 0;
  }

  // Get products by category
  async findByCategory(category) {
    return this.findAll({ category }).then(result => result.products);
  }

  // Get featured products
  async getFeatured(limit: number = 8) {
    return this.findAll({ featured).then(result => result.products);
  }

  // Get best sellers
  async getBestSellers(limit: number = 8) {
    return this.findAll({ bestSeller).then(result => result.products);
  }

  // Get new products
  async getNewProducts(limit: number = 8) {
    return this.findAll({ isNew).then(result => result.products);
  }

  // Update product rating
  async updateRating(id) {
    const collection = this.db.collection(this.collectionName);
    const _id = typeof id === 'string' ? new ObjectId(id) : id;

    const product = await this.findById(_id);
    if (!product) {
      return null;
    }

    const newReviews = product.reviews + 1;
    const updatedRating = ((product.rating * product.reviews) + newRating) / newReviews;

    await collection.updateOne(
      { _id },
      {
        $set: {
          rating: Math.round(updatedRating * 10) / 10, // Round to 1 decimal place
          reviews,
          updatedAt: new Date()
        }
      }
    );

    return this.findById(_id);
  }

  // Search products
  async search(query, options: {
    page?: number;
    limit?: number;
    category?: string;
  } = {}) {
    products: Product[];
    total: number;
    page: number;
    pages: number;
  }> {
    return this.findAll({
      ...options,
      search);
  }

  // Transform product data to include id field
  transformProduct(product) {
      ...product,
      id: product._id?.toString()
    };
  }
}
