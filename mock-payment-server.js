const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

// Mock payment route
app.get("/api/payment/mock", (req, res) => {
    const { order_id, amount } = req.query;
    
    if (!order_id || !amount) {
        return res.status(400).send("Invalid payment request");
    }

    // Send simple HTML response
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Mock Payment Gateway</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .payment-method { border: 2px solid #ddd; margin: 10px 0; padding: 20px; border-radius: 8px; cursor: pointer; }
        .payment-method:hover { border-color: #007bff; }
        .payment-method h3 { margin: 0 0 10px 0; color: #333; }
        .payment-method p { margin: 5px 0; color: #666; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 10px 5px; }
        .btn:hover { background: #0056b3; }
        .btn.cancel { background: #6c757d; }
        .btn.cancel:hover { background: #545b62; }
    </style>
</head>
<body>
    <h2>Mock Payment Gateway</h2>
    <p><strong>Order ID:</strong> ${order_id}</p>
    <p><strong>Amount:</strong> ৳${amount}</p>
    
    <div class="payment-method" onclick="processPayment('card')">
        <h3>💳 Credit/Debit Card</h3>
        <p>Visa, Mastercard, AMEX</p>
        <button class="btn" onclick="processPayment('card')">Pay with Card</button>
    </div>
    
    <div class="payment-method" onclick="processPayment('bkash')">
        <h3>📱 bKash</h3>
        <p>Mobile Banking</p>
        <button class="btn" onclick="processPayment('bkash')">Pay with bKash</button>
    </div>
    
    <div class="payment-method" onclick="processPayment('nagad')">
        <h3>📱 Nagad</h3>
        <p>Mobile Banking</p>
        <button class="btn" onclick="processPayment('nagad')">Pay with Nagad</button>
    </div>
    
    <div class="payment-method" onclick="processPayment('rocket')">
        <h3>🚀 Rocket</h3>
        <p>Mobile Banking</p>
        <button class="btn" onclick="processPayment('rocket')">Pay with Rocket</button>
    </div>
    
    <button class="btn cancel" onclick="window.location.href='/payment/cancel?order_id=${order_id}'">Cancel Payment</button>
    
    <script>
        function processPayment(method) {
            setTimeout(function() {
                window.location.href = '/payment/success?order_id=${order_id}&tran_id=SOM-${order_id}-${Date.now()}&method=${method}&status=success';
            }, 1500);
        }
    </script>
</body>
</html>
    `;
    
    res.send(html);
});

// Redirect to success page
app.get("/payment/success", (req, res) => {
    const { order_id, tran_id } = req.query;
    res.redirect(`/payment/success?order_id=${order_id}&tran_id=${tran_id}`);
});

// Start server
app.listen(PORT, () => {
    console.log(`Mock payment server running on http://localhost:${PORT}`);
});
