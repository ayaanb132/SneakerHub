/**
 * SneakerHub Backend Server
 * Handles authentication and order tracking (ORD-1)
 * 
 * Tech Stack:
 * - Node.js + Express
 * - SQLite for database
 * - JWT for authentication
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Secret key for JWT (In production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON request bodies

// Initialize SQLite Database
const db = new Database('sneakerhub.db');

/**
 * Initialize database tables
 * Creates necessary tables if they don't exist
 */
function initializeDatabase() {
    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Orders table
    // Note: SQLite doesn't support ALTER TABLE to modify CHECK constraints
    // If you need to update existing databases, you may need to recreate the table
    db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderId TEXT UNIQUE NOT NULL,
            userId INTEGER NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('Processing', 'Shipped', 'Delivered', 'Cancelled')),
            totalAmount REAL NOT NULL,
            orderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
            statusUpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            estimatedDelivery DATETIME,
            trackingNumber TEXT,
            shippingName TEXT NOT NULL,
            shippingStreet TEXT NOT NULL,
            shippingCity TEXT NOT NULL,
            shippingState TEXT NOT NULL,
            shippingZipCode TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
        )
    `);
    
    // Order Items table
    db.exec(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderId TEXT NOT NULL,
            productId TEXT NOT NULL,
            name TEXT NOT NULL,
            size INTEGER NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            FOREIGN KEY (orderId) REFERENCES orders(orderId)
        )
    `);
    
    console.log('✅ Database initialized successfully');
}

// Initialize database on server start
initializeDatabase();

/**
 * Middleware: Authenticate JWT token
 * Protects routes that require authentication
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user; // Attach user info to request
        next();
    });
}

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * POST /api/auth/register
 * Register a new user
 */
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        // Check if user already exists
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert new user
        const result = db.prepare(
            'INSERT INTO users (email, password) VALUES (?, ?)'
        ).run(email, hashedPassword);
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: result.lastInsertRowid, email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { email }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * POST /api/auth/login
 * Login existing user
 */
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Find user
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            message: 'Login successful',
            token,
            user: { email: user.email }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ============================================
// ORDER ENDPOINTS (ORD-1)
// ============================================

/**
 * GET /api/orders
 * Get all orders for authenticated user
 */
app.get('/api/orders', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Fetch orders for the user (exclude cancelled orders from active list)
        const orders = db.prepare(`
            SELECT * FROM orders 
            WHERE userId = ? AND status != 'Cancelled'
            ORDER BY orderDate DESC
        `).all(userId);
        
        // Fetch items for each order
        const ordersWithItems = orders.map(order => {
            const items = db.prepare(`
                SELECT productId, name, size, price, quantity 
                FROM order_items 
                WHERE orderId = ?
            `).all(order.orderId);
            
            return {
                orderId: order.orderId,
                status: order.status,
                totalAmount: order.totalAmount,
                orderDate: order.orderDate,
                statusUpdatedAt: order.statusUpdatedAt,
                estimatedDelivery: order.estimatedDelivery,
                trackingNumber: order.trackingNumber,
                shippingAddress: {
                    name: order.shippingName,
                    street: order.shippingStreet,
                    city: order.shippingCity,
                    state: order.shippingState,
                    zipCode: order.shippingZipCode
                },
                items
            };
        });
        
        res.json({ orders: ordersWithItems });
        
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

/**
 * GET /api/orders/history
 * Get all orders for authenticated user including cancelled orders (ORD-3)
 * This endpoint returns the complete order history
 */
app.get('/api/orders/history', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Fetch ALL orders for the user (including cancelled orders)
        const orders = db.prepare(`
            SELECT * FROM orders 
            WHERE userId = ?
            ORDER BY orderDate DESC
        `).all(userId);
        
        // Fetch items for each order
        const ordersWithItems = orders.map(order => {
            const items = db.prepare(`
                SELECT productId, name, size, price, quantity 
                FROM order_items 
                WHERE orderId = ?
            `).all(order.orderId);
            
            return {
                orderId: order.orderId,
                status: order.status,
                totalAmount: order.totalAmount,
                orderDate: order.orderDate,
                statusUpdatedAt: order.statusUpdatedAt,
                estimatedDelivery: order.estimatedDelivery,
                trackingNumber: order.trackingNumber,
                shippingAddress: {
                    name: order.shippingName,
                    street: order.shippingStreet,
                    city: order.shippingCity,
                    state: order.shippingState,
                    zipCode: order.shippingZipCode
                },
                items
            };
        });
        
        res.json({ orders: ordersWithItems });
        
    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500).json({ error: 'Failed to fetch order history' });
    }
});

/**
 * GET /api/orders/:orderId
 * Get specific order details
 */
app.get('/api/orders/:orderId', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        const { orderId } = req.params;
        
        // Fetch order (ensure it belongs to the user)
        const order = db.prepare(`
            SELECT * FROM orders 
            WHERE orderId = ? AND userId = ?
        `).get(orderId, userId);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Fetch order items
        const items = db.prepare(`
            SELECT productId, name, size, price, quantity 
            FROM order_items 
            WHERE orderId = ?
        `).all(orderId);
        
        const orderWithItems = {
            orderId: order.orderId,
            status: order.status,
            totalAmount: order.totalAmount,
            orderDate: order.orderDate,
            statusUpdatedAt: order.statusUpdatedAt,
            estimatedDelivery: order.estimatedDelivery,
            trackingNumber: order.trackingNumber,
            shippingAddress: {
                name: order.shippingName,
                street: order.shippingStreet,
                city: order.shippingCity,
                state: order.shippingState,
                zipCode: order.shippingZipCode
            },
            items
        };
        
        res.json({ order: orderWithItems });
        
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

/**
 * POST /api/orders
 * Create a new order
 */
app.post('/api/orders', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        const { items, shippingAddress, totalAmount } = req.body;
        
        // Validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain at least one item' });
        }
        
        if (!shippingAddress || !shippingAddress.name || !shippingAddress.street) {
            return res.status(400).json({ error: 'Complete shipping address is required' });
        }
        
        // Generate unique order ID
        const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        // Calculate estimated delivery (7 days from now)
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
        
        // Insert order into database
        db.prepare(`
            INSERT INTO orders (
                orderId, userId, status, totalAmount, 
                estimatedDelivery, shippingName, shippingStreet, 
                shippingCity, shippingState, shippingZipCode
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            orderId,
            userId,
            'Processing',
            totalAmount,
            estimatedDelivery.toISOString(),
            shippingAddress.name,
            shippingAddress.street,
            shippingAddress.city,
            shippingAddress.state,
            shippingAddress.zipCode
        );
        
        // Insert order items
        const insertItem = db.prepare(`
            INSERT INTO order_items (orderId, productId, name, size, price, quantity)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        items.forEach(item => {
            insertItem.run(
                orderId,
                item.productId || item.id,
                item.name,
                item.size,
                item.price,
                item.quantity
            );
        });
        
        res.status(201).json({
            message: 'Order placed successfully',
            orderId,
            status: 'Processing',
            estimatedDelivery: estimatedDelivery.toISOString()
        });
        
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

/**
 * PATCH /api/orders/:orderId/status
 * Update order status (Admin endpoint - for testing)
 */
app.patch('/api/orders/:orderId/status', authenticateToken, (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        // Validate status
        const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        // Generate tracking number if status is "Shipped" and no tracking number exists
        let trackingNumber = null;
        if (status === 'Shipped') {
            trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        }
        
        // Update order status
        const result = db.prepare(`
            UPDATE orders 
            SET status = ?, 
                statusUpdatedAt = CURRENT_TIMESTAMP,
                trackingNumber = COALESCE(?, trackingNumber)
            WHERE orderId = ?
        `).run(status, trackingNumber, orderId);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json({
            message: 'Order status updated successfully',
            orderId,
            status,
            trackingNumber
        });
        
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

/**
 * DELETE /api/orders/:orderId
 * Cancel an order (ORD-2)
 * Only allows cancellation of orders in "Processing" status
 * Cancelled orders remain in database but are excluded from active orders list
 */
app.delete('/api/orders/:orderId', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        const { orderId } = req.params;
        
        // First, verify the order exists and belongs to the user
        const order = db.prepare(`
            SELECT * FROM orders 
            WHERE orderId = ? AND userId = ?
        `).get(orderId, userId);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Only allow cancellation of orders in "Processing" status
        if (order.status !== 'Processing') {
            return res.status(400).json({ 
                error: `Cannot cancel order. Only orders in "Processing" status can be cancelled. Current status: ${order.status}` 
            });
        }
        
        // Update order status to "Cancelled"
        const result = db.prepare(`
            UPDATE orders 
            SET status = 'Cancelled',
                statusUpdatedAt = CURRENT_TIMESTAMP
            WHERE orderId = ? AND userId = ?
        `).run(orderId, userId);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order not found or could not be cancelled' });
        }
        
        res.json({
            message: 'Order cancelled successfully',
            orderId,
            status: 'Cancelled'
        });
        
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'SneakerHub API is running' });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`
🚀 SneakerHub Backend Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server running on: http://localhost:${PORT}
🗄️  Database: sneakerhub.db
🔐 JWT Secret: ${JWT_SECRET === 'your-secret-key-change-in-production' ? '⚠️  Using default (change in production!)' : '✅ Custom secret configured'}

API Endpoints:
  POST   /api/auth/register
  POST   /api/auth/login
  GET    /api/orders
  GET    /api/orders/history (ORD-3: Order history)
  GET    /api/orders/:orderId
  POST   /api/orders
  PATCH  /api/orders/:orderId/status
  DELETE /api/orders/:orderId (ORD-2: Cancel order)
  GET    /api/health

Ready to accept requests! 🎉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
});

module.exports = app;
