import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import morgan from "morgan";
import SslCommerzPayment from "sslcommerz-lts";
import nodemailer from "nodemailer";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "somikoron_shop";
const JWT_SECRET = process.env.JWT_SECRET || "somikoron_secret_key_123";

// Email Configuration
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_USER = process.env.EMAIL_USER || "your-email@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "your-app-password";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@somikoron.com";

// Email Transporter Setup
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Email Templates
const generateBuyerInvoiceEmail = (order, user) => {
  const items = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">৳${item.price}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">৳${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Invoice - Somikoron Shop</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Somikoron Shop</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Order Invoice</p>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <div style="margin-bottom: 30px;">
          <h2 style="color: #374151; margin-bottom: 15px;">Order Details</h2>
          <p style="color: #6b7280; margin: 5px 0;"><strong>Order ID:</strong> ${order._id}</p>
          <p style="color: #6b7280; margin: 5px 0;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p style="color: #6b7280; margin: 5px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">${order.status}</span></p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #374151; margin-bottom: 15px;">Customer Information</h3>
          <p style="color: #6b7280; margin: 5px 0;"><strong>Name:</strong> ${user.name}</p>
          <p style="color: #6b7280; margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
          <p style="color: #6b7280; margin: 5px 0;"><strong>Phone:</strong> ${user.phone}</p>
          <p style="color: #6b7280; margin: 5px 0;"><strong>Address:</strong> ${order.shippingAddress}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #374151;">Product</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb; color: #374151;">Quantity</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #374151;">Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #374151;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 12px; text-align: right; border-top: 2px solid #e5e7eb; font-weight: bold; color: #374151;">Subtotal:</td>
              <td style="padding: 12px; text-align: right; border-top: 2px solid #e5e7eb; color: #374151;">৳${order.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 12px; text-align: right; color: #6b7280;">Shipping:</td>
              <td style="padding: 12px; text-align: right; color: #6b7280;">৳${order.shippingCost.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold; color: #374151;">Total:</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; color: #374151; font-size: 18px;">৳${order.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; text-align: center;">
          <p style="color: #16a34a; margin: 0; font-weight: bold;">Thank you for your order!</p>
          <p style="color: #16a34a; margin: 5px 0 0 0;">We'll send you updates on your order status.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateAdminNotificationEmail = (order, user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order - Somikoron Shop</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🔔 New Order Alert</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Somikoron Shop</p>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: #374151; margin-bottom: 20px;">New Order Received</h2>

        <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <p style="color: #92400e; margin: 0; font-weight: bold;">Order ID: ${order._id}</p>
          <p style="color: #92400e; margin: 5px 0 0 0;">Time: ${new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; margin-bottom: 10px;">Customer Details:</h3>
          <p style="color: #6b7280; margin: 5px 0;"><strong>Name:</strong> ${user.name}</p>
          <p style="color: #6b7280; margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
          <p style="color: #6b7280; margin: 5px 0;"><strong>Phone:</strong> ${user.phone}</p>
          <p style="color: #6b7280; margin: 5px 0;"><strong>Address:</strong> ${order.shippingAddress}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; margin-bottom: 10px;">Order Summary:</h3>
          <p style="color: #6b7280; margin: 5px 0;"><strong>Items:</strong> ${order.items.length} products</p>
          <p style="color: #6b7280; margin: 5px 0;"><strong>Total Amount:</strong> <span style="color: #059669; font-weight: bold; font-size: 18px;">৳${order.totalAmount.toFixed(2)}</span></p>
          <p style="color: #6b7280; margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p style="color: #6b7280; margin: 5px 0;"><strong>Payment Status:</strong> <span style="color: #10b981; font-weight: bold;">${order.paymentStatus}</span></p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="https://somikoron-shop.vercel.app/admin" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Order in Admin Panel</a>
        </div>
      </div>
    </body>
    </html>
  `;
};

// MongoDB Connection
let db;
const connectDB = async () => {
  if (db) return db;
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(MONGODB_DB);
    console.log("Connected to MongoDB");
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// SSLCommerz Configuration
const sslcommerz = new SslCommerzPayment(
  process.env.SSLCOMMERZ_STORE_ID || "somik123",
  process.env.SSLCOMMERZ_STORE_PASSWORD || "somik123",
  process.env.NODE_ENV !== "production",
  process.env.NODE_ENV !== "production"
    ? "https://sandbox.sslcommerz.com"
    : "https://securepay.sslcommerz.com",
);

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Admin Middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Utility Functions
const calculateShippingCost = (subtotal) => {
  return subtotal > 0 ? (subtotal >= 1000 ? 0 : 60) : 0;
};

// API Routes

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Somikoron Shop API Server",
    status: "Running",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      debug: "/api/debug",
      products: "/api/products",
      auth: "/api/auth",
      orders: "/api/orders",
      payment: "/api/payment",
      admin: "/api/admin",
    },
    documentation: "https://somikoron-shop-server.vercel.app/api/debug",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Debug endpoint
app.get("/api/debug", (req, res) => {
  res.json({
    message: "Somikoron Shop API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const db = await connectDB();

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      name,
      email,
      password: hashedPassword,
      phone,
      role: "customer",
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(user);
    const createdUser = { ...user, _id: result.insertedId };
    delete createdUser.password;

    // Generate JWT
    const token = jwt.sign(
      { userId: result.insertedId, email, role: "customer" },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({ user: createdUser, token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await connectDB();

    // Find user
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Products Routes
app.get("/api/products", async (req, res) => {
  try {
    const db = await connectDB();
    const { category, search, limit = 20, page = 1 } = req.query;

    let query = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await db
      .collection("products")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection("products").countDocuments(query);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Orders Routes
app.post("/api/orders", async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const db = await connectDB();

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const shippingCost = calculateShippingCost(subtotal);
    const totalAmount = subtotal + shippingCost;

    // Create order
    const order = {
      userId: req.user?.userId || null,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      totalAmount,
      status: "pending",
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      createdAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(order);
    const createdOrder = { ...order, _id: result.insertedId };

    // Send email notifications
    try {
      if (req.user?.userId) {
        const user = await db
          .collection("users")
          .findOne({ _id: new ObjectId(req.user.userId) });

        if (user) {
          // Send invoice to customer
          await transporter.sendMail({
            from: EMAIL_USER,
            to: user.email,
            subject: `Order Confirmation - Somikoron Shop (Order: ${result.insertedId})`,
            html: generateBuyerInvoiceEmail(createdOrder, user),
          });

          // Send notification to admin
          await transporter.sendMail({
            from: EMAIL_USER,
            to: ADMIN_EMAIL,
            subject: `New Order Alert - Somikoron Shop (${result.insertedId})`,
            html: generateAdminNotificationEmail(createdOrder, user),
          });
        }
      }
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// SSLCommerz Payment Routes
app.post("/api/payment/init", async (req, res) => {
  try {
    const { orderId, amount, customer_name, customer_email, customer_phone } =
      req.body;

    const data = {
      total_amount: amount,
      currency: "BDT",
      tran_id: orderId,
      success_url: `${req.protocol}://${req.get("host")}/api/payment/success`,
      fail_url: `${req.protocol}://${req.get("host")}/api/payment/fail`,
      cancel_url: `${req.protocol}://${req.get("host")}/api/payment/cancel`,
      ipn_url: `${req.protocol}://${req.get("host")}/api/payment/ipn`,
      shipping_method: "Courier",
      product_name: "Somikoron Shop Products",
      product_category: "General",
      product_profile: "general",
      cus_name: customer_name,
      cus_email: customer_email,
      cus_add1: "Customer Address",
      cus_city: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: customer_phone,
      ship_name: customer_name,
      ship_add1: "Customer Address",
      ship_city: "Dhaka",
      ship_postcode: "1000",
      ship_country: "Bangladesh",
    };

    sslcommerz.init(data).then((data) => {
      if (data?.GatewayPageURL) {
        res.json(data);
      } else {
        res.status(400).json({ error: "Payment initialization failed" });
      }
    });
  } catch (error) {
    console.error("Payment init error:", error);
    res.status(500).json({ error: "Payment initialization failed" });
  }
});

app.post("/api/payment/success", async (req, res) => {
  try {
    const { tran_id } = req.body;
    const db = await connectDB();

    // Update order status
    await db.collection("orders").updateOne(
      { _id: new ObjectId(tran_id) },
      {
        $set: {
          status: "processing",
          paymentStatus: "paid",
          updatedAt: new Date(),
        },
      },
    );

    res.redirect(
      `${process.env.FRONTEND_URL || "https://somikoron-shop.vercel.app"}/payment/success?order=${tran_id}`,
    );
  } catch (error) {
    console.error("Payment success error:", error);
    res.status(500).json({ error: "Payment processing failed" });
  }
});

// Admin Routes
app.get(
  "/api/admin/orders",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const db = await connectDB();
      const { page = 1, limit = 20, status } = req.query;

      let query = {};
      if (status) {
        query.status = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const orders = await db
        .collection("orders")
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();

      const total = await db.collection("orders").countDocuments(query);

      res.json({
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get admin orders error:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  },
);

app.put(
  "/api/admin/orders/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const db = await connectDB();
      const { status } = req.body;

      const result = await db.collection("orders").updateOne(
        { _id: new ObjectId(req.params.id) },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        },
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json({ message: "Order status updated successfully" });
    } catch (error) {
      console.error("Update order error:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  },
);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
