<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f6f6f6;
            margin: 0;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        .content {
            color: #333333;
        }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background-color: #007BFF;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
        .image-container {
            text-align: center;
            margin-top: 20px;
        }
        .image-container img {
            max-width: 100%;
            height: auto;
            border-radius: 5px;
        }
        .footer {
            font-size: 12px;
            color: #777777;
            text-align: center;
            margin-top: 30px;
        }
    </style>
</head>
<body>
<div class="email-container">
    <!-- Company Logo -->
    <div class="logo">
        <img src="https://example.com/logo.png" alt="Company Logo" width="150">
    </div>

    <!-- Email Content -->
    <div class="content">
        <h2>Order Confirmation</h2>
        <p>Hi <strong>{{ $details['customer_name'] }}</strong>,</p>
        <p>Thank you for your purchase! Your order <strong>#{{ $details['order_number'] }}</strong> has been successfully received.</p>

        <!-- Downloadable Image -->
        <div class="image-container">
            <a href="https://example.com/download/invoice.jpg" download>
                <img src="https://example.com/download/invoice.jpg" alt="Invoice Image">
            </a>
            <p><a href="https://example.com/download/invoice.jpg" class="button" download>Download Image</a></p>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        &copy; 2025 Your Company Name. All rights reserved.
    </div>
</div>
</body>
</html>
