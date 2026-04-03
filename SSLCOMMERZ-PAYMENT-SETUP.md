# SSLCOMMERZ Payment Integration - Complete Setup Guide

## Overview
This document provides a comprehensive guide for setting up and testing the SSLCOMMERZ payment gateway integration in the Somikoron Shop e-commerce platform.

## 🚀 Features Implemented

### Payment Gateway Features
- ✅ **Multiple Payment Methods**: bKash, Nagad, Rocket, Credit/Debit Cards
- ✅ **Secure Payment Processing**: SSLCOMMERZ sandbox and live mode support
- ✅ **Payment Validation**: Real-time transaction validation
- ✅ **IPN Handling**: Instant Payment Notification processing
- ✅ **Email Invoices**: Automatic invoice emails to customers and admin
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Payment Status Tracking**: Complete payment lifecycle management

### Technical Improvements
- ✅ **Robust Error Handling**: Graceful failure recovery
- ✅ **Detailed Logging**: Complete payment flow logging
- ✅ **Duplicate Prevention**: Avoid duplicate payment processing
- ✅ **Security**: Input validation and secure data handling
- ✅ **Testing Tools**: Built-in testing and configuration endpoints

## 📋 Prerequisites

### SSLCOMMERZ Account
1. **Create SSLCOMMERZ Account**
   - Visit [SSLCOMMERZ](https://www.sslcommerz.com/)
   - Sign up for a merchant account
   - Complete the verification process

2. **Get API Credentials**
   - Store ID (available in dashboard)
   - Store Password (available in dashboard)
   - IPN URL configuration

### Email Configuration (for invoices)
- SMTP server credentials (Gmail recommended)
- App password for Gmail (if using 2-factor authentication)

## ⚙️ Configuration Setup

### 1. Environment Variables
Update your `.env` file with the following configuration:

```bash
# SSLCOMMERZ Configuration
SSLCOMMERZ_STORE_ID=your-store-id-here
SSLCOMMERZ_STORE_PASSWORD=your-store-password-here
SSLCOMMERZ_IS_LIVE=false  # Set to true for production

# Payment Callback URLs (auto-configured)
SSLCOMMERZ_SUCCESS_URL=http://localhost:3000/payment/success
SSLCOMMERZ_FAIL_URL=http://localhost:3000/payment/fail
SSLCOMMERZ_CANCEL_URL=http://localhost:3000/payment/cancel

# Email Configuration (for invoice emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@somikoron.com
```

### 2. SSLCOMMERZ Dashboard Configuration

#### IPN URL Setup
1. Login to SSLCOMMERZ dashboard
2. Go to **Settings > IPN Settings**
3. Add IPN URL: `https://your-domain.com/api/payment/ipn`
4. Enable IPN for live transactions

#### Allowed Domains
1. Go to **Settings > Allowed Domains**
2. Add your domain: `https://your-domain.com`
3. Add localhost for testing: `http://localhost:3000`

## 🧪 Testing the Payment System

### 1. Configuration Test
Check if SSLCOMMERZ is properly configured:

```bash
GET /api/payment/config
```

**Response Example:**
```json
{
  "sslcommerz": {
    "configured": true,
    "storeId": "CONFIGURED",
    "storePassword": "CONFIGURED",
    "isLive": false,
    "environment": "SANDBOX"
  },
  "urls": {
    "success": "http://localhost:3000/payment/success",
    "fail": "http://localhost:3000/payment/fail",
    "cancel": "http://localhost:3000/payment/cancel"
  }
}
```

### 2. SSLCOMMERZ Connectivity Test
Test the connection to SSLCOMMERZ:

```bash
GET /api/payment/test
```

**Response Example:**
```json
{
  "success": true,
  "message": "SSLCOMMERZ initialized successfully",
  "config": {
    "storeId": "your-store-id",
    "isLive": false,
    "successUrl": "http://localhost:3000/payment/success",
    "failUrl": "http://localhost:3000/payment/fail",
    "cancelUrl": "http://localhost:3000/payment/cancel"
  },
  "testSession": {
    "hasGatewayUrl": true,
    "hasTranId": true
  }
}
```

### 3. Complete Payment Flow Test

#### Step 1: Create Order
```bash
POST /api/orders
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "items": [
    {
      "id": "product-id",
      "name": "Test Product",
      "price": 500,
      "quantity": 2
    }
  ],
  "totalPrice": 1000,
  "shippingFee": 60,
  "finalTotal": 1060,
  "formData": {
    "name": "Test Customer",
    "email": "customer@example.com",
    "phone": "01234567890",
    "address": "123 Test Street",
    "area": "Test Area",
    "paymentMethod": "sslcommerz",
    "paymentGateway": "bkash"
  }
}
```

#### Step 2: Redirect to Payment Gateway
Use the `paymentUrl` from the order creation response to redirect to SSLCOMMERZ.

#### Step 3: Payment Completion
After payment, SSLCOMMERZ will redirect to:
- **Success**: `/payment-success?order_id=xxx&tran_id=xxx`
- **Failure**: `/payment-fail?order_id=xxx&message=xxx`
- **Cancel**: `/payment-cancel?order_id=xxx`

## 🔍 Debugging and Troubleshooting

### Common Issues and Solutions

#### 1. Store ID/Password Issues
**Problem**: Invalid store credentials
**Solution**: 
- Verify Store ID and Password in SSLCOMMERZ dashboard
- Check for extra spaces or special characters
- Ensure using correct credentials (sandbox vs live)

#### 2. IPN Not Working
**Problem**: Payment status not updating
**Solution**:
- Check IPN URL is correctly configured in SSLCOMMERZ dashboard
- Ensure server is publicly accessible (use ngrok for local testing)
- Check server logs for IPN errors

#### 3. Payment Gateway URL Not Working
**Problem**: No redirect URL received
**Solution**:
- Check SSLCOMMERZ service status
- Verify payment data format
- Check network connectivity

#### 4. Email Not Sending
**Problem**: Invoice emails not received
**Solution**:
- Verify email configuration in `.env`
- Check SMTP credentials
- Ensure less secure apps access is enabled (Gmail)
- Use App Password if 2FA is enabled

### Logging and Monitoring

#### Payment Flow Logs
The system logs all payment events:
```
Creating SSLCommerz payment session...
Payment data: {...}
SSLCommerz response: {...}
Payment session created successfully for order 123
Payment success callback received: order_id=123, tran_id=TXN123
Payment validation result: {...}
Order 123 payment validated, modified count: 1
Invoice emails sent for order 123
```

#### Error Logs
All errors are logged with detailed information:
```
SSLCommerz payment error: Error message
Error details: {
  message: "Detailed error message",
  stack: "Error stack trace",
  orderId: "123",
  storeId: "your-store-id",
  isLive: false
}
```

## 📊 Payment Status Flow

```
Order Created → pending_payment
     ↓
Payment Session Created → pending_payment
     ↓
User Redirected to SSLCOMMERZ → pending_payment
     ↓
Payment Successful → paid
     ↓
Invoice Emails Sent → paid
     ↓
Order Processing → pending (for fulfillment)
```

### Payment Status Values
- `pending_payment`: Awaiting payment
- `paid`: Payment completed successfully
- `failed`: Payment failed
- `cancelled`: Payment cancelled by user
- `pending`: Order ready for fulfillment

## 🛡️ Security Features

### Payment Security
- **Transaction Validation**: All payments validated with SSLCOMMERZ
- **Duplicate Prevention**: Checks for already processed payments
- **Secure Callback Handling**: Validates all payment callbacks
- **Data Encryption**: All sensitive data encrypted in transit

### Best Practices
- Always validate payments on server-side
- Never trust client-side payment status
- Use HTTPS for all payment-related URLs
- Implement proper error handling
- Log all payment events for auditing

## 📱 Testing with Mobile Banking

### bKash Test
1. Select bKash as payment method
2. Use test credentials provided by SSLCOMMERZ
3. Complete payment flow
4. Verify order status update

### Nagad Test
1. Select Nagad as payment method
2. Use test mobile number: `018XXXXXXXX`
3. Use test PIN: `123456`
4. Complete payment flow

### Rocket Test
1. Select Rocket as payment method
2. Use test credentials provided by SSLCOMMERZ
3. Complete payment flow
4. Verify order status update

## 🚀 Production Deployment

### Pre-Deployment Checklist
- [ ] SSLCOMMERZ live credentials configured
- [ ] Production domain added to SSLCOMMERZ allowed domains
- [ ] IPN URL updated to production domain
- [ ] Email service configured for production
- [ ] HTTPS certificate installed
- [ ] Database backups enabled
- [ ] Monitoring and logging configured

### Production Configuration
```bash
# Production Environment
SSLCOMMERZ_IS_LIVE=true
SSLCOMMERZ_STORE_ID=live-store-id
SSLCOMMERZ_STORE_PASSWORD=live-store-password

# Production URLs
SSLCOMMERZ_SUCCESS_URL=https://your-domain.com/payment/success
SSLCOMMERZ_FAIL_URL=https://your-domain.com/payment/fail
SSLCOMMERZ_CANCEL_URL=https://your-domain.com/payment/cancel
```

## 📞 Support

### SSLCOMMERZ Support
- **Email**: support@sslcommerz.com
- **Phone**: +8809612366666
- **Documentation**: https://developer.sslcommerz.com/

### Technical Support
For technical issues with the integration:
1. Check server logs for detailed error messages
2. Verify configuration using `/api/payment/config`
3. Test connectivity using `/api/payment/test`
4. Review this documentation for common solutions

## 🔄 API Endpoints Reference

### Payment Endpoints
- `GET /api/payment/config` - Check payment configuration
- `GET /api/payment/test` - Test SSLCOMMERZ connectivity
- `POST /api/orders` - Create order with payment
- `GET /api/payment/success` - Payment success callback
- `GET /api/payment/fail` - Payment failure callback
- `GET /api/payment/cancel` - Payment cancellation callback
- `POST /api/payment/ipn` - SSLCOMMERZ IPN handler
- `POST /api/payment/validate` - Manual payment validation

### Order Endpoints
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get specific order details
- `PATCH /api/admin/orders/:id/status` - Update order status (admin)

---

**Note**: This payment system is production-ready and includes comprehensive error handling, security measures, and logging. Always test thoroughly in sandbox mode before going live.
