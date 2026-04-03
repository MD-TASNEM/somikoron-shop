# 🔧 Payment Gateway Error - Complete Fix Guide

## 🚨 Common Payment Gateway Issues & Solutions

### **Issue 1: Invalid SSLCOMMERZ Credentials**

**Problem**: Using test/invalid credentials
**Solution**: Update with proper SSLCOMMERZ sandbox credentials

#### **Step 1: Get Valid SSLCOMMERZ Test Credentials**

1. **Visit SSLCOMMERZ Developer Portal**
   - Go to: https://developer.sslcommerz.com/
   - Sign up for a test account
   - Get your test Store ID and Password

2. **Or Use Working Test Credentials** (Temporary Fix)
   ```bash
   # Update your .env file with these working test credentials:
   SSLCOMMERZ_STORE_ID=demo
   SSLCOMMERZ_STORE_PASSWORD=demo
   SSLCOMMERZ_IS_LIVE=false
   ```

#### **Step 2: Update Environment Variables**

Open your `.env` file and replace the SSLCOMMERZ section:

```bash
# SSLCOMMERZ Configuration (Updated)
SSLCOMMERZ_STORE_ID=demo
SSLCOMMERZ_STORE_PASSWORD=demo
SSLCOMMERZ_IS_LIVE=false

# Payment Callback URLs
SSLCOMMERZ_SUCCESS_URL=http://localhost:3000/payment/success
SSLCOMMERZ_FAIL_URL=http://localhost:3000/payment/fail
SSLCOMMERZ_CANCEL_URL=http://localhost:3000/payment/cancel
```

---

### **Issue 2: Server Configuration Problems**

**Problem**: Server not properly configured for payment callbacks
**Solution**: Fix server configuration and endpoints

#### **Step 1: Check Server Status**

Test if your server is running properly:

```bash
# Check if server is running
curl http://localhost:3000/api/payment/config

# Expected Response:
{
  "sslcommerz": {
    "configured": true,
    "storeId": "CONFIGURED",
    "storePassword": "CONFIGURED",
    "isLive": false,
    "environment": "SANDBOX"
  }
}
```

#### **Step 2: Test SSLCOMMERZ Connectivity**

```bash
# Test SSLCOMMERZ connection
curl http://localhost:3000/api/payment/test

# Expected Response:
{
  "success": true,
  "message": "SSLCOMMERZ initialized successfully"
}
```

---

### **Issue 3: Payment Session Creation Errors**

**Problem**: Payment session not created properly
**Solution**: Fix payment data structure and API calls

#### **Step 1: Check Payment Data Format**

Ensure your payment request includes all required fields:

```javascript
// Correct payment data structure
const paymentData = {
  total_amount: 1000,
  currency: "BDT",
  tran_id: "UNIQUE-TRANSACTION-ID",
  success_url: "http://localhost:3000/api/payment/success",
  fail_url: "http://localhost:3000/api/payment/fail",
  cancel_url: "http://localhost:3000/api/payment/cancel",
  ipn_url: "http://localhost:3000/api/payment/ipn",
  product_name: "Product Name",
  product_category: "ecommerce",
  cus_name: "Customer Name",
  cus_email: "customer@example.com",
  cus_phone: "01234567890",
  cus_add1: "Customer Address",
  cus_city: "City",
  cus_country: "Bangladesh"
};
```

---

### **Issue 4: Callback URL Problems**

**Problem**: Payment callbacks not working
**Solution**: Fix callback URL configuration

#### **Step 1: Update Callback URLs**

Make sure all callback URLs point to your local server:

```bash
# In your .env file:
SSLCOMMERZ_SUCCESS_URL=http://localhost:3000/api/payment/success
SSLCOMMERZ_FAIL_URL=http://localhost:3000/api/payment/fail
SSLCOMMERZ_CANCEL_URL=http://localhost:3000/api/payment/cancel
```

#### **Step 2: Use ngrok for Testing (Optional)**

If SSLCOMMERZ requires public URLs:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok for your local server
ngrok http 3000

# Update your .env with ngrok URLs:
# https://abc123.ngrok.io/api/payment/success
```

---

## 🛠️ **Quick Fix Steps**

### **Step 1: Immediate Fix**

1. **Stop the server** (Ctrl+C in terminal)
2. **Update .env file** with working credentials
3. **Restart the server**

```bash
# Stop server: Ctrl+C
# Update .env with:
SSLCOMMERZ_STORE_ID=demo
SSLCOMMERZ_STORE_PASSWORD=demo
SSLCOMMERZ_IS_LIVE=false

# Restart server:
npm run dev
```

### **Step 2: Test Payment Flow**

1. **Go to**: `http://localhost:3000`
2. **Login as admin**: `admin@somikoron.com` / `admin123`
3. **Add products to cart**
4. **Proceed to checkout**
5. **Select SSLCOMMERZ payment**
6. **Choose payment method** (bKash, Nagad, etc.)
7. **Complete payment**

---

## 🔍 **Debugging Tools**

### **Check Server Logs**

Look for these specific error messages in your server console:

```bash
# Common error messages to watch for:
- "SSLCommerz payment error"
- "Failed to create payment session"
- "Invalid payment gateway response"
- "Payment validation failed"
```

### **Test Endpoints**

Use these endpoints to debug:

```bash
# 1. Check configuration
GET http://localhost:3000/api/payment/config

# 2. Test connectivity
GET http://localhost:3000/api/payment/test

# 3. Test email (if needed)
GET http://localhost:3000/api/test-email
```

---

## 🚀 **Production Payment Setup**

### **For Live Payments**

1. **Get Live SSLCOMMERZ Credentials**
   - Contact SSLCOMMERZ support
   - Get production Store ID and Password
   - Set up your business account

2. **Update Production Configuration**
   ```bash
   SSLCOMMERZ_STORE_ID=your-live-store-id
   SSLCOMMERZ_STORE_PASSWORD=your-live-password
   SSLCOMMERZ_IS_LIVE=true
   ```

3. **Configure Live URLs**
   ```bash
   SSLCOMMERZ_SUCCESS_URL=https://yourdomain.com/api/payment/success
   SSLCOMMERZ_FAIL_URL=https://yourdomain.com/api/payment/fail
   SSLCOMMERZ_CANCEL_URL=https://yourdomain.com/api/payment/cancel
   ```

---

## 📞 **Support & Help**

### **If Issues Persist**

1. **Check SSLCOMMERZ Status**
   - Visit: https://status.sslcommerz.com/
   - Verify service is operational

2. **Contact SSLCOMMERZ Support**
   - Email: support@sslcommerz.com
   - Phone: +8809612366666

3. **Check Documentation**
   - SSLCOMMERZ API Docs: https://developer.sslcommerz.com/
   - Your project docs: `SSLCOMMERZ-PAYMENT-SETUP.md`

---

## ✅ **Verification Checklist**

After applying fixes, verify:

- [ ] Server starts without errors
- [ ] `/api/payment/config` returns "configured": true
- [ ] `/api/payment/test` returns success
- [ ] Cart checkout works
- [ ] Payment session is created
- [ ] Redirect to SSLCOMMERZ works
- [ ] Payment completion works
- [ ] Order status updates correctly

---

## 🔧 **Advanced Troubleshooting**

### **Check Network Issues**

```bash
# Test internet connectivity
ping sslcommerz.com

# Test SSLCOMMERZ API
curl -I https://sandbox.sslcommerz.com
```

### **Check Node.js Version**

```bash
# Ensure compatible Node.js version
node --version  # Should be 16.x or higher
```

### **Check Dependencies**

```bash
# Verify all packages are installed
npm install

# Check for SSLCOMMERZ package
npm list sslcommerz-lts
```

---

**🎯 Follow these steps to resolve your payment gateway error. The most common fix is updating the SSLCOMMERZ credentials in your .env file!**
