# Vercel Deployment Guide for Somikoron Shop

## Overview
This guide will help you deploy the server-side API of Somikoron Shop to Vercel serverless functions.

## Prerequisites
- Vercel account
- MongoDB Atlas database
- SSLCOMMERZ account (for payment gateway)
- Gmail account (for email notifications)

## Environment Variables
Set these in your Vercel project settings:

### Database Configuration
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/somikoron_shop
MONGODB_DB=somikoron_shop
```

### Authentication
```
JWT_SECRET=your_super_secret_jwt_key_here
```

### Email Configuration
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@somikoron.com
```

### Payment Gateway
```
SSLCOMMERZ_STORE_ID=your_sslcommerz_store_id
SSLCOMMERZ_STORE_PASSWORD=your_sslcommerz_store_password
SSLCOMMERZ_IS_LIVE=false
```

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
vercel --prod
```

## Project Structure
```
somikoron-shop/
├── api/
│   └── index.js          # Serverless function entry point
├── vercel.json           # Vercel configuration
├── package.json          # Dependencies and scripts
└── .env.example          # Environment variables template
```

## API Endpoints
Once deployed, your API will be available at:
- Base URL: `https://your-project-name.vercel.app`
- API endpoints: `https://your-project-name.vercel.app/api/*`

### Key Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/products` - Get products
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders

## CORS Configuration
The API is configured to accept requests from:
- `https://somikoron-shop.vercel.app` (production client)
- `http://localhost:3000` (development)

## Important Notes

### 1. Database Connection
- Ensure your MongoDB Atlas allows access from Vercel's IP ranges
- Add `0.0.0.0/0` to Network Access for testing (not recommended for production)

### 2. Email Setup
- Enable 2FA on your Gmail account
- Generate an App Password for the EMAIL_PASS
- Use the app password, not your regular password

### 3. SSLCOMMERZ Setup
- Use sandbox credentials for testing
- Set `SSLCOMMERZ_IS_LIVE=false` for development
- Update to production credentials before going live

### 4. Client Configuration
Update your client-side API base URL to:
```javascript
const API_BASE_URL = 'https://your-project-name.vercel.app/api';
```

## Testing
1. Deploy to Vercel
2. Test endpoints using the provided URLs
3. Verify CORS is working with your client application
4. Test payment flow with SSLCOMMERZ sandbox

## Troubleshooting

### Common Issues
1. **Database Connection Failed**: Check MONGODB_URI and network access
2. **CORS Errors**: Verify client URL is in CORS origin list
3. **Payment Gateway Errors**: Check SSLCOMMERZ credentials
4. **Email Not Sending**: Verify Gmail app password configuration

### Debugging
- Check Vercel function logs
- Use `/api/debug` endpoint to verify API is running
- Test individual endpoints with tools like Postman

## Production Considerations
- Set `SSLCOMMERZ_IS_LIVE=true` for production payments
- Use strong JWT secrets
- Restrict database access to specific IP ranges
- Monitor API usage and errors through Vercel analytics
