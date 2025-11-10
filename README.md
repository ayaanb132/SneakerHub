````markdown
# 🏠 SneakerHub

A web app where users can browse and purchase sneakers with complete order tracking functionality.  
Built collaboratively by our group using Git and GitHub for version control.

## ✨ New Features

### 🎯 Order Tracking (ORD-1) - IMPLEMENTED ✅
- **Real-time order status tracking**: Processing → Shipped → Delivered
- **User authentication**: Secure JWT-based login/registration
- **Order history**: View all your past and current orders
- **Shipment details**: Track your packages with tracking numbers
- **Auto-refresh**: Updates every 30 seconds for real-time status
- **Responsive UI**: Works on mobile and desktop

**📚 Full Documentation**: See [ORDER_TRACKING_IMPLEMENTATION.md](ORDER_TRACKING_IMPLEMENTATION.md)

---

## 🚀 Quick Start

### For Front-End Only Development
Just open any HTML file in your browser or use Live Server.

### For Full Stack (Order Tracking Feature)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Seed database with sample data:**
   ```bash
   npm run seed
   ```

3. **Start backend server:**
   ```bash
   npm start
   ```

4. **Open front-end:**
   - Open `src/order-tracking.HTML` in browser
   - Or use Live Server extension in VS Code

**Test Login:**
- Email: `john.doe@example.com`
- Password: `password123`

---

## ⚙️ Setup Instructions (EVERY MEMBER MUST FOLLOW)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ayaanb132/SneakerHub.git
   cd SneakerHub
   ```

2. **Create your personal branch (use your name or feature):**
   ```bash
   git checkout -b yourname-feature
   ```

3. **Before starting work, pull the latest updates from `main`:**
   ```bash
   git checkout main
   git pull origin main
   git checkout yourname-feature
   git merge main
   ```

4. **After finishing work, push your branch:**
   ```bash
   git add .
   git commit -m "Describe your changes briefly"
   git push origin yourname-feature
   ```

5. **Create a Pull Request (PR):**
   - Go to GitHub → open your branch → click **“Compare & pull request.”**
   - I’ll review and merge into `main` after approval.

---

## 🧩 Branch Workflow Summary

- Each member works on their **own branch**.
- Never push directly to `main`.
- Pull latest changes before starting work to avoid conflicts.
- Only the project lead merges PRs into `main`.

---

## 🧾 Folder Structure
```
SneakerHub/
├── index.HTML                      # Homepage
├── README.md                       # This file
├── ORDER_TRACKING_IMPLEMENTATION.md # Complete ORD-1 documentation
├── API_TESTING_EXAMPLES.md         # API testing guide
├── package.json                    # Node.js dependencies
├── server.js                       # Backend API server
├── seed-database.js                # Sample data generator
├── test-api.js                     # Automated API tests
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
└── src/
    ├── checkout-page.HTML          # Checkout page
    ├── user-registration.HTML      # Login/Register page
    ├── order-tracking.HTML         # ✨ NEW: Order tracking page
    ├── order-tracking.js           # ✨ NEW: Order tracking logic
    ├── search-products.HTML        # Product search
    └── UI-1.js                     # UI utilities
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login existing user

### Orders (ORD-1)
- `GET /api/orders` - Get all user orders
- `GET /api/orders/:orderId` - Get specific order
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:orderId/status` - Update order status

**Full API documentation**: See [API_TESTING_EXAMPLES.md](API_TESTING_EXAMPLES.md)

---

## 🧪 Testing

### Test the API
```bash
node test-api.js
```

### Test with cURL
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"password123"}'

# Get orders (replace TOKEN)
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer TOKEN"
```

More examples in [API_TESTING_EXAMPLES.md](API_TESTING_EXAMPLES.md)

---

## 🗄️ Database

**Database Type**: SQLite (file: `sneakerhub.db`)

**Tables:**
- `users` - User accounts
- `orders` - Order records
- `order_items` - Order line items

**Seed Data:**
```bash
npm run seed
```
Creates 3 test users with sample orders.

---

## 🔐 Authentication

**Method**: JWT (JSON Web Tokens)  
**Token Expiry**: 7 days  
**Storage**: localStorage (frontend)

**Sample Login Flow:**
1. User logs in via `/api/auth/login`
2. Server returns JWT token
3. Frontend stores token in localStorage
4. Token included in Authorization header for protected routes

---

## ✅ Example Commands

```bash
git checkout -b ayaan-ui
# (do some coding)
git add .
git commit -m "Added homepage UI"
git push origin ayaan-ui
```

Then open a Pull Request on GitHub.

---

## 🧠 Tips

- Always **sync with `main`** before working:
  ```bash
  git checkout main
  git pull origin main
  git checkout yourname-feature
  git merge main
  ```
- Write **clear commit messages.**
- Check **GitHub PR comments** regularly.
- **Don't commit** `node_modules/` or `.env` files (already in .gitignore)
- **Backend must be running** for order tracking to work

---

## 📚 Additional Resources

- **Order Tracking Implementation**: [ORDER_TRACKING_IMPLEMENTATION.md](ORDER_TRACKING_IMPLEMENTATION.md)
- **API Testing Guide**: [API_TESTING_EXAMPLES.md](API_TESTING_EXAMPLES.md)
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Express.js**: https://expressjs.com/
- **JWT Authentication**: https://jwt.io/

---

## 🛠️ Tech Stack

**Frontend:**
- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript
- Fetch API for HTTP requests

**Backend:**
- Node.js
- Express.js
- SQLite (better-sqlite3)
- JWT for authentication
- bcrypt for password hashing

---

## 🔄 Development Workflow

1. **Pull latest changes**
   ```bash
   git checkout main && git pull origin main
   ```

2. **Create/switch to your branch**
   ```bash
   git checkout -b yourname-feature
   ```

3. **Make your changes**
   - Edit files as needed
   - Test locally

4. **Commit and push**
   ```bash
   git add .
   git commit -m "Add feature X"
   git push origin yourname-feature
   ```

5. **Create Pull Request**
   - Go to GitHub
   - Click "Compare & pull request"
   - Wait for review

---

## 🐛 Troubleshooting

### "Cannot connect to server"
- Make sure server is running: `npm start`
- Check if port 3000 is available
- Verify URL: `http://localhost:3000`

### "No orders showing"
- Run database seed: `npm run seed`
- Check if logged in with correct user
- Open browser console for errors

### "Token expired"
- Tokens expire after 7 days
- Login again to get fresh token

### "Module not found"
- Run `npm install` to install dependencies
- Check if you're in the correct directory

---

## 📝 Future Enhancements

- [ ] Payment processing integration
- [ ] Email notifications for status changes
- [ ] Admin dashboard for order management
- [ ] Product inventory management
- [ ] Shopping cart persistence
- [ ] Order cancellation feature
- [ ] Real shipping carrier integration
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search and filters

---

**Repository:** [SneakerHub](https://github.com/ayaanb132/SneakerHub)
