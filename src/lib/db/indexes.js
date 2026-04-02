import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';

// Index creation utility
export class IndexManager {
  static async createAllIndexes() {
    try {
      const db = await getDb();
      
      console.log('🔧 Creating database indexes...');
      
      // Products collection indexes
      await this.createProductIndexes(db);
      
      // Orders collection indexes
      await this.createOrderIndexes(db);
      
      // Users collection indexes
      await this.createUserIndexes(db);
      
      // Categories collection indexes
      await this.createCategoryIndexes(db);
      
      // Reviews collection indexes
      await this.createReviewIndexes(db);
      
      // Wishlist collection indexes
      await this.createWishlistIndexes(db);
      
      // Newsletter collection indexes
      await this.createNewsletterIndexes(db);
      
      // Settings collection indexes
      await this.createSettingsIndexes(db);
      
      // Offers collection indexes
      await this.createOfferIndexes(db);
      
      console.log('✅ All database indexes created successfully');
      
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
      throw error;
    }
  }

  // Products collection indexes
  static async createProductIndexes(db) {
    const products = db.collection('products');
    
    // Text search index for products
    await products.createIndex({
      name: 'text',
      nameBn: 'text',
      description: 'text',
      descriptionBn: 'text',
      tags: 'text',
      category: 'text',
      brand: 'text'
    }, {
      name: 'product_text_search',
      default_language: 'none'
    });

    // Compound index for category and price filtering
    await products.createIndex({
      category: 1,
      price: 1,
      isActive: 1
    }, { name: 'category_price_active' });

    // Index for slug lookup
    await products.createIndex({ slug: 1 }, { unique, name: 'product_slug' });

    // Index for active products
    await products.createIndex({ isActive: 1 }, { name: 'product_active' });

    // Index for stock management
    await products.createIndex({ stock: 1 }, { name: 'product_stock' });

    // Index for sorting by price
    await products.createIndex({ price: 1 }, { name: 'product_price' });

    // Index for sorting by createdAt
    await products.createIndex({ createdAt: -1 }, { name: 'product_created_at' });

    // Index for sorting by rating
    await products.createIndex({ rating: -1 }, { name: 'product_rating' });

    // Index for sorting by popularity (sales count)
    await products.createIndex({ salesCount: -1 }, { name: 'product_sales_count' });

    console.log('✅ Products indexes created');
  }

  // Orders collection indexes
  static async createOrderIndexes(db) {
    const orders = db.collection('orders');
    
    // Index for user orders lookup
    await orders.createIndex({ userId: 1, createdAt: -1 }, { name: 'user_orders' });

    // Index for orderId lookup
    await orders.createIndex({ orderId: 1 }, { unique, name: 'order_id' });

    // Index for order status filtering
    await orders.createIndex({ status: 1, createdAt: -1 }, { name: 'order_status_date' });

    // Index for payment status filtering
    await orders.createIndex({ paymentStatus: 1, createdAt: -1 }, { name: 'payment_status_date' });

    // Index for order date range queries
    await orders.createIndex({ createdAt: -1 }, { name: 'order_created_at' });

    // Index for order total sorting
    await orders.createIndex({ total: -1 }, { name: 'order_total' });

    // Compound index for admin order management
    await orders.createIndex({
      status: 1,
      paymentStatus: 1,
      createdAt: -1
    }, { name: 'admin_order_management' });

    // Index for order status updates
    await orders.createIndex({ 'statusHistory.createdAt': -1 }, { name: 'status_history_date' });

    console.log('✅ Orders indexes created');
  }

  // Users collection indexes
  static async createUserIndexes(db) {
    const users = db.collection('users');
    
    // Unique index for email
    await users.createIndex({ email: 1 }, { unique, name: 'user_email' });

    // Index for phone numbers
    await users.createIndex({ phone: 1 }, { unique, name: 'user_phone' });

    // Index for role-based queries
    await users.createIndex({ role: 1 }, { name: 'user_role' });

    // Index for active users
    await users.createIndex({ isActive: 1 }, { name: 'user_active' });

    // Index for user registration date
    await users.createIndex({ createdAt: -1 }, { name: 'user_created_at' });

    // Index for last login
    await users.createIndex({ lastLogin: -1 }, { name: 'user_last_login' });

    // Text search index for user names
    await users.createIndex({
      name: 'text',
      nameBn: 'text'
    }, { name: 'user_name_search' });

    console.log('✅ Users indexes created');
  }

  // Categories collection indexes
  static async createCategoryIndexes(db) {
    const categories = db.collection('categories');
    
    // Unique index for slug
    await categories.createIndex({ slug: 1 }, { unique, name: 'category_slug' });

    // Index for active categories
    await categories.createIndex({ isActive: 1 }, { name: 'category_active' });

    // Index for sorting by order
    await categories.createIndex({ order: 1 }, { name: 'category_order' });

    // Index for parent-child relationships
    await categories.createIndex({ parentId: 1 }, { name: 'category_parent' });

    // Text search index for categories
    await categories.createIndex({
      name: 'text',
      nameBn: 'text',
      description: 'text',
      descriptionBn: 'text'
    }, { name: 'category_text_search' });

    console.log('✅ Categories indexes created');
  }

  // Reviews collection indexes
  static async createReviewIndexes(db) {
    const reviews = db.collection('reviews');
    
    // Index for product reviews
    await reviews.createIndex({ productId: 1, createdAt: -1 }, { name: 'product_reviews' });

    // Index for user reviews
    await reviews.createIndex({ userId: 1, createdAt: -1 }, { name: 'user_reviews' });

    // Index for rating sorting
    await reviews.createIndex({ rating: -1 }, { name: 'review_rating' });

    // Index for verified reviews
    await reviews.createIndex({ isVerified: 1 }, { name: 'review_verified' });

    // Index for review date
    await reviews.createIndex({ createdAt: -1 }, { name: 'review_created_at' });

    // Compound index for product rating aggregation
    await reviews.createIndex({
      productId: 1,
      rating: 1,
      isVerified: 1
    }, { name: 'product_rating_aggregation' });

    console.log('✅ Reviews indexes created');
  }

  // Wishlist collection indexes
  static async createWishlistIndexes(db) {
    const wishlist = db.collection('wishlist');
    
    // Index for user wishlist items
    await wishlist.createIndex({ userId: 1, createdAt: -1 }, { name: 'user_wishlist' });

    // Index for product wishlists
    await wishlist.createIndex({ productId: 1 }, { name: 'product_wishlist' });

    // Unique index to prevent duplicates
    await wishlist.createIndex(
      { userId: 1, productId: 1 },
      { unique, name: 'wishlist_user_product' }
    );

    console.log('✅ Wishlist indexes created');
  }

  // Newsletter collection indexes
  static async createNewsletterIndexes(db) {
    const newsletter = db.collection('newsletter_subscribers');
    
    // Unique index for email
    await newsletter.createIndex({ email: 1 }, { unique, name: 'newsletter_email' });

    // Index for active subscribers
    await newsletter.createIndex({ isActive: 1 }, { name: 'newsletter_active' });

    // Index for subscription date
    await newsletter.createIndex({ subscribedAt: -1 }, { name: 'newsletter_subscribed_at' });

    console.log('✅ Newsletter indexes created');
  }

  // Settings collection indexes
  static async createSettingsIndexes(db) {
    const settings = db.collection('settings');
    
    // Single document collection - no indexes needed
    console.log('✅ Settings collection (single document)');
  }

  // Offers collection indexes
  static async createOfferIndexes(db) {
    const offers = db.collection('offers');
    
    // Index for active offers
    await offers.createIndex({ isActive: 1 }, { name: 'offer_active' });

    // Index for offer date range
    await offers.createIndex({
      startDate: 1,
      endDate: 1
    }, { name: 'offer_date_range' });

    // Index for offer type
    await offers.createIndex({ type: 1 }, { name: 'offer_type' });

    // Index for offer creation date
    await offers.createIndex({ createdAt: -1 }, { name: 'offer_created_at' });

    // Compound index for valid offers
    await offers.createIndex({
      isActive: 1,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }, { name: 'valid_offers' });

    console.log('✅ Offers indexes created');
  }
}

// Query optimization utilities
export class QueryOptimizer {
  // Optimized product search
  static async searchProducts(
    db,
    filters: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      minRating?: number;
      inStock?: boolean;
    } = {},
    sort: {
      field: string;
      order: 1 | -1;
    } = { field: 'createdAt', order: -1 },
    limit: number = 20,
    skip: number = 0
  ) {
    const products = db.collection('products');
    
    // Build search query
    const searchQuery = {
      isActive: true
    };

    // Add text search if query provided
    if (query) {
      searchQuery.$text = { $search: query };
    }

    // Add filters
    if (filters.category) {
      searchQuery.category = filters.category;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      searchQuery.price = {};
      if (filters.minPrice !== undefined) {
        searchQuery.price.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        searchQuery.price.$lte = filters.maxPrice;
      }
    }

    if (filters.minRating !== undefined) {
      searchQuery.rating = { $gte: filters.minRating };
    }

    if (filters.inStock) {
      searchQuery.stock = { $gt: 0 };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort.field] = sort.order;

    // Add text search score if searching
    if (query) {
      sortObj.score = { $meta: 'textScore' };
    }

    // Execute optimized query
    const pipeline = [
      { $match: searchQuery }
    ];

    // Add text search score projection if searching
    if (query) {
      pipeline.push({
        $addFields: {
          score: { $meta: 'textScore' }
        }
      });
    }

    // Add sorting
    pipeline.push({ $sort);

    // Add pagination
    pipeline.push(
      { $skip,
      { $limit);

    // Add total count for pagination
    const [results, countResult] = await Promise.all([
      products.aggregate(pipeline).toArray(),
      products.countDocuments(searchQuery)
    ]);

    return {
      products,
      hasMore: skip + limit < countResult
    };
  }

  // Optimized user order lookup
  static async getUserOrders(
    db,
    limit: number = 20,
    skip: number = 0
  ) {
    const orders = db.collection('orders');
    
    const query = { userId: new ObjectId(userId) };
    if (status) {
      query.status = status;
    }

    const [ordersData, total] = await Promise.all([
      orders
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      orders.countDocuments(query)
    ]);

    return {
      orders,
      hasMore: skip + limit < total
    };
  }

  // Optimized admin order management
  static async getAdminOrders(
    db,
    filters: {
      status?: string;
      paymentStatus?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    } = {},
    sort: {
      field: string;
      order: 1 | -1;
    } = { field: 'createdAt', order: -1 },
    limit: number = 20,
    skip: number = 0
  ) {
    const orders = db.collection('orders');
    
    // Build query
    const query = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.paymentStatus) {
      query.paymentStatus = filters.paymentStatus;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    if (filters.search) {
      query.$or = [
        { orderId: { $regex, $options: 'i' } },
        { 'customer.name': { $regex, $options: 'i' } },
        { 'customer.email': { $regex, $options: 'i' } }
      ];
    }

    // Build sort
    const sortObj = {};
    sortObj[sort.field] = sort.order;

    // Execute query with aggregation for better performance
    const pipeline = [
      { $match,
      { $sort,
      {
        $facet: {
          orders: [
            { $skip,
            { $limit,
          total: [
            { $count: 'count' }
          ]
        }
      }
    ];

    const result = await orders.aggregate(pipeline).toArray();
    const ordersData = result[0];

    return {
      orders,
      hasMore: skip + limit < (ordersData.total[0]?.count || 0)
    };
  }

  // Optimized product statistics aggregation
  static async getProductStats(db) {
    const products = db.collection('products');
    const orders = db.collection('orders');
    const reviews = db.collection('reviews');

    const pipeline = [
      {
        $facet: {
          totalProducts: [
            { $match: { isActive,
            { $count: 'count' }
          ],
          lowStockProducts: [
            { $match: { isActive, stock: { $lt: 10 } } },
            { $count: 'count' }
          ],
          outOfStockProducts: [
            { $match: { isActive,
            { $count: 'count' }
          ],
          topRatedProducts: [
            { $match: { isActive, rating: { $gte: 4 } } },
            { $sort: { rating: -1 } },
            { $limit: 10 }
          ],
          bestSellingProducts: [
            { $match: { isActive,
            { $sort: { salesCount: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ];

    const result = await products.aggregate(pipeline).toArray();
    return result[0];
  }

  // Optimized order statistics aggregation
  static async getOrderStats(db, days: number = 30) {
    const orders = db.collection('orders');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte,
      {
        $facet: {
          totalOrders: [
            { $count: 'count' }
          ],
          totalRevenue: [
            { $group: { _id, total: { $sum: '$total' } } }
          ],
          ordersByStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          ordersByPaymentStatus: [
            { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
          ],
          dailyOrders: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 },
                revenue: { $sum: '$total' }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ];

    const result = await orders.aggregate(pipeline).toArray();
    return result[0];
  }
}

// Connection pool management
export class ConnectionPool {
  static maxPoolSize = 10;
  static minPoolSize = 2;
  static maxIdleTimeMS = 30000;
  static serverSelectionTimeoutMS = 5000;
  static socketTimeoutMS = 45000;

  static getMongoOptions() {
    return {
      maxPoolSize,
      readPreference: 'primary',
      readConcern: { level: 'majority' },
      writeConcern: { w: 'majority', j: true }
    };
  }

  static async testConnection(db) {
    try {
      await db.admin().ping();
      console.log('✅ Database connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }

  static async getConnectionStats(db) {
    try {
      const admin = db.admin();
      const serverStatus = await admin.serverStatus();
      const connections = serverStatus.connections;
      
      return {
        current,
        active: connections.active
      };
    } catch (error) {
      console.error('❌ Failed to get connection stats:', error);
      return null;
    }
  }
}
