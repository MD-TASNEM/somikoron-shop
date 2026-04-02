import { MongoClient, Db } from 'mongodb';
import { 
  createDatabaseErrorResponse, 
  createConflictResponse,
  createNotFoundResponse,
  createServerErrorResponse 
} from './api-response-handler';

// MongoDB Error Types
export enum MongoError {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  DATABASE_NOT_FOUND = 'DATABASE_NOT_FOUND',
  COLLECTION_NOT_FOUND = 'COLLECTION_NOT_FOUND',
  DUPLICATE_KEY = 'DUPLICATE_KEY',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CAST_ERROR = 'CAST_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  WRITE_CONCERN_ERROR = 'WRITE_CONCERN_ERROR',
  GRIDFS_ERROR = 'GRIDFS_ERROR'
}

// MongoDB Error Handler Class
export class MongoErrorHandler {
  static handleError(error) {
    console.error(`MongoDB Error${context ? ` in ${context}` : ''}:`, error);

    // Duplicate Key Error (11000)
    if (error.code === 11000) {
      const field = this.extractDuplicateField(error);
      const value = error.keyValue?.[field] || 'unknown';
      
      return createConflictResponse(
        `${field} '${value}' already exists. Please use a different ${field}.`,
        { field, value, originalError);
    }

    // Validation Errors
    if (error.name === 'ValidationError') {
      const validationErrors = this.extractValidationErrors(error);
      
      return createDatabaseErrorResponse(
        'Data validation failed',
        { validationErrors, originalError);
    }

    // Cast Errors (Invalid ObjectId, etc.)
    if (error.name === 'CastError') {
      return createDatabaseErrorResponse(
        `Invalid ${error.path}: '${error.value}'. Please provide a valid ${error.kind}.`,
        { field);
    }

    // Connection Errors
    if (this.isConnectionError(error)) {
      return createDatabaseErrorResponse(
        'Database connection failed. Please try again later.',
        { originalError);
    }

    // Timeout Errors
    if (this.isTimeoutError(error)) {
      return createDatabaseErrorResponse(
        'Database operation timed out. Please try again.',
        { originalError);
    }

    // Write Concern Errors
    if (error.writeConcernError) {
      return createDatabaseErrorResponse(
        'Database write operation failed. Please try again.',
        { writeConcernError);
    }

    // GridFS Errors
    if (error.name === 'GridFSBucketError') {
      return createDatabaseErrorResponse(
        'File operation failed in GridFS.',
        { originalError);
    }

    // Generic MongoDB Error
    return createDatabaseErrorResponse(
      'Database operation failed.',
      { 
        name,
        originalError: process.env.NODE_ENV === 'development' ? error.stack);
  }

  static extractDuplicateField(error) {
    const keyPattern = error.keyPattern;
    if (keyPattern && typeof keyPattern === 'object') {
      return Object.keys(keyPattern)[0] || 'field';
    }
    return 'field';
  }

  static extractValidationErrors(error) {
    const errors = {};
    
    if (error.errors && typeof error.errors === 'object') {
      Object.keys(error.errors).forEach(key => {
        const fieldError = error.errors[key];
        errors[key] = [fieldError.message || 'Validation failed'];
      });
    }
    
    return errors;
  }

  static isConnectionError(error) {
    return (
      error.name === 'MongoNetworkError' ||
      error.name === 'MongoServerSelectionError' ||
      error.name === 'MongoParseError' ||
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('ENOTFOUND') ||
      error.message?.includes('ETIMEDOUT') ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ETIMEDOUT'
    );
  }

  static isTimeoutError(error) {
    return (
      error.name === 'MongoTimeoutError' ||
      error.message?.includes('timeout') ||
      error.code === 50
    );
  }
}

// MongoDB Connection Manager with Error Handling
export class MongoConnectionManager {
  static client: MongoClient | null = null;
  static connectionPromise: Promise | null = null;
  static retryCount = 0;
  static maxRetries = 3;
  static retryDelay = 1000; // 1 second

  static async getConnection() {
    if (this.client && this.client.isConnected()) {
      return this.client;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.createConnection();
    return this.connectionPromise;
  }

  static async createConnection() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MongoDB URI not provided');
    }

    try {
      const client = new MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        heartbeatFrequencyMS: 10000,
        retryWrites,
        readPreference: 'primary',
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority', j);

      await client.connect();
      await client.db().admin().ping(); // Test connection

      this.client = client;
      this.retryCount = 0; // Reset retry count on success
      this.connectionPromise = null;

      console.log('✅ MongoDB connected successfully');
      return client;

    } catch (error) {
      this.connectionPromise = null;
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.warn(`MongoDB connection failed, retrying (${this.retryCount}/${this.maxRetries})...`);
        
        await this.delay(this.retryDelay * this.retryCount);
        return this.createConnection();
      }

      console.error('❌ MongoDB connection failed after maximum retries:', error);
      throw error;
    }
  }

  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getDatabase() {
    const client = await this.getConnection();
    const dbName = process.env.MONGODB_DB || 'somikoron-shop';
    return client.db(dbName);
  }

  static async closeConnection() {
    if (this.client) {
      try {
        await this.client.close();
        console.log('✅ MongoDB connection closed');
      } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error);
      } finally {
        this.client = null;
        this.connectionPromise = null;
      }
    }
  }

  static async healthCheck() { healthy: boolean; error?: string }> {
    try {
      const db = await this.getDatabase();
      await db.admin().ping();
      return { healthy: true };
    } catch (error) {
      return { 
        healthy, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Graceful Shutdown Handler
export class GracefulShutdown {
  static isShuttingDown = false;

  static setup() {
    const shutdown = async (signal) => {
      if (this.isShuttingDown) return;
      
      console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
      this.isShuttingDown = true;

      try {
        // Close MongoDB connection
        await MongoConnectionManager.closeConnection();
        
        // Close other resources if needed
        // await closeOtherResources();

        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    // Setup signal handlers
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGUSR2', () => shutdown('SIGUSR2')); // nodemon restart

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      shutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });
  }

  static isShuttingDownActive() {
    return this.isShuttingDown;
  }
}

// Database Operation Wrapper with Error Handling
export function withMongoErrorHandling(
  operation: () => Promise,
  context?) {
  return operation().catch(error => {
    throw MongoErrorHandler.handleError(error, context);
  });
}

// Transaction Error Handler
export class MongoTransactionError extends Error {
  constructor(
    message) {
    super(message);
    this.name = 'MongoTransactionError';
  }
}

export class MongoTransactionManager {
  static async executeTransaction(
    db,
    operations: (session) => Promise,
    context?) {
    const session = db.client.startSession();
    
    try {
      session.startTransaction({
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority', j);

      const result = await operations(session);
      
      await session.commitTransaction();
      return result;

    } catch (error) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error('Failed to abort transaction:', abortError);
      }

      throw new MongoTransactionError(
        `Transaction failed${context ? ` in ${context}` : ''}`,
        context || 'unknown',
        error);

    } finally {
      await session.endSession();
    }
  }
}

// Bulk Operation Error Handler
export class MongoBulkError extends Error {
  constructor(
    message) {
    super(message);
    this.name = 'MongoBulkError';
  }
}

export function handleBulkWriteError(result) {
  if (result.hasWriteErrors()) {
    return new MongoBulkError(
      'Bulk write operation failed',
      result.getWriteErrors(),
      result.getInsertedCount(),
      result.getModifiedCount(),
      result.getDeletedCount()
    );
  }
  return null;
}

// Cursor Error Handler
export class MongoCursorError extends Error {
  constructor(
    message) {
    super(message);
    this.name = 'MongoCursorError';
  }
}

export function withCursorErrorHandling(
  cursorOperation: () => Promise,
  context?) {
  return cursorOperation().catch(error => {
    throw new MongoCursorError(
      `Cursor operation failed${context ? ` in ${context}` : ''}`,
      context || 'unknown',
      error);
  });
}

// Index Error Handler
export class MongoIndexError extends Error {
  constructor(
    message) {
    super(message);
    this.name = 'MongoIndexError';
  }
}

export function handleIndexError(error) {
  return new MongoIndexError(
    `Index operation failed${indexName ? ` for ${indexName}` : ''}`,
    indexName,
    error
  );
}

// Connection Pool Error Handler
export class MongoConnectionPoolError extends Error {
  constructor(
    message) {
    super(message);
    this.name = 'MongoConnectionPoolError';
  }
}

export async function getConnectionPoolStats() {
    const client = await MongoConnectionManager.getConnection();
    const admin = client.db().admin();
    const serverStatus = await admin.serverStatus();
    
    return {
      connections,
      mem: serverStatus.mem
    };
  } catch (error) {
    throw new MongoConnectionPoolError(
      'Failed to get connection pool stats',
      null,
      error);
  }
}

// Setup graceful shutdown on module import
if (typeof process !== 'undefined') {
  GracefulShutdown.setup();
}
