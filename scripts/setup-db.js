import { connectToDatabase, getCollection } from "../src/lib/mongodb.js";
import { ObjectId } from "mongodb";
import bcryptjs from "bcryptjs";

const categories = [
  "photo-frames",
  "nikah-nama",
  "cups",
  "plates",
  "files",
  "pens",
  "scales",
];
const badges = ["featured", "best-seller", "new", "sale"];

/**
 * Generate slug from product name
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Initialize all database collections and indexes
 */
async function setupDatabase() {
  try {
    console.log("🚀 Starting Database Setup...\n");

    const { db } = await connectToDatabase();
    console.log("✅ Connected to MongoDB\n");

    // ============= COLLECTIONS =============
    console.log("📋 Creating Collections...");

    const collections = [
      "users",
      "products",
      "orders",
      "settings",
      "banners",
      "newsletter",
      "offers",
    ];

    for (const collectionName of collections) {
      const exists = await db
        .listCollections({ name: collectionName })
        .toArray();
      if (exists.length === 0) {
        await db.createCollection(collectionName);
        console.log(`  ✓ Created collection: ${collectionName}`);
      } else {
        console.log(`  ✓ Collection already exists: ${collectionName}`);
      }
    }
    console.log("");

    // ============= INDEXES =============
    console.log("🔑 Creating Indexes...");

    // Users indexes
    const usersCol = await getCollection("users");
    await usersCol.createIndex({ email: 1 }, { unique: true });
    await usersCol.createIndex({ role: 1 });
    console.log("  ✓ Users indexes created");

    // Products indexes
    const productsCol = await getCollection("products");
    await productsCol.createIndex({ slug: 1 }, { unique: true });
    await productsCol.createIndex({ category: 1 });
    await productsCol.createIndex({ badge: 1 });
    await productsCol.createIndex({ price: 1 });
    console.log("  ✓ Products indexes created");

    // Orders indexes
    const ordersCol = await getCollection("orders");
    await ordersCol.createIndex({ orderId: 1 }, { unique: true });
    await ordersCol.createIndex({ userId: 1 });
    await ordersCol.createIndex({ status: 1 });
    await ordersCol.createIndex({ createdAt: -1 });
    console.log("  ✓ Orders indexes created");

    // Settings indexes
    const settingsCol = await getCollection("settings");
    await settingsCol.createIndex({ key: 1 }, { unique: true });
    console.log("  ✓ Settings indexes created");

    // Newsletter indexes
    const newsletterCol = await getCollection("newsletter");
    await newsletterCol.createIndex({ email: 1 }, { unique: true });
    console.log("  ✓ Newsletter indexes created");

    console.log("");

    // ============= INITIAL DATA =============
    console.log("📦 Inserting Initial Data...\n");

    // Check if already populated
    const userCount = await usersCol.countDocuments();
    const productCount = await productsCol.countDocuments();

    if (userCount === 0) {
      console.log("👤 Creating Admin User...");
      const hashedPassword = await bcryptjs.hash("admin123", 10);
      await usersCol.insertOne({
        name: "Admin User",
        email: "admin@somikoron.com",
        password: hashedPassword,
        role: "admin",
        phone: "01996570203",
        address: {
          street: "Islamic University",
          city: "Kushtia",
          district: "Kushtia",
          zip: "9000",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(
        "  ✓ Admin user created (email: admin@somikoron.com, password: admin123)\n",
      );
    } else {
      console.log("✓ Users already exist, skipping admin creation\n");
    }

    if (productCount === 0) {
      console.log("🛍️  Creating Sample Products...");
      const sampleProducts = [
        {
          name: "Customized Photo Frame",
          nameBn: "কাস্টমাইজড ফটো ফ্রেম",
          slug: generateSlug("Customized Photo Frame"),
          price: 12.99,
          originalPrice: 19.99,
          category: "photo-frames",
          badge: "featured",
          images: ["https://via.placeholder.com/500x500?text=Photo+Frame"],
          description: "Beautiful personalized photo frame with custom designs",
          stock: 25,
          rating: 4.5,
          reviews: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Elegant Nikah Nama Cover",
          nameBn: "মার্জিত নিকাহ নামা কভার",
          slug: generateSlug("Elegant Nikah Nama Cover"),
          price: 25.99,
          originalPrice: 35.0,
          category: "nikah-nama",
          badge: "best-seller",
          images: ["https://via.placeholder.com/500x500?text=Nikah+Nama"],
          description: "Premium customized nikah nama cover with embroidery",
          stock: 15,
          rating: 4.8,
          reviews: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Personalized Coffee Mug",
          nameBn: "ব্যক্তিগত কফি মগ",
          slug: generateSlug("Personalized Coffee Mug"),
          price: 8.99,
          originalPrice: 12.0,
          category: "cups",
          badge: "featured",
          images: ["https://via.placeholder.com/500x500?text=Coffee+Mug"],
          description: "High-quality ceramic mug with custom photo printing",
          stock: 50,
          rating: 4.6,
          reviews: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Ceramic Dinner Plate Set",
          nameBn: "সিরামিক ডিনার প্লেট সেট",
          slug: generateSlug("Ceramic Dinner Plate Set"),
          price: 35.5,
          originalPrice: 45.0,
          category: "plates",
          badge: "new",
          images: ["https://via.placeholder.com/500x500?text=Plate+Set"],
          description: "Set of 4 personalized ceramic dinner plates",
          stock: 10,
          rating: 4.3,
          reviews: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Premium File Folder",
          nameBn: "প্রিমিয়াম ফাইল ফোল্ডার",
          slug: generateSlug("Premium File Folder"),
          price: 6.99,
          originalPrice: 9.99,
          category: "files",
          badge: "best-seller",
          images: ["https://via.placeholder.com/500x500?text=File+Folder"],
          description: "Durable customizable file folder for office and school",
          stock: 100,
          rating: 4.2,
          reviews: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Custom Engraved Pen",
          nameBn: "কাস্টম এনগ্রেভড পেন",
          slug: generateSlug("Custom Engraved Pen"),
          price: 4.99,
          originalPrice: 7.0,
          category: "pens",
          badge: "best-seller",
          images: ["https://via.placeholder.com/500x500?text=Pen"],
          description: "Premium ballpoint pen with personalized engraving",
          stock: 200,
          rating: 4.4,
          reviews: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Engineering Scale Set",
          nameBn: "ইঞ্জিনিয়ারিং স্কেল সেট",
          slug: generateSlug("Engineering Scale Set"),
          price: 14.99,
          originalPrice: 19.99,
          category: "scales",
          badge: "featured",
          images: ["https://via.placeholder.com/500x500?text=Scale+Set"],
          description:
            "Professional scale set for engineering and technical drawing",
          stock: 30,
          rating: 4.5,
          reviews: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Wooden Photo Frame",
          nameBn: "কাঠের ফটো ফ্রেম",
          slug: generateSlug("Wooden Photo Frame"),
          price: 18.99,
          originalPrice: 24.99,
          category: "photo-frames",
          badge: "best-seller",
          images: ["https://via.placeholder.com/500x500?text=Wooden+Frame"],
          description: "Handcrafted wooden photo frame with premium finish",
          stock: 20,
          rating: 4.7,
          reviews: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await productsCol.insertMany(sampleProducts);
      console.log(`  ✓ Inserted ${sampleProducts.length} sample products\n`);
    } else {
      console.log("✓ Products already exist, skipping sample insertion\n");
    }

    // Settings
    const settingsCount = await settingsCol.countDocuments();
    if (settingsCount === 0) {
      console.log("⚙️  Creating Settings...");
      const settings = [
        { key: "whatsapp", value: "+8801996570203", updatedAt: new Date() },
        { key: "hotline", value: "01996-570203", updatedAt: new Date() },
        {
          key: "email",
          value: "muttasimbillah.9@gmail.com",
          updatedAt: new Date(),
        },
        {
          key: "address",
          value: "Islamic University, Bangladesh Main Gate, Jhenaidah, Kushtia",
          updatedAt: new Date(),
        },
      ];
      await settingsCol.insertMany(settings);
      console.log("  ✓ Settings created\n");
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Database Setup Complete!\n");
    console.log("📊 Summary:");
    console.log(`  • Collections: ${collections.join(", ")}`);
    console.log(`  • Users: ${await usersCol.countDocuments()}`);
    console.log(`  • Products: ${await productsCol.countDocuments()}`);
    console.log(`  • Orders: ${await ordersCol.countDocuments()}`);
    console.log(`  • Settings: ${await settingsCol.countDocuments()}`);
    console.log("\n🎯 Next Steps:");
    console.log("  1. Run: npm run dev");
    console.log("  2. Visit: http://localhost:3000");
    console.log("  3. Login: admin@somikoron.com / admin123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("❌ Setup Failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run setup
setupDatabase();
