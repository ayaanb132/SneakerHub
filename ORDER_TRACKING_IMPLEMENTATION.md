# 📦 Order Tracking Feature (ORD-1) - Implementation Guide

## 🎯 Overview

This document provides complete instructions for integrating the **Order Tracking** feature into the SneakerHub application. The implementation includes both front-end and back-end components with real-time order status updates.

---

## 📋 Features Implemented

✅ **User Authentication**
- JWT-based authentication
- Secure login/registration
- Token-based session management

✅ **Order Management**
- Create orders
- View all orders for authenticated user
- View individual order details
- Update order status (admin/testing)

✅ **Order Tracking**
- Three status levels: **Processing**, **Shipped**, **Delivered**
- Real-time status updates (auto-refresh every 30 seconds)
- Visual timeline showing order progression
- Estimated delivery dates
- Tracking numbers for shipped orders
- User-specific order filtering

✅ **Security**
- Users can only view their own orders
- Password hashing with bcrypt
- JWT token expiration
- Protected API endpoints

---

## 🗂️ Project Structure

```
SneakerHub/
├── index.HTML                    # Homepage
├── src/
│   ├── checkout-page.HTML        # Checkout (existing)
│   ├── user-registration.HTML    # Registration (existing)
│   ├── order-tracking.HTML       # ✨ NEW: Order tracking page
│   ├── order-tracking.js         # ✨ NEW: Order tracking logic
│   └── UI-1.js                   # Existing UI code
├── server.js                     # ✨ NEW: Backend API server
├── package.json                  # ✨ NEW: Node.js dependencies
├── seed-database.js              # ✨ NEW: Sample data generator
├── .env.example                  # ✨ NEW: Environment template
└── .gitignore                    # ✨ NEW: Git ignore rules
```

---

## 🚀 Setup Instructions

### Step 1: Install Backend Dependencies

```bash
cd /Users/ayaanbaig/Desktop/SneakerHub
npm install
```

This will install:
- `express` - Web framework
- `cors` - Enable cross-origin requests
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `better-sqlite3` - SQLite database

### Step 2: Set Up Environment Variables (Optional)

```bash
cp .env.example .env
```

Edit `.env` to customize settings (or use defaults).

### Step 3: Seed Database with Sample Data

```bash
npm run seed
```

This creates sample users and orders:
- **Email:** `john.doe@example.com` | **Password:** `password123`
- **Email:** `jane.smith@example.com` | **Password:** `password123`
- **Email:** `test@sneakerhub.com` | **Password:** `password123`

### Step 4: Start the Backend Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

Server will run at: `http://localhost:3000`

### Step 5: Open Front-End

Open `src/order-tracking.HTML` in your browser or serve it with a local server.

**Using VS Code Live Server:**
1. Install "Live Server" extension
2. Right-click `order-tracking.HTML` → "Open with Live Server"

**Using Python:**
```bash
python3 -m http.server 8080
# Then visit: http://localhost:8080/src/order-tracking.HTML
```

---

## 🔌 API Endpoints

### Authentication

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "email": "user@example.com" }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "email": "user@example.com" }
}
```

### Orders

#### Get All User Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

**Response:**
```json
{
  "orders": [
    {
      "orderId": "ORD-2025-1234ABC",
      "status": "Shipped",
      "totalAmount": 259.98,
      "orderDate": "2025-11-01T00:00:00.000Z",
      "statusUpdatedAt": "2025-11-05T00:00:00.000Z",
      "estimatedDelivery": "2025-11-12T00:00:00.000Z",
      "trackingNumber": "TRK-2025-SHIPPED",
      "shippingAddress": {
        "name": "John Doe",
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001"
      },
      "items": [
        {
          "productId": "SKU-001",
          "name": "Runner X2000",
          "size": 10,
          "price": 129.99,
          "quantity": 2
        }
      ]
    }
  ]
}
```

#### Get Specific Order
```http
GET /api/orders/:orderId
Authorization: Bearer <token>
```

#### Create New Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "SKU-001",
      "name": "Runner X2000",
      "size": 10,
      "price": 129.99,
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "totalAmount": 129.99
}
```

#### Update Order Status (Testing/Admin)
```http
PATCH /api/orders/:orderId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Shipped"
}
```

Valid statuses: `Processing`, `Shipped`, `Delivered`

---

## 🔗 Integration with Existing Code

### 1. Update User Registration Page

Modify `src/user-registration.HTML` to handle actual authentication:

```javascript
// Add this script to user-registration.HTML
document.getElementById('registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save token and redirect
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userEmail', data.user.email);
            alert('Registration successful!');
            window.location.href = 'order-tracking.HTML';
        } else {
            alert('Registration failed: ' + data.error);
        }
    } catch (error) {
        alert('Network error: ' + error.message);
    }
});
```

### 2. Update Checkout Page

Modify `src/checkout-page.HTML` to create orders:

```javascript
// Add this to the "Place Order" button onclick
async function placeOrder() {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        alert('Please log in to place an order');
        window.location.href = 'user-registration.HTML';
        return;
    }
    
    // Get form data
    const name = document.querySelector('input[placeholder="Full Name"]').value;
    const street = document.querySelector('input[placeholder="Street Address"]').value;
    const city = document.querySelector('input[placeholder="City"]').value;
    const state = document.querySelector('input[placeholder="State"]').value;
    const zipCode = document.querySelector('input[placeholder="Zip Code"]').value;
    
    const orderData = {
        items: [
            { productId: 'SKU-001', name: 'Runner X2000', size: 10, price: 129.99, quantity: 2 }
        ],
        shippingAddress: { name, street, city, state, zipCode },
        totalAmount: 275.50
    };
    
    try {
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Order placed successfully! Order ID: ' + data.orderId);
            window.location.href = 'order-tracking.HTML';
        } else {
            alert('Order failed: ' + data.error);
        }
    } catch (error) {
        alert('Network error: ' + error.message);
    }
}
```

### 3. Add Navigation Links

Add order tracking link to main navigation in `index.HTML`:

```html
<nav class="bg-indigo-600 text-white p-4">
    <a href="src/order-tracking.HTML">Track Orders</a>
    <a href="src/user-registration.HTML">Login/Register</a>
</nav>
```

---

## 🧪 Testing Guide

### Test Scenario 1: View Existing Orders
1. Open `http://localhost:8080/src/order-tracking.HTML`
2. Browser will redirect to login (if not authenticated)
3. Login with: `john.doe@example.com` / `password123`
4. You should see 3 orders with different statuses

### Test Scenario 2: Real-Time Updates
1. Open order tracking page
2. In another tab/terminal, update order status:
```bash
curl -X PATCH http://localhost:3000/api/orders/ORD-2025-9012GHI/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "Shipped"}'
```
3. Wait 30 seconds or refresh page
4. Status should update automatically

### Test Scenario 3: Create New Order
Use the updated checkout page or Postman/curl to create an order.

---

## 🗄️ Database Schema

### `users` Table
| Column      | Type    | Description              |
|-------------|---------|--------------------------|
| id          | INTEGER | Primary key (auto)       |
| email       | TEXT    | Unique email             |
| password    | TEXT    | Hashed password          |
| createdAt   | DATETIME| Registration timestamp   |

### `orders` Table
| Column              | Type    | Description                    |
|---------------------|---------|--------------------------------|
| id                  | INTEGER | Primary key (auto)             |
| orderId             | TEXT    | Unique order ID (e.g., ORD-...) |
| userId              | INTEGER | Foreign key to users           |
| status              | TEXT    | Processing/Shipped/Delivered   |
| totalAmount         | REAL    | Total order amount             |
| orderDate           | DATETIME| Order creation date            |
| statusUpdatedAt     | DATETIME| Last status update             |
| estimatedDelivery   | DATETIME| Estimated delivery date        |
| trackingNumber      | TEXT    | Shipping tracking number       |
| shippingName        | TEXT    | Recipient name                 |
| shippingStreet      | TEXT    | Street address                 |
| shippingCity        | TEXT    | City                           |
| shippingState       | TEXT    | State                          |
| shippingZipCode     | TEXT    | Zip code                       |

### `order_items` Table
| Column      | Type    | Description              |
|-------------|---------|--------------------------|
| id          | INTEGER | Primary key (auto)       |
| orderId     | TEXT    | Foreign key to orders    |
| productId   | TEXT    | Product SKU              |
| name        | TEXT    | Product name             |
| size        | INTEGER | Shoe size                |
| price       | REAL    | Item price               |
| quantity    | INTEGER | Quantity ordered         |

---

## ⚠️ Important Notes & Assumptions

### Assumptions Made:
1. **No existing backend** - Created from scratch
2. **Simple authentication** - JWT-based, suitable for MVP
3. **SQLite database** - Easy setup, suitable for development
4. **Three order statuses** - Processing → Shipped → Delivered
5. **Auto-refresh** - Updates every 30 seconds (configurable)
6. **Browser localStorage** - Used for token storage

### Security Considerations (Production):
- [ ] Change JWT_SECRET to a strong random string
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Add input validation/sanitization
- [ ] Use secure cookie storage instead of localStorage
- [ ] Implement refresh tokens
- [ ] Add CSRF protection
- [ ] Set up proper CORS policies
- [ ] Use environment variables for configuration
- [ ] Migrate to PostgreSQL/MySQL for production

### Before Going Live:
1. Update `API_BASE_URL` in `order-tracking.js` to production URL
2. Set strong `JWT_SECRET` in `.env`
3. Add proper error handling and logging
4. Implement admin dashboard for order management
5. Add email notifications for status changes
6. Implement proper payment processing
7. Add order cancellation feature
8. Set up database backups

---

## 🎨 UI Features

- **Responsive Design** - Works on mobile and desktop
- **Status Color Coding** - Visual indicators for order status
- **Timeline View** - Shows order progression
- **Auto-Refresh** - Real-time updates every 30 seconds
- **Loading States** - Smooth loading indicators
- **Error Handling** - User-friendly error messages
- **Authentication Flow** - Seamless login/logout

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to server"
- Ensure backend server is running (`npm start`)
- Check if port 3000 is available
- Verify `API_BASE_URL` in `order-tracking.js`

### Issue: "Token expired"
- Login again to get a new token
- Tokens expire after 7 days by default

### Issue: "No orders displayed"
- Verify user is logged in
- Check if orders exist in database
- Run `npm run seed` to add sample data

### Issue: "CORS errors"
- Server has CORS enabled by default
- Check browser console for specific errors

---

## 📞 Support & Questions

For issues or questions about this implementation:
1. Check the troubleshooting section above
2. Review API endpoint documentation
3. Check browser console for errors
4. Verify database contents using SQLite browser

---

## 🔄 Next Steps / Future Enhancements

- [ ] Add order cancellation feature
- [ ] Implement email notifications
- [ ] Add order search/filter functionality
- [ ] Create admin dashboard
- [ ] Add order history export
- [ ] Implement real shipping carrier integration
- [ ] Add order reviews/ratings
- [ ] Implement return/refund system
- [ ] Add push notifications
- [ ] Create mobile app

---

**Created:** November 9, 2025  
**Version:** 1.0.0  
**Feature ID:** ORD-1
