import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import morgan from "morgan";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "somikoron_shop";
const JWT_SECRET = process.env.JWT_SECRET || "somikoron_secret_key_123";

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
    const order = {
      ...req.body,
      userId: req.user._id,
      status: "pending",
      createdAt: new Date(),
    };
    const result = await db.collection("orders").insertOne(order);
    res.json({ _id: result.insertedId, ...order });
  });

  apiRouter.get("/orders/my-orders", authenticate, async (req, res) => {
    const orders = await db
      .collection("orders")
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(orders);
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
