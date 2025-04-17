<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f4f5f7;
            margin: 0;
            padding: 0;
            color: #333333;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 30px;
            border-radius: 6px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .header {
            text-align: center;
            border-bottom: 1px solid #eaeaea;
            padding-bottom: 20px;
            margin-bottom: 25px;
        }
        .logo {
            margin-bottom: 15px;
        }
        h2 {
            color: #2c3e50;
            font-size: 22px;
            margin-top: 0;
            font-weight: 600;
        }
        .content {
            color: #333333;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            margin-top: 15px;
            padding: 12px 24px;
            background-color: #1a73e8;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            text-align: center;
        }
        .button:hover {
            background-color: #0d66da;
        }
        .image-container {
            text-align: center;
            margin: 25px 0;
            padding: 15px;
            border: 1px solid #eaeaea;
            border-radius: 5px;
        }
        .image-container img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eaeaea;
            color: #777777;
            font-size: 13px;
            text-align: center;
        }
    </style>
</head>
<body>
<div class="email-container">
    <!-- Company Logo -->
    <div class="header">
        <div class="logo">
            <img src="/api/placeholder/150/50" alt="Company Logo" width="150">
        </div>
        <h2>Order Confirmation</h2>
    </div>

    <!-- Email Content -->
    <div class="content">
        <p>Dear <strong>{{ $details['customer_name'] }}</strong>,</p>

        <p>Thank you for your purchase! Your order <strong>{{ $details['order_number'] }}</strong> has been successfully received and is now being processed.</p>

        <p>We appreciate your business and will notify you once your order has shipped.</p>

        <!-- Downloadable Image -->
        <div class="image-container">
            <img src="/api/placeholder/400/300" alt="Invoice Image">
            <p><a href="https://example.com/download/invoice.jpg" class="button" download>Download Invoice</a></p>
        </div>

        <p>If you have any questions about your order, please contact our customer service team.</p>

        <p>Thank you for shopping with us!</p>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>&copy; 2025 Your Company Name. All rights reserved.</p>
    </div>
</div>
</body>
</html>
