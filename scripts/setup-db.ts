#!/usr/bin/env node

import { MongoClient, Db, ObjectId } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'somikoron-shop';

async function setupDatabase() {
  console.log('🚀 Setting up সমীকরণ শপ database...');

  let client: MongoClient | undefined;
  let db: Db;

  try {
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(MONGODB_DB);
    console.log('✅ Connected to MongoDB successfully');

    // Create collections and indexes
    console.log('📊 Creating collections and indexes...');

    // Users collection
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ createdAt: -1 });
    await db.collection('users').createIndex({ 'resetPasswordToken': 1 }, { sparse: true });
    console.log('✅ Users collection indexes created');

    // Products collection
    await db.collection('products').createIndex({ slug: 1 }, { unique: true });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ badge: 1 });
    await db.collection('products').createIndex({ price: 1 });
    await db.collection('products').createIndex({ rating: -1 });
    await db.collection('products').createIndex({ createdAt: -1 });
    await db.collection('products').createIndex({ stock: 1 });
    await db.collection('products').createIndex({
      name: 'text',
      nameBn: 'text',
      description: 'text'
    }, {
      name: 'product_text_search',
      default_language: 'none'
    });
    console.log('✅ Products collection indexes created');

    // Orders collection
    await db.collection('orders').createIndex({ orderId: 1 }, { unique: true });
    await db.collection('orders').createIndex({ userId: 1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('orders').createIndex({ paymentStatus: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });
    await db.collection('orders').createIndex({ transactionId: 1 }, { sparse: true });
    console.log('✅ Orders collection indexes created');

    // Settings collection
    await db.collection('settings').createIndex({ key: 1 }, { unique: true });
    console.log('✅ Settings collection indexes created');

    // Banners collection
    await db.collection('banners').createIndex({ order: 1 });
    await db.collection('banners').createIndex({ active: 1 });
    await db.collection('banners').createIndex({ createdAt: -1 });
    console.log('✅ Banners collection indexes created');

    // Newsletter collection
    await db.collection('newsletter').createIndex({ email: 1 }, { unique: true });
    await db.collection('newsletter').createIndex({ subscribedAt: -1 });
    console.log('✅ Newsletter collection indexes created');

    // Insert initial settings
    console.log('⚙️ Inserting initial settings...');
    const settings = [
      { key: 'whatsapp', value: '+8801996570203', updatedAt: new Date() },
      { key: 'hotline', value: '01996-570203', updatedAt: new Date() },
      { key: 'email', value: 'muttasimbillah.9@gmail.com', updatedAt: new Date() },
      { key: 'address', value: 'Islamic University, Bangladesh Main Gate, Jhenaidah, Kushtia', updatedAt: new Date() },
      { key: 'google_maps_url', value: 'https://maps.google.com/?q=Islamic+University+Bangladesh', updatedAt: new Date() },
      { key: 'site_name', value: 'সমীকরণ শপ', updatedAt: new Date() },
      { key: 'site_description', value: 'সমীকরণ শপ - কাস্টমাইজড পণ্যের একমাত্র ঠিকানা', updatedAt: new Date() },
      { key: 'meta_title', value: 'সমীকরণ শপ | কাস্টমাইজড পণ্যের একমাত্র ঠিকানা', updatedAt: new Date() },
      { key: 'meta_description', value: 'সমীকরণ শপে আপনি পাবেন কাপ, প্লেট, ফটো ফ্রেম, নিকাহ নামা, কলম, স্কেল সহ সব ধরনের কাস্টমাইজড পণ্য', updatedAt: new Date() },
      { key: 'meta_keywords', value: 'সমীকরণ শপ, কাস্টমাইজড পণ্য, কাপ, প্লেট, ফটো ফ্রেম, নিকাহ নামা, কলম, স্কেল, বাংলাদেশ', updatedAt: new Date() }
    ];

    await db.collection('settings').insertMany(settings);
    console.log('✅ Initial settings inserted');

    // Insert sample products
    console.log('🛍️ Inserting sample products...');
    const products = [
      {
        name: 'Custom Photo Frame',
        nameBn: 'কাস্টম ফটো ফ্রেম',
        slug: 'custom-photo-frame',
        price: 299,
        originalPrice: 399,
        category: 'photo-frames',
        badge: 'featured',
        images: [
          '/images/products/photo-frame-1.jpg',
          '/images/products/photo-frame-2.jpg'
        ],
        description: 'Beautiful custom photo frame with your favorite memories. Perfect for home decoration and gifts.',
        stock: 25,
        rating: 4.5,
        reviews: [
          {
            userId: new ObjectId(),
            rating: 5,
            comment: 'Excellent quality frame!',
            createdAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Nikah Nama Cover',
        nameBn: 'নিকাহ নামা কভার',
        slug: 'nikah-nama-cover',
        price: 199,
        category: 'nikah-nama',
        badge: 'best-seller',
        images: [
          '/images/products/nikah-nama-1.jpg',
          '/images/products/nikah-nama-2.jpg'
        ],
        description: 'Elegant Nikah Nama cover with beautiful Islamic designs. Perfect for your special day.',
        stock: 50,
        rating: 4.8,
        reviews: [
          {
            userId: new ObjectId(),
            rating: 5,
            comment: 'Beautiful design and quality!',
            createdAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Custom Coffee Mug',
        nameBn: 'কাস্টম কফি মগ',
        slug: 'custom-coffee-mug',
        price: 149,
        originalPrice: 199,
        category: 'cups',
        badge: 'new',
        images: [
          '/images/products/mug-1.jpg',
          '/images/products/mug-2.jpg'
        ],
        description: 'Personalized coffee mug with your favorite photo or design. Start your day with memories!',
        stock: 100,
        rating: 4.3,
        reviews: [
          {
            userId: new ObjectId(),
            rating: 4,
            comment: 'Good quality mug',
            createdAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Custom Dinner Plate',
        nameBn: 'কাস্টম ডিনার প্লেট',
        slug: 'custom-dinner-plate',
        price: 249,
        category: 'plates',
        images: [
          '/images/products/plate-1.jpg',
          '/images/products/plate-2.jpg'
        ],
        description: 'Beautiful custom dinner plate with your design. Perfect for special occasions and gifts.',
        stock: 30,
        rating: 4.6,
        reviews: [
          {
            userId: new ObjectId(),
            rating: 5,
            comment: 'Amazing quality and design!',
            createdAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Custom File Folder',
        nameBn: 'কাস্টম ফাইল ফোল্ডার',
        slug: 'custom-file-folder',
        price: 99,
        category: 'files',
        badge: 'sale',
        images: [
          '/images/products/folder-1.jpg',
          '/images/products/folder-2.jpg'
        ],
        description: 'Organize your documents in style with custom file folders. Perfect for office and home use.',
        stock: 75,
        rating: 4.2,
        reviews: [
          {
            userId: new ObjectId(),
            rating: 4,
            comment: 'Good quality folder',
            createdAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Custom Pen',
        nameBn: 'কাস্টম পেন',
        slug: 'custom-pen',
        price: 79,
        category: 'pens',
        images: [
          '/images/products/pen-1.jpg',
          '/images/products/pen-2.jpg'
        ],
        description: 'Write in style with custom pens featuring your design or logo. Perfect for gifts and promotions.',
        stock: 150,
        rating: 4.4,
        reviews: [
          {
            userId: new ObjectId(),
            rating: 5,
            comment: 'Great pen, writes smoothly!',
            createdAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Custom Scale',
        nameBn: 'কাস্টম স্কেল',
        slug: 'custom-scale',
        price: 129,
        category: 'scales',
        images: [
          '/images/products/scale-1.jpg',
          '/images/products/scale-2.jpg'
        ],
        description: 'Custom measuring scale with your design. Perfect for students and professionals.',
        stock: 60,
        rating: 4.1,
        reviews: [
          {
            userId: new ObjectId(),
            rating: 4,
            comment: 'Good quality scale',
            createdAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Custom T-Shirt',
        nameBn: 'কাস্টম টি-শার্ট',
        slug: 'custom-t-shirt',
        price: 399,
        originalPrice: 499,
        category: 't-shirts',
        badge: 'featured',
        images: [
          '/images/products/tshirt-1.jpg',
          '/images/products/tshirt-2.jpg'
        ],
        description: 'Custom printed T-shirt with your design. Available in multiple sizes and colors.',
        stock: 80,
        rating: 4.7,
        reviews: [
          {
            userId: new ObjectId(),
            rating: 5,
            comment: 'Excellent print quality!',
            createdAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.collection('products').insertMany(products);
    console.log('✅ Sample products inserted');

    // Insert sample banners
    console.log('🖼️ Inserting sample banners...');
    const banners = [
      {
        image: '/images/banners/banner-1.jpg',
        title: 'Custom Photo Frames',
        description: 'Preserve your memories with our beautiful custom photo frames',
        link: '/products?category=photo-frames',
        order: 1,
        active: true,
        createdAt: new Date()
      },
      {
        image: '/images/banners/banner-2.jpg',
        title: 'Nikah Nama Covers',
        description: 'Elegant designs for your special day',
        link: '/products?category=nikah-nama',
        order: 2,
        active: true,
        createdAt: new Date()
      },
      {
        image: '/images/banners/banner-3.jpg',
        title: 'Custom Mugs & Plates',
        description: 'Personalized items for your home',
        link: '/products?category=cups',
        order: 3,
        active: true,
        createdAt: new Date()
      }
    ];

    await db.collection('banners').insertMany(banners);
    console.log('✅ Sample banners inserted');

    // Create admin user (password: admin123)
    console.log('👤 Creating admin user...');
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = {
      name: 'Admin',
      email: 'admin@somikoron-shop.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await db.collection('users').insertOne(adminUser);
      console.log('✅ Admin user created (email: admin@somikoron-shop.com, password: admin123)');
    } catch (error: unknown) {
      if (error instanceof Error && (error as any).code === 11000) {
        console.log('ℹ️ Admin user already exists');
      } else {
        throw error;
      }
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`✅ Database: ${MONGODB_DB}`);
    console.log('✅ Collections created: users, products, orders, settings, banners, newsletter');
    console.log('✅ Indexes created for optimal performance');
    console.log('✅ Sample data inserted');
    console.log('✅ Admin user created');
    console.log('\n🚀 You can now start the application!');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase().catch(console.error);
}

export default setupDatabase;
