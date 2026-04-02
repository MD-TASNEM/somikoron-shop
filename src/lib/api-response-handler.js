// API Response Handler with consistent error formatting
import { NextResponse } from 'next/server';

// Standard API Response Interface
export interface ApiResponse {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    timestamp: string;
    version: string;
  };
}

// Success Response Helper
export function createSuccessResponse(
  data,
  meta?: ApiResponse['meta']
) {
  const response = {
    success,
    message: message || 'Success',
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      ...meta
    }
  };

  return NextResponse.json(response, { status: 200 });
}

// Error Response Helper
export function createErrorResponse(
  code,
  statusCode: number = 500,
  details?) {
  const response = {
    success,
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  };

  return NextResponse.json(response, { status);
}

// Validation Error Response
export function createValidationErrorResponse(
  errors,
  message: string = 'Validation failed'
) {
  return createErrorResponse('VALIDATION_ERROR', message, 400, {
    validationErrors);
}

// Not Found Response
export function createNotFoundResponse(
  message: string = 'Resource not found'
) {
  return createErrorResponse('NOT_FOUND', message, 404);
}

// Unauthorized Response
export function createUnauthorizedResponse(
  message: string = 'Unauthorized access'
) {
  return createErrorResponse('UNAUTHORIZED', message, 401);
}

// Forbidden Response
export function createForbiddenResponse(
  message: string = 'Access forbidden'
) {
  return createErrorResponse('FORBIDDEN', message, 403);
}

// Conflict Response
export function createConflictResponse(
  message: string = 'Resource conflict'
) {
  return createErrorResponse('CONFLICT', message, 409);
}

// Too Many Requests Response
export function createTooManyRequestsResponse(
  message: string = 'Too many requests'
) {
  return createErrorResponse('TOO_MANY_REQUESTS', message, 429);
}

// Server Error Response
export function createServerErrorResponse(
  message: string = 'Internal server error',
  details?) {
  return createErrorResponse('INTERNAL_SERVER_ERROR', message, 500, details);
}

// Database Error Response
export function createDatabaseErrorResponse(
  message: string = 'Database error',
  details?) {
  return createErrorResponse('DATABASE_ERROR', message, 500, details);
}

// MongoDB Specific Error Handler
export function handleMongoDBError(error) {
  console.error('MongoDB Error:', error);

  // Duplicate Key Error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return createErrorResponse(
      'DUPLICATE_KEY',
      `${field} '${value}' already exists`,
      409,
      { field, value }
    );
  }

  // Validation Error
  if (error.name === 'ValidationError') {
    const errors = {};
    
    Object.keys(error.errors).forEach(key => {
      errors[key] = [error.errors[key].message];
    });

    return createValidationErrorResponse(
      errors,
      'Data validation failed'
    );
  }

  // Cast Error
  if (error.name === 'CastError') {
    return createErrorResponse(
      'INVALID_ID',
      `Invalid ${error.path}: ${error.value}`,
      400,
      { field);
  }

  // Connection Error
  if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
    return createDatabaseErrorResponse(
      'Database connection failed',
      { originalError);
  }

  // Generic MongoDB Error
  return createDatabaseErrorResponse(
    'Database operation failed',
    { originalError);
}

// Async Error Handler Wrapper
export function withErrorHandler(
  handler: (request) => Promise
) {
  return async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('API Error:', error);

      // MongoDB Errors
      if (error.name && error.name.includes('Mongo')) {
        return handleMongoDBError(error);
      }

      // Validation Errors
      if (error.name === 'ZodError') {
        const errors = {};
        error.errors.forEach((err) => {
          errors[err.path.join('.')] = [err.message];
        });
        return createValidationErrorResponse(errors);
      }

      // JWT Errors
      if (error.name === 'JsonWebTokenError') {
        return createUnauthorizedResponse('Invalid token');
      }

      if (error.name === 'TokenExpiredError') {
        return createUnauthorizedResponse('Token expired');
      }

      // Generic Error
      return createServerErrorResponse(
        process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'An unexpected error occurred',
        process.env.NODE_ENV === 'development' 
          ? { stack);
    }
  };
}

// Request ID Generator
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Pagination Meta Helper
export function createPaginationMeta(
  page): ApiResponse['meta']['pagination'] {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev: page > 1
  };
}

// Rate Limiting Response
export function createRateLimitResponse(
  retryAfter,
  message: string = 'Rate limit exceeded'
) {
  return NextResponse.json(
    createErrorResponse('RATE_LIMIT_EXCEEDED', message, 429),
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': (Date.now() + retryAfter * 1000).toString()
      }
    }
  );
}

// CORS Error Response
export function createCorsErrorResponse(
  message: string = 'CORS policy violation'
) {
  return NextResponse.json(
    createErrorResponse('CORS_ERROR', message, 403),
    {
      status: 403,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    }
  );
}

// File Upload Error Response
export function createFileUploadErrorResponse(
  message,
  details?: {
    maxSize?: number;
    allowedTypes?: string[];
    currentSize?: number;
    currentType?: string;
  }
) {
  return createErrorResponse('FILE_UPLOAD_ERROR', message, 400, details);
}

// Authentication Error Types
export enum AuthError {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  ACCESS_DENIED = 'ACCESS_DENIED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_INACTIVE = 'USER_INACTIVE',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED'
}

// Authentication Error Handler
export function createAuthErrorResponse(
  errorType) {
  const messages = {
    [AuthError.INVALID_CREDENTIALS]: 'Invalid email or password',
    [AuthError.TOKEN_EXPIRED]: 'Your session has expired',
    [AuthError.TOKEN_INVALID]: 'Invalid authentication token',
    [AuthError.ACCESS_DENIED]: 'Access denied',
    [AuthError.SESSION_EXPIRED]: 'Session expired',
    [AuthError.USER_NOT_FOUND]: 'User account not found',
    [AuthError.USER_INACTIVE]: 'Account is inactive',
    [AuthError.EMAIL_NOT_VERIFIED]: 'Email not verified'
  };

  return createErrorResponse(
    errorType,
    message || messages[errorType],
    401,
    details
  );
}

// Business Logic Error Types
export enum BusinessError {
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  PRODUCT_NOT_AVAILABLE = 'PRODUCT_NOT_AVAILABLE',
  ORDER_CANNOT_BE_CANCELLED = 'ORDER_CANNOT_BE_CANCELLED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INVALID_COUPON = 'INVALID_COUPON',
  COUPON_EXPIRED = 'COUPON_EXPIRED',
  MINIMUM_ORDER_AMOUNT = 'MINIMUM_ORDER_AMOUNT',
  DELIVERY_UNAVAILABLE = 'DELIVERY_UNAVAILABLE'
};

// Business Logic Error Handler
export function createBusinessErrorResponse(
  errorType) {
  const messages = {
    [BusinessError.INSUFFICIENT_STOCK]: 'Product is out of stock',
    [BusinessError.PRODUCT_NOT_AVAILABLE]: 'Product is not available',
    [BusinessError.ORDER_CANNOT_BE_CANCELLED]: 'Order cannot be cancelled at this stage',
    [BusinessError.PAYMENT_FAILED]: 'Payment processing failed',
    [BusinessError.INVALID_COUPON]: 'Invalid coupon code',
    [BusinessError.COUPON_EXPIRED]: 'Coupon has expired',
    [BusinessError.MINIMUM_ORDER_AMOUNT]: 'Minimum order amount not met',
    [BusinessError.DELIVERY_UNAVAILABLE]: 'Delivery not available for this location'
  };

  return createErrorResponse(
    errorType,
    message || messages[errorType],
    400,
    details
  );
}

// Error Logging Service
export class ErrorLogger {
  static async logError(error, context?: {
    requestId?: string;
    userId?: string;
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ip?: string;
  }) {
    try {
      await fetch('/api/errors/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            message,
          timestamp: new Date().toISOString(),
          environment)
      });
    } catch (logError) {
      // Prevent infinite loops
      console.error('Failed to log error:', logError);
    }
  }
}

// Response Time Logger
export function withResponseTimeLogging(
  handler: (request) => Promise
) {
  return async (request) => {
    const startTime = Date.now();
    const response = await handler(request);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Log slow requests
    if (responseTime > 1000) {
      console.warn(`Slow request: ${request.method} ${request.url} took ${responseTime}ms`);
    }

    // Add response time header
    response.headers.set('X-Response-Time', responseTime.toString());
    
    return response;
  };
}

// Request Validator
export function validateRequest(
  request): { valid: boolean; error?: NextResponse } {
  // Check method
  if (requiredMethods && !requiredMethods.includes(request.method)) {
    return {
      valid,
      error: createErrorResponse(
        'METHOD_NOT_ALLOWED',
        `Method ${request.method} not allowed`,
        405
      )
    };
  }

  // Check headers
  if (requiredHeaders) {
    for (const header of requiredHeaders) {
      if (!request.headers.get(header)) {
        return {
          valid,
          error: createErrorResponse(
            'MISSING_HEADER',
            `Missing required header: ${header}`,
            400
          )
        };
      }
    }
  }

  return { valid: true };
}
