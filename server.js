import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import morgan from "morgan";
import SslCommerzPayment from "sslcommerz-lts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "somikoron_shop";
const JWT_SECRET = process.env.JWT_SECRET || "somikoron_secret_key_123";

// SSLCOMMERZ Configuration
const SSLCOMMERZ_STORE_ID = process.env.SSLCOMMERZ_STORE_ID;
const SSLCOMMERZ_STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD;
const SSLCOMMERZ_IS_LIVE = process.env.SSLCOMMERZ_IS_LIVE === "true";
const SSLCOMMERZ_SUCCESS_URL =
  process.env.SSLCOMMERZ_SUCCESS_URL || "http://localhost:3000/payment/success";
const SSLCOMMERZ_FAIL_URL =
  process.env.SSLCOMMERZ_FAIL_URL || "http://localhost:3000/payment/fail";
const SSLCOMMERZ_CANCEL_URL =
  process.env.SSLCOMMERZ_CANCEL_URL || "http://localhost:3000/payment/cancel";

let db;
let lastConnectionError = null;
let retryCount = 0;
const MAX_RETRIES = 5; // Increased retries

async function connectToDatabase() {
  const maskedUri = MONGODB_URI.replace(/\/\/.*:.*@/, "//***:***@");
  console.log(`Attempting to connect to MongoDB: ${maskedUri}`);

  if (MONGODB_URI === "mongodb://localhost:27017") {
    console.warn(
      "WARNING: Using default MONGODB_URI (localhost). If you are using MongoDB Atlas, please set MONGODB_URI in settings.",
    );
  } else if (
    MONGODB_URI.includes("mongodb.net") &&
    !MONGODB_URI.includes("retryWrites=true")
  ) {
    console.warn(
      'WARNING: Your Atlas MONGODB_URI might be missing "retryWrites=true&w=majority". This can cause transient connection issues.',
    );
  }

  if (
    MONGODB_URI.startsWith("mongodb+srv://") &&
    MONGODB_URI.includes(":") &&
    MONGODB_URI.split("@")[0].split(":").length > 2
  ) {
    // This is a rough check for port in SRV URI
    console.warn(
      'WARNING: Your MONGODB_URI starts with "mongodb+srv://" but seems to include a port. SRV URIs should not have ports.',
    );
  }

  try {
    const options = {
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      heartbeatFrequencyMS: 10000,
      tls: true,
      tlsAllowInvalidCertificates: true,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryReads: true,
      retryWrites: true,
      serverApi: {
        version: "1",
        strict: true,
        deprecationErrors: true,
      },
    };

    // Only force IPv4 if it's not an SRV connection (Atlas usually uses SRV)
    if (!MONGODB_URI.startsWith("mongodb+srv://")) {
      options.family = 4;
    }

    const client = new MongoClient(MONGODB_URI, options);
    await client.connect();
    db = client.db(MONGODB_DB);
    lastConnectionError = null;
    retryCount = 0;
    console.log("Connected to MongoDB");

    // Seed admin if not exists
    const adminExists = await db.collection("users").findOne({ role: "admin" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await db.collection("users").insertOne({
        name: "Admin User",
        email: "admin@somikoron.com",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
      });
      console.log("Default admin created: admin@somikoron.com / admin123");
    }
  } catch (error) {
    lastConnectionError = error.message;
    console.error("MongoDB connection error:", error);

    if (
      error.message.includes("SSL alert number 80") ||
      error.message.includes("tlsv1 alert internal error")
    ) {
      console.error(
        "CRITICAL: This SSL error often means your IP address is not whitelisted in MongoDB Atlas.",
      );
      console.error(
        'Please go to MongoDB Atlas -> Network Access and add "0.0.0.0/0" (for testing) or your specific IP.',
      );
    }

    // Check for retryable errors
    const labels = error.errorLabels || [];
    const isRetryable =
      labels.includes("RetryableError") ||
      labels.includes("SystemOverloadedError") ||
      error.message.includes("SystemOverloadedError") ||
      error.message.includes("ResetPool") ||
      error.message.includes("ECONNRESET");

    if (isRetryable && retryCount < MAX_RETRIES) {
      retryCount++;
      const delay = Math.min(10000 * retryCount, 30000); // Exponential backoff capped at 30s
      console.warn(
        `MongoDB: Retryable error detected. Attempt ${retryCount}/${MAX_RETRIES}. Retrying in ${delay / 1000}s...`,
      );
      setTimeout(connectToDatabase, delay);
    }
  }
}

// Middleware to check if DB is connected
const checkDB = (req, res, next) => {
  if (!db) {
    let message =
      "Database connection not established. Please check your MONGODB_URI in settings.";
    if (lastConnectionError?.includes("SSL alert number 80")) {
      message =
        "MongoDB SSL Handshake failed. This usually means your IP is not whitelisted in MongoDB Atlas. Please add 0.0.0.0/0 to your Atlas Network Access.";
    }
    return res.status(503).json({
      message,
      error: "DB_NOT_CONNECTED",
      details: lastConnectionError,
    });
  }
  next();
};

// Middleware
const authenticate = async (req, res, next) => {
  if (!db) return res.status(503).json({ message: "Database not connected" });
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.id) });
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  next();
};

async function startServer() {
  console.log(`Node version: ${process.version}`);
  console.log(`OpenSSL version: ${process.versions.openssl}`);

  // Start DB connection in background
  connectToDatabase();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Setup Morgan for standard logging
  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms"),
  );

  // Detailed Request/Response Logging Middleware
  app.use((req, res, next) => {
    const start = Date.now();
    const { method, url, body, query } = req;

    // Log request details
    console.log(`>>> [REQUEST] ${method} ${url}`);
    if (Object.keys(query).length > 0)
      console.log("    Query:", JSON.stringify(query));

    // Safely log body (exclude sensitive fields)
    if (method !== "GET" && Object.keys(body).length > 0) {
      const safeBody = { ...body };
      if (safeBody.password) safeBody.password = "********";
      if (safeBody.token) safeBody.token = "********";
      console.log("    Body:", JSON.stringify(safeBody));
    }

    // Capture response finish to log status and duration
    res.on("finish", () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const logColor =
        status >= 400 ? "\x1b[31m" : status >= 300 ? "\x1b[33m" : "\x1b[32m";
      const resetColor = "\x1b[0m";

      console.log(
        `<<< [RESPONSE] ${method} ${url} ${logColor}${status}${resetColor} (${duration}ms)`,
      );
    });

    next();
  });

  // API Router
  const apiRouter = express.Router();

  // Debug route (no DB check)
  apiRouter.get("/debug", (req, res) => {
    res.json({ status: "ok", message: "API is working", dbConnected: !!db });
  });

  // DB check middleware
  apiRouter.use(checkDB);

  // --- Auth API ---
  apiRouter.post("/auth/register", async (req, res) => {
    const { name, email, password, photoURL } = req.body;
    const existing = await db.collection("users").findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      photoURL,
      role: "user",
      createdAt: new Date(),
    });
    const token = jwt.sign({ id: result.insertedId }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: { id: result.insertedId, name, email, photoURL, role: "user" },
    });
  });

  apiRouter.post("/auth/google", async (req, res) => {
    const { uid, email, name, photoURL } = req.body;
    let user = await db.collection("users").findOne({ email });

    if (!user) {
      const result = await db.collection("users").insertOne({
        name,
        email,
        photoURL,
        googleId: uid,
        role: "user",
        createdAt: new Date(),
      });
      user = { _id: result.insertedId, name, email, photoURL, role: "user" };
    } else {
      // Update user with googleId if not present
      if (!user.googleId) {
        await db
          .collection("users")
          .updateOne(
            { _id: user._id },
            { $set: { googleId: uid, photoURL: photoURL || user.photoURL } },
          );
      }
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role,
      },
    });
  });

  apiRouter.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await db.collection("users").findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });

  apiRouter.get("/auth/me", authenticate, (req, res) => {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  });

  // --- Products API ---
  apiRouter.get("/products", async (req, res) => {
    const { category, search } = req.query;
    const query = {};
    if (category && category !== "all") query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };
    const products = await db.collection("products").find(query).toArray();
    res.json(products);
  });

  apiRouter.get("/products/:id", async (req, res) => {
    try {
      const product = await db
        .collection("products")
        .findOne({ _id: new ObjectId(req.params.id) });
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (e) {
      res.status(400).json({ message: "Invalid product ID" });
    }
  });

  apiRouter.post("/products", authenticate, isAdmin, async (req, res) => {
    const result = await db
      .collection("products")
      .insertOne({ ...req.body, createdAt: new Date() });
    res.json({ _id: result.insertedId, ...req.body });
  });

  apiRouter.put("/products/:id", authenticate, isAdmin, async (req, res) => {
    await db
      .collection("products")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
    res.json({ message: "Updated" });
  });

  apiRouter.delete("/products/:id", authenticate, isAdmin, async (req, res) => {
    await db
      .collection("products")
      .deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Deleted" });
  });

  // --- Orders API ---
  apiRouter.post("/orders", authenticate, async (req, res) => {
    const { items, totalPrice, shippingFee, finalTotal, formData } = req.body;

    try {
      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Cart items are required" });
      }

      if (!formData || !formData.name || !formData.phone || !formData.address) {
        return res
          .status(400)
          .json({ message: "Shipping information is required" });
      }

      // Create order with pending status
      const orderData = {
        userId: req.user._id,
        items,
        totalPrice,
        shippingFee,
        finalTotal,
        shippingInfo: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          area: formData.area,
        },
        paymentMethod: formData.paymentMethod,
        paymentStatus:
          formData.paymentMethod === "cod" ? "pending" : "pending_payment",
        status:
          formData.paymentMethod === "cod" ? "pending" : "pending_payment",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("orders").insertOne(orderData);
      const orderId = result.insertedId.toString();

      if (formData.paymentMethod === "online") {
        // Initialize SSLCOMMERZ payment
        const sslcz = new SslCommerzPayment(
          SSLCOMMERZ_STORE_ID,
          SSLCOMMERZ_STORE_PASSWORD,
          !SSLCOMMERZ_IS_LIVE,
        );

        const paymentData = {
          total_amount: finalTotal,
          currency: "BDT",
          tran_id: `SOM-${orderId}-${Date.now()}`,
          success_url: `${SSLCOMMERZ_SUCCESS_URL}?order_id=${orderId}`,
          fail_url: `${SSLCOMMERZ_FAIL_URL}?order_id=${orderId}`,
          cancel_url: `${SSLCOMMERZ_CANCEL_URL}?order_id=${orderId}`,
          ipn_url: `${req.protocol}://${req.get("host")}/api/payment/ipn`,
          shipping_method: "Courier",
          product_name: "Order from Somikoron Shop",
          product_category: "E-commerce",
          product_profile: "general",
          cus_name: formData.name,
          cus_email: req.user.email || "customer@example.com",
          cus_add1: formData.address,
          cus_add2: formData.area === "dhaka" ? "Dhaka" : "Outside Dhaka",
          cus_city: formData.area === "dhaka" ? "Dhaka" : "Other",
          cus_state: "Bangladesh",
          cus_postcode: "1000",
          cus_country: "Bangladesh",
          cus_phone: formData.phone,
          cus_fax: "Not Applicable",
          ship_name: formData.name,
          ship_add1: formData.address,
          ship_add2: formData.area === "dhaka" ? "Dhaka" : "Outside Dhaka",
          ship_city: formData.area === "dhaka" ? "Dhaka" : "Other",
          ship_state: "Bangladesh",
          ship_postcode: "1000",
          ship_country: "Bangladesh",
          ship_phone: formData.phone,
          multi_card_name:
            "mastercard,visacard,amexcard,discoverycard,bkash,nagad,rocket",
          value_a: orderId,
          value_b: req.user._id.toString(),
          value_c: "SomikoronShop",
        };

        try {
          const paymentResponse = await sslcz.init(paymentData);

          if (paymentResponse?.status === "SUCCESS") {
            // Update order with transaction ID
            await db.collection("orders").updateOne(
              { _id: new ObjectId(orderId) },
              {
                $set: {
                  transactionId: paymentData.tran_id,
                  paymentGatewayUrl: paymentResponse.GatewayPageURL,
                },
              },
            );

            return res.json({
              success: true,
              orderId,
              paymentUrl: paymentResponse.GatewayPageURL,
              transactionId: paymentData.tran_id,
            });
          } else {
            // If payment initialization fails, mark order as failed
            await db
              .collection("orders")
              .updateOne(
                { _id: new ObjectId(orderId) },
                { $set: { status: "payment_failed", paymentStatus: "failed" } },
              );

            return res.status(400).json({
              message: "Failed to initialize payment. Please try again.",
              error: paymentResponse?.failedreason || "Unknown error",
            });
          }
        } catch (paymentError) {
          console.error("SSLCommerz initialization error:", paymentError);

          // Mark order as failed
          await db
            .collection("orders")
            .updateOne(
              { _id: new ObjectId(orderId) },
              { $set: { status: "payment_failed", paymentStatus: "failed" } },
            );

          return res.status(500).json({
            message: "Payment gateway error. Please try again.",
            error: paymentError.message,
          });
        }
      } else {
        // Cash on delivery - order is placed successfully
        return res.json({
          success: true,
          orderId,
          message: "Order placed successfully",
        });
      }
    } catch (error) {
      console.error("Order creation error:", error);
      return res.status(500).json({
        message: "Failed to create order. Please try again.",
        error: error.message,
      });
    }
  });

  apiRouter.get("/orders/my-orders", authenticate, async (req, res) => {
    const orders = await db
      .collection("orders")
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(orders);
  });

  // --- Payment API ---
  apiRouter.post("/payment/validate", async (req, res) => {
    const { order_id, tran_id, amount } = req.body;

    try {
      const sslcz = new SslCommerzPayment(
        SSLCOMMERZ_STORE_ID,
        SSLCOMMERZ_STORE_PASSWORD,
        !SSLCOMMERZ_IS_LIVE,
      );
      const validation = await sslcz.validate(tran_id, amount);

      if (validation?.status === "VALIDATED") {
        // Update order status to paid
        await db.collection("orders").updateOne(
          { _id: new ObjectId(order_id) },
          {
            $set: {
              paymentStatus: "paid",
              status: "pending",
              paymentDetails: validation,
              updatedAt: new Date(),
            },
          },
        );

        return res.json({
          success: true,
          message: "Payment validated successfully",
          validation,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Payment validation failed",
          validation,
        });
      }
    } catch (error) {
      console.error("Payment validation error:", error);
      return res.status(500).json({
        success: false,
        message: "Payment validation error",
        error: error.message,
      });
    }
  });

  // SSLCOMMERZ IPN (Instant Payment Notification) Handler
  apiRouter.post("/payment/ipn", async (req, res) => {
    try {
      const {
        tran_id,
        status,
        value_a,
        amount,
        currency,
        card_type,
        store_amount,
        bank_tran_id,
      } = req.body;

      if (!tran_id || !value_a) {
        return res.status(400).json({ message: "Invalid IPN data" });
      }

      const orderId = value_a;

      if (status === "VALID" || status === "VALIDATED") {
        // Payment successful
        await db.collection("orders").updateOne(
          { _id: new ObjectId(orderId) },
          {
            $set: {
              paymentStatus: "paid",
              status: "pending",
              paymentDetails: {
                tran_id,
                amount,
                currency,
                card_type,
                store_amount,
                bank_tran_id,
                ipn_received: true,
                ipn_timestamp: new Date(),
              },
              updatedAt: new Date(),
            },
          },
        );

        console.log(`Payment successful for order ${orderId}: ${tran_id}`);
      } else {
        // Payment failed
        await db.collection("orders").updateOne(
          { _id: new ObjectId(orderId) },
          {
            $set: {
              paymentStatus: "failed",
              status: "payment_failed",
              paymentDetails: {
                tran_id,
                status,
                amount,
                currency,
                ipn_received: true,
                ipn_timestamp: new Date(),
              },
              updatedAt: new Date(),
            },
          },
        );

        console.log(
          `Payment failed for order ${orderId}: ${tran_id} - ${status}`,
        );
      }

      res.status(200).send("IPN received successfully");
    } catch (error) {
      console.error("IPN handling error:", error);
      res.status(500).send("IPN processing failed");
    }
  });

  // Payment success handler (for redirect after payment)
  apiRouter.get("/payment/success", async (req, res) => {
    const { order_id, tran_id, amount } = req.query;

    try {
      if (!order_id || !tran_id) {
        return res.redirect(
          "/payment/fail?message=Missing payment information",
        );
      }

      // Validate the payment
      const sslcz = new SslCommerzPayment(
        SSLCOMMERZ_STORE_ID,
        SSLCOMMERZ_STORE_PASSWORD,
        !SSLCOMMERZ_IS_LIVE,
      );
      const validation = await sslcz.validate(tran_id, amount);

      if (validation?.status === "VALIDATED") {
        // Update order status
        await db.collection("orders").updateOne(
          { _id: new ObjectId(order_id) },
          {
            $set: {
              paymentStatus: "paid",
              status: "pending",
              paymentDetails: validation,
              updatedAt: new Date(),
            },
          },
        );

        // Redirect to success page with order info
        return res.redirect(
          `/payment/success?order_id=${order_id}&tran_id=${tran_id}`,
        );
      } else {
        return res.redirect(
          `/payment/fail?order_id=${order_id}&message=Payment validation failed`,
        );
      }
    } catch (error) {
      console.error("Payment success handling error:", error);
      return res.redirect(
        `/payment/fail?order_id=${order_id}&message=Payment processing error`,
      );
    }
  });

  // Payment fail handler (for redirect after failed payment)
  apiRouter.get("/payment/fail", async (req, res) => {
    const { order_id, message } = req.query;

    if (order_id) {
      // Update order status to failed
      await db.collection("orders").updateOne(
        { _id: new ObjectId(order_id) },
        {
          $set: {
            paymentStatus: "failed",
            status: "payment_failed",
            updatedAt: new Date(),
          },
        },
      );
    }

    // Redirect to frontend fail page
    const failMessage = message || "Payment failed";
    res.redirect(
      `/payment/fail?order_id=${order_id || ""}&message=${encodeURIComponent(failMessage)}`,
    );
  });

  // Payment cancel handler (for redirect after cancelled payment)
  apiRouter.get("/payment/cancel", async (req, res) => {
    const { order_id } = req.query;

    if (order_id) {
      // Update order status to cancelled
      await db.collection("orders").updateOne(
        { _id: new ObjectId(order_id) },
        {
          $set: {
            paymentStatus: "cancelled",
            status: "cancelled",
            updatedAt: new Date(),
          },
        },
      );
    }

    // Redirect to frontend cancel page
    res.redirect(`/payment/cancel?order_id=${order_id || ""}`);
  });

  apiRouter.get("/orders/:id", authenticate, async (req, res) => {
    const order = await db
      .collection("orders")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (
      req.user.role !== "admin" &&
      order.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(order);
  });

  // --- Admin API ---
  apiRouter.get("/admin/stats", authenticate, isAdmin, async (req, res) => {
    const totalOrders = await db.collection("orders").countDocuments();
    const totalProducts = await db.collection("products").countDocuments();
    const totalUsers = await db.collection("users").countDocuments();
    const recentOrders = await db
      .collection("orders")
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    const revenue = await db
      .collection("orders")
      .aggregate([{ $group: { _id: null, total: { $sum: "$finalTotal" } } }])
      .toArray();

    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
      totalRevenue: revenue[0]?.total || 0,
    });
  });

  apiRouter.get("/admin/orders", authenticate, isAdmin, async (req, res) => {
    const orders = await db
      .collection("orders")
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(orders);
  });

  apiRouter.patch(
    "/admin/orders/:id/status",
    authenticate,
    isAdmin,
    async (req, res) => {
      await db
        .collection("orders")
        .updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: { status: req.body.status } },
        );
      res.json({ message: "Status updated" });
    },
  );

  apiRouter.get("/debug", (req, res) => {
    res.json({
      dbConnected: !!db,
      lastError: lastConnectionError,
      nodeVersion: process.version,
      opensslVersion: process.versions.openssl,
      env: process.env.NODE_ENV,
      uri: MONGODB_URI.replace(/\/\/.*:.*@/, "//***:***@"),
    });
  });

  apiRouter.get("/admin/users", authenticate, isAdmin, async (req, res) => {
    const users = await db.collection("users").find().toArray();
    res.json(users);
  });

  // --- Offers API ---
  apiRouter.get("/admin/offers", authenticate, isAdmin, async (req, res) => {
    const offers = await db
      .collection("offers")
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(offers);
  });

  apiRouter.get(
    "/admin/offers/:id",
    authenticate,
    isAdmin,
    async (req, res) => {
      try {
        const offer = await db
          .collection("offers")
          .findOne({ _id: new ObjectId(req.params.id) });
        if (!offer) return res.status(404).json({ message: "Offer not found" });
        res.json(offer);
      } catch (e) {
        res.status(400).json({ message: "Invalid offer ID" });
      }
    },
  );

  apiRouter.post("/admin/offers", authenticate, isAdmin, async (req, res) => {
    const {
      title,
      description,
      discount,
      code,
      image,
      color,
      startDate,
      endDate,
      isActive,
      minOrderAmount,
      maxDiscount,
      applicableProducts,
      applicableCategories,
    } = req.body;

    const offer = {
      title,
      description,
      discount,
      code: code.toUpperCase(),
      image,
      color,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive !== undefined ? isActive : true,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount: maxDiscount || null,
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      usageCount: 0,
      maxUsage: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("offers").insertOne(offer);
    res.json({ _id: result.insertedId, ...offer });
  });

  apiRouter.put(
    "/admin/offers/:id",
    authenticate,
    isAdmin,
    async (req, res) => {
      const {
        title,
        description,
        discount,
        code,
        image,
        color,
        startDate,
        endDate,
        isActive,
        minOrderAmount,
        maxDiscount,
        applicableProducts,
        applicableCategories,
        maxUsage,
      } = req.body;

      const updateData = {
        title,
        description,
        discount,
        code: code.toUpperCase(),
        image,
        color,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive,
        minOrderAmount,
        maxDiscount,
        applicableProducts,
        applicableCategories,
        maxUsage,
        updatedAt: new Date(),
      };

      await db
        .collection("offers")
        .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateData });
      res.json({ message: "Offer updated successfully" });
    },
  );

  apiRouter.delete(
    "/admin/offers/:id",
    authenticate,
    isAdmin,
    async (req, res) => {
      await db
        .collection("offers")
        .deleteOne({ _id: new ObjectId(req.params.id) });
      res.json({ message: "Offer deleted successfully" });
    },
  );

  apiRouter.patch(
    "/admin/offers/:id/toggle",
    authenticate,
    isAdmin,
    async (req, res) => {
      const offer = await db
        .collection("offers")
        .findOne({ _id: new ObjectId(req.params.id) });

      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }

      await db
        .collection("offers")
        .updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: { isActive: !offer.isActive, updatedAt: new Date() } },
        );

      res.json({
        message: `Offer ${!offer.isActive ? "activated" : "deactivated"} successfully`,
      });
    },
  );

  apiRouter.get("/offers", async (req, res) => {
    const now = new Date();
    const offers = await db
      .collection("offers")
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(offers);
  });

  apiRouter.post("/offers/validate", async (req, res) => {
    const { code, orderAmount, productIds, categoryIds } = req.body;

    const offer = await db.collection("offers").findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    if (!offer) {
      return res.status(404).json({ message: "Invalid or expired offer code" });
    }

    if (offer.maxUsage && offer.usageCount >= offer.maxUsage) {
      return res.status(400).json({ message: "Offer usage limit exceeded" });
    }

    if (offer.minOrderAmount && orderAmount < offer.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount of ৳${offer.minOrderAmount} required`,
      });
    }

    if (offer.applicableProducts.length > 0 && productIds) {
      const hasApplicableProduct = productIds.some((id) =>
        offer.applicableProducts.includes(id),
      );
      if (!hasApplicableProduct) {
        return res.status(400).json({
          message: "Offer not applicable to selected products",
        });
      }
    }

    if (offer.applicableCategories.length > 0 && categoryIds) {
      const hasApplicableCategory = categoryIds.some((id) =>
        offer.applicableCategories.includes(id),
      );
      if (!hasApplicableCategory) {
        return res.status(400).json({
          message: "Offer not applicable to selected categories",
        });
      }
    }

    let discountAmount = 0;
    if (offer.discount.includes("%")) {
      const percentage = parseFloat(offer.discount.replace("%", ""));
      discountAmount = (orderAmount * percentage) / 100;
    } else {
      discountAmount = parseFloat(offer.discount.replace(/[^\d.]/g, ""));
    }

    if (offer.maxDiscount && discountAmount > offer.maxDiscount) {
      discountAmount = offer.maxDiscount;
    }

    res.json({
      valid: true,
      offer,
      discountAmount,
      finalAmount: orderAmount - discountAmount,
    });
  });

  // --- Memory Management API ---
  apiRouter.get("/memories", authenticate, async (req, res) => {
    try {
      const {
        search,
        tags,
        category,
        priority,
        dateFrom,
        dateTo,
        page = 1,
        limit = 20,
      } = req.query;
      const userId = req.user._id;

      // Build filter query
      const filter = { userId: new ObjectId(userId) };

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
        ];
      }

      if (tags && tags.length > 0) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        filter.tags = { $in: tagArray };
      }

      if (category) {
        filter.category = category;
      }

      if (priority) {
        filter.priority = priority;
      }

      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo);
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const memories = await db
        .collection("memories")
        .find(filter)
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();

      // Get total count for pagination
      const total = await db.collection("memories").countDocuments(filter);

      res.json({
        memories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Error fetching memories:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch memories", error: error.message });
    }
  });

  apiRouter.post("/memories", authenticate, async (req, res) => {
    try {
      const {
        title,
        content,
        tags = [],
        category,
        priority = "medium",
        metadata = {},
      } = req.body;
      const userId = req.user._id;

      // Validation
      if (!title || !content) {
        return res
          .status(400)
          .json({ message: "Title and content are required" });
      }

      if (title.length > 200) {
        return res
          .status(400)
          .json({ message: "Title must be less than 200 characters" });
      }

      if (content.length > 10000) {
        return res
          .status(400)
          .json({ message: "Content must be less than 10,000 characters" });
      }

      const memoryData = {
        userId: new ObjectId(userId),
        title: title.trim(),
        content: content.trim(),
        tags: Array.isArray(tags)
          ? tags.filter((tag) => tag && tag.trim())
          : [],
        category: category || "general",
        priority: ["low", "medium", "high"].includes(priority)
          ? priority
          : "medium",
        metadata: {
          wordCount: content.split(/\s+/).length,
          characterCount: content.length,
          ...metadata,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        isPinned: false,
      };

      const result = await db.collection("memories").insertOne(memoryData);
      const memory = { ...memoryData, _id: result.insertedId };

      res.status(201).json({
        message: "Memory created successfully",
        memory,
      });
    } catch (error) {
      console.error("Error creating memory:", error);
      res
        .status(500)
        .json({ message: "Failed to create memory", error: error.message });
    }
  });

  apiRouter.get("/memories/:id", authenticate, async (req, res) => {
    try {
      const userId = req.user._id;
      const memoryId = req.params.id;

      const memory = await db.collection("memories").findOne({
        _id: new ObjectId(memoryId),
        userId: new ObjectId(userId),
      });

      if (!memory) {
        return res.status(404).json({ message: "Memory not found" });
      }

      res.json(memory);
    } catch (error) {
      console.error("Error fetching memory:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch memory", error: error.message });
    }
  });

  apiRouter.put("/memories/:id", authenticate, async (req, res) => {
    try {
      const userId = req.user._id;
      const memoryId = req.params.id;
      const { title, content, tags, category, priority, metadata } = req.body;

      // Validate memory exists and belongs to user
      const existingMemory = await db.collection("memories").findOne({
        _id: new ObjectId(memoryId),
        userId: new ObjectId(userId),
      });

      if (!existingMemory) {
        return res.status(404).json({ message: "Memory not found" });
      }

      // Build update object
      const updateData = { updatedAt: new Date() };

      if (title !== undefined) {
        if (!title.trim()) {
          return res.status(400).json({ message: "Title is required" });
        }
        if (title.length > 200) {
          return res
            .status(400)
            .json({ message: "Title must be less than 200 characters" });
        }
        updateData.title = title.trim();
      }

      if (content !== undefined) {
        if (!content.trim()) {
          return res.status(400).json({ message: "Content is required" });
        }
        if (content.length > 10000) {
          return res
            .status(400)
            .json({ message: "Content must be less than 10,000 characters" });
        }
        updateData.content = content.trim();
        updateData.metadata = {
          ...existingMemory.metadata,
          wordCount: content.split(/\s+/).length,
          characterCount: content.length,
          ...(metadata || {}),
        };
      }

      if (tags !== undefined) {
        updateData.tags = Array.isArray(tags)
          ? tags.filter((tag) => tag && tag.trim())
          : [];
      }

      if (category !== undefined) {
        updateData.category = category;
      }

      if (priority !== undefined) {
        if (!["low", "medium", "high"].includes(priority)) {
          return res
            .status(400)
            .json({ message: "Priority must be low, medium, or high" });
        }
        updateData.priority = priority;
      }

      const result = await db
        .collection("memories")
        .updateOne(
          { _id: new ObjectId(memoryId), userId: new ObjectId(userId) },
          { $set: updateData },
        );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Memory not found" });
      }

      // Return updated memory
      const updatedMemory = await db.collection("memories").findOne({
        _id: new ObjectId(memoryId),
        userId: new ObjectId(userId),
      });

      res.json({
        message: "Memory updated successfully",
        memory: updatedMemory,
      });
    } catch (error) {
      console.error("Error updating memory:", error);
      res
        .status(500)
        .json({ message: "Failed to update memory", error: error.message });
    }
  });

  apiRouter.delete("/memories/:id", authenticate, async (req, res) => {
    try {
      const userId = req.user._id;
      const memoryId = req.params.id;

      const result = await db.collection("memories").deleteOne({
        _id: new ObjectId(memoryId),
        userId: new ObjectId(userId),
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Memory not found" });
      }

      res.json({ message: "Memory deleted successfully" });
    } catch (error) {
      console.error("Error deleting memory:", error);
      res
        .status(500)
        .json({ message: "Failed to delete memory", error: error.message });
    }
  });

  // Memory toggle operations
  apiRouter.patch("/memories/:id/pin", authenticate, async (req, res) => {
    try {
      const userId = req.user._id;
      const memoryId = req.params.id;
      const { isPinned } = req.body;

      const result = await db.collection("memories").updateOne(
        { _id: new ObjectId(memoryId), userId: new ObjectId(userId) },
        {
          $set: {
            isPinned: isPinned || false,
            updatedAt: new Date(),
          },
        },
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Memory not found" });
      }

      res.json({
        message: `Memory ${isPinned ? "pinned" : "unpinned"} successfully`,
      });
    } catch (error) {
      console.error("Error toggling memory pin:", error);
      res
        .status(500)
        .json({ message: "Failed to toggle memory pin", error: error.message });
    }
  });

  apiRouter.patch("/memories/:id/archive", authenticate, async (req, res) => {
    try {
      const userId = req.user._id;
      const memoryId = req.params.id;
      const { isArchived } = req.body;

      const result = await db.collection("memories").updateOne(
        { _id: new ObjectId(memoryId), userId: new ObjectId(userId) },
        {
          $set: {
            isArchived: isArchived || false,
            updatedAt: new Date(),
          },
        },
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Memory not found" });
      }

      res.json({
        message: `Memory ${isArchived ? "archived" : "unarchived"} successfully`,
      });
    } catch (error) {
      console.error("Error toggling memory archive:", error);
      res
        .status(500)
        .json({
          message: "Failed to toggle memory archive",
          error: error.message,
        });
    }
  });

  // Memory analytics
  apiRouter.get("/memories/analytics", authenticate, async (req, res) => {
    try {
      const userId = req.user._id;

      const [
        totalMemories,
        pinnedMemories,
        archivedMemories,
        categoryStats,
        tagStats,
        priorityStats,
        recentActivity,
      ] = await Promise.all([
        db
          .collection("memories")
          .countDocuments({ userId: new ObjectId(userId) }),
        db
          .collection("memories")
          .countDocuments({ userId: new ObjectId(userId), isPinned: true }),
        db
          .collection("memories")
          .countDocuments({ userId: new ObjectId(userId), isArchived: true }),
        db
          .collection("memories")
          .aggregate([
            { $match: { userId: new ObjectId(userId) } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ])
          .toArray(),
        db
          .collection("memories")
          .aggregate([
            { $match: { userId: new ObjectId(userId) } },
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
          ])
          .toArray(),
        db
          .collection("memories")
          .aggregate([
            { $match: { userId: new ObjectId(userId) } },
            { $group: { _id: "$priority", count: { $sum: 1 } } },
          ])
          .toArray(),
        db
          .collection("memories")
          .find({ userId: new ObjectId(userId) })
          .sort({ updatedAt: -1 })
          .limit(5)
          .project({ title: 1, updatedAt: 1, category: 1 })
          .toArray(),
      ]);

      res.json({
        totalMemories,
        pinnedMemories,
        archivedMemories,
        activeMemories: totalMemories - archivedMemories,
        categoryStats,
        tagStats,
        priorityStats,
        recentActivity,
      });
    } catch (error) {
      console.error("Error fetching memory analytics:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch analytics", error: error.message });
    }
  });

  // Memory search suggestions
  apiRouter.get("/memories/suggestions", authenticate, async (req, res) => {
    try {
      const userId = req.user._id;
      const { query } = req.query;

      if (!query || query.length < 2) {
        return res.json({ suggestions: [] });
      }

      const suggestions = await db
        .collection("memories")
        .aggregate([
          {
            $match: {
              userId: new ObjectId(userId),
              $or: [
                { title: { $regex: query, $options: "i" } },
                { content: { $regex: query, $options: "i" } },
                { tags: { $regex: query, $options: "i" } },
              ],
            },
          },
          {
            $project: {
              title: 1,
              content: { $substr: ["$content", 0, 100] },
              tags: 1,
              category: 1,
            },
          },
          { $limit: 10 },
        ])
        .toArray();

      res.json({ suggestions });
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch suggestions", error: error.message });
    }
  });

  // Memory bulk operations
  apiRouter.post("/memories/bulk", authenticate, async (req, res) => {
    try {
      const userId = req.user._id;
      const { action, memoryIds, data } = req.body;

      if (!action || !memoryIds || !Array.isArray(memoryIds)) {
        return res
          .status(400)
          .json({ message: "Action and memoryIds array are required" });
      }

      const objectIds = memoryIds.map((id) => new ObjectId(id));

      let result;
      switch (action) {
        case "delete":
          result = await db.collection("memories").deleteMany({
            _id: { $in: objectIds },
            userId: new ObjectId(userId),
          });
          break;

        case "archive":
          result = await db
            .collection("memories")
            .updateMany(
              { _id: { $in: objectIds }, userId: new ObjectId(userId) },
              { $set: { isArchived: true, updatedAt: new Date() } },
            );
          break;

        case "unarchive":
          result = await db
            .collection("memories")
            .updateMany(
              { _id: { $in: objectIds }, userId: new ObjectId(userId) },
              { $set: { isArchived: false, updatedAt: new Date() } },
            );
          break;

        case "pin":
          result = await db
            .collection("memories")
            .updateMany(
              { _id: { $in: objectIds }, userId: new ObjectId(userId) },
              { $set: { isPinned: true, updatedAt: new Date() } },
            );
          break;

        case "unpin":
          result = await db
            .collection("memories")
            .updateMany(
              { _id: { $in: objectIds }, userId: new ObjectId(userId) },
              { $set: { isPinned: false, updatedAt: new Date() } },
            );
          break;

        case "updateCategory":
          if (!data.category) {
            return res
              .status(400)
              .json({
                message: "Category is required for updateCategory action",
              });
          }
          result = await db
            .collection("memories")
            .updateMany(
              { _id: { $in: objectIds }, userId: new ObjectId(userId) },
              { $set: { category: data.category, updatedAt: new Date() } },
            );
          break;

        default:
          return res.status(400).json({ message: "Invalid action" });
      }

      res.json({
        message: `Bulk ${action} completed successfully`,
        modifiedCount: result.modifiedCount || result.deletedCount,
      });
    } catch (error) {
      console.error("Error performing bulk operation:", error);
      res
        .status(500)
        .json({
          message: "Failed to perform bulk operation",
          error: error.message,
        });
    }
  });

  // API 404 Handler
  apiRouter.all("*", (req, res) => {
    console.log(`[API 404] ${req.method} ${req.url}`);
    res
      .status(404)
      .json({ message: `API route ${req.method} ${req.url} not found` });
  });

  // Mount API Router
  app.use("/api", apiRouter);

  // --- Global Error Handler ---
  app.use((err, req, res, next) => {
    console.error("[Global Error]", err);
    if (req.path.startsWith("/api/")) {
      return res.status(500).json({
        message: "Internal Server Error",
        error: err.message,
      });
    }
    next(err);
  });

  // --- Vite integration ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
