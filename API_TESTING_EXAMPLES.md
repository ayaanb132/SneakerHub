# SneakerHub API Testing Examples

This file contains examples for testing the Order Tracking API using different tools.

## Using cURL

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Register New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

**Save the token from the response for subsequent requests!**

### 4. Get All Orders (Replace YOUR_TOKEN)
```bash
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Get Specific Order
```bash
curl http://localhost:3000/api/orders/ORD-2025-1234ABC \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Create New Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### 7. Update Order Status
```bash
curl -X PATCH http://localhost:3000/api/orders/ORD-2025-1234ABC/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "Shipped"}'
```

---

## Using HTTPie (Alternative to cURL)

### Install HTTPie
```bash
brew install httpie  # macOS
# or
pip install httpie
```

### Examples

```bash
# Health Check
http GET localhost:3000/api/health

# Login
http POST localhost:3000/api/auth/login \
  email=john.doe@example.com \
  password=password123

# Get Orders (set TOKEN variable first)
http GET localhost:3000/api/orders \
  Authorization:"Bearer $TOKEN"

# Create Order
http POST localhost:3000/api/orders \
  Authorization:"Bearer $TOKEN" \
  items:='[{"productId":"SKU-001","name":"Runner X2000","size":10,"price":129.99,"quantity":1}]' \
  shippingAddress:='{"name":"John Doe","street":"123 Main St","city":"NYC","state":"NY","zipCode":"10001"}' \
  totalAmount:=129.99
```

---

## Using Postman

### Setup
1. Download Postman: https://www.postman.com/downloads/
2. Import collection or create requests manually

### Environment Variables
Create environment variables in Postman:
- `base_url`: `http://localhost:3000/api`
- `token`: (will be set after login)

### Requests

#### 1. Login Request
- **Method:** POST
- **URL:** `{{base_url}}/auth/login`
- **Body (JSON):**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```
- **Test Script (to save token):**
```javascript
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.token);
```

#### 2. Get Orders
- **Method:** GET
- **URL:** `{{base_url}}/orders`
- **Headers:**
  - `Authorization`: `Bearer {{token}}`

#### 3. Create Order
- **Method:** POST
- **URL:** `{{base_url}}/orders`
- **Headers:**
  - `Authorization`: `Bearer {{token}}`
  - `Content-Type`: `application/json`
- **Body (JSON):**
```json
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

---

## Using JavaScript/Fetch (Browser Console)

Open browser console on the order tracking page and run:

```javascript
// Get token from localStorage
const token = localStorage.getItem('authToken');

// Fetch orders
fetch('http://localhost:3000/api/orders', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => console.log('Orders:', data))
  .catch(err => console.error('Error:', err));

// Create order
fetch('http://localhost:3000/api/orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    items: [
      {
        productId: 'SKU-TEST',
        name: 'Test Sneaker',
        size: 10,
        price: 99.99,
        quantity: 1
      }
    ],
    shippingAddress: {
      name: 'Test User',
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345'
    },
    totalAmount: 99.99
  })
})
  .then(res => res.json())
  .then(data => console.log('New Order:', data))
  .catch(err => console.error('Error:', err));
```

---

## Using Node.js Test Script

Run the included test script:

```bash
node test-api.js
```

This will automatically test all major endpoints.

---

## Sample Response Examples

### Login Response
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJpYXQiOjE2OTk1MDAwMDAsImV4cCI6MTcwMDEwNDgwMH0.xyz",
  "user": {
    "email": "john.doe@example.com"
  }
}
```

### Get Orders Response
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

### Error Response (401 Unauthorized)
```json
{
  "error": "Access token required"
}
```

---

## Testing Workflow

1. **Start Server**: `npm start`
2. **Seed Database**: `npm run seed` (if not done)
3. **Login**: Use login endpoint to get token
4. **Test Protected Endpoints**: Use token in Authorization header
5. **Create Orders**: Test order creation
6. **Update Status**: Test status updates
7. **Verify Real-Time Updates**: Check front-end auto-refresh

---

## Troubleshooting

### "Cannot connect to server"
- Ensure server is running: `npm start`
- Check if port 3000 is free
- Verify URL: `http://localhost:3000`

### "Invalid or expired token"
- Login again to get fresh token
- Tokens expire after 7 days

### "CORS error"
- Should not happen as CORS is enabled
- Check if frontend and backend are on correct ports

---

**Tip:** Use Postman collections to save and organize all these requests!
