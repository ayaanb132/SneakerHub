/**
 * Database Seeder Script
 * Populates the database with sample users and orders for testing
 * 
 * Usage: npm run seed
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('sneakerhub.db');

async function seedDatabase() {
    console.log('🌱 Seeding database with sample data...\n');
    
    try {
        // Create tables if they don't exist
        db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                orderId TEXT NOT NULL UNIQUE,
                userId INTEGER NOT NULL,
                status TEXT,
                totalAmount REAL,
                orderDate TEXT,
                statusUpdatedAt TEXT,
                estimatedDelivery TEXT,
                trackingNumber TEXT,
                shippingName TEXT,
                shippingStreet TEXT,
                shippingCity TEXT,
                shippingState TEXT,
                shippingZipCode TEXT,
                FOREIGN KEY(userId) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                orderId TEXT NOT NULL,
                productId TEXT,
                name TEXT,
                size INTEGER,
                price REAL,
                quantity INTEGER,
                FOREIGN KEY(orderId) REFERENCES orders(orderId)
            );
        `);

        // Clear existing data
        db.exec('DELETE FROM order_items');
        db.exec('DELETE FROM orders');
        db.exec('DELETE FROM users');
        console.log('✅ Cleared existing data\n');

        // Create sample users
        console.log('👤 Creating sample users...');
        const hashedPassword = await bcrypt.hash('password123', 10);

        const users = [
            { email: 'john.doe@example.com', password: hashedPassword },
            { email: 'jane.smith@example.com', password: hashedPassword },
            { email: 'test@sneakerhub.com', password: hashedPassword }
        ];

        const insertUser = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
        const userIds = users.map(user => {
            const result = insertUser.run(user.email, user.password);
            console.log(`   ✓ Created user: ${user.email}`);
            return result.lastInsertRowid;
        });

        console.log('\n📦 Creating sample orders...');

        // Sample orders for user 1 (john.doe@example.com)
        const orders = [
            {
                orderId: 'ORD-2025-1234ABC',
                userId: userIds[0],
                status: 'Delivered',
                totalAmount: 259.98,
                orderDate: new Date('2025-10-15').toISOString(),
                statusUpdatedAt: new Date('2025-10-22').toISOString(),
                estimatedDelivery: new Date('2025-10-22').toISOString(),
                trackingNumber: 'TRK-2025-DELIVERED',
                shippingName: 'John Doe',
                shippingStreet: '123 Main Street',
                shippingCity: 'New York',
                shippingState: 'NY',
                shippingZipCode: '10001',
                items: [
                    { productId: 'SKU-001', name: 'Runner X2000', size: 10, price: 129.99, quantity: 2 }
                ]
            },
            {
                orderId: 'ORD-2025-5678DEF',
                userId: userIds[0],
                status: 'Shipped',
                totalAmount: 159.49,
                orderDate: new Date('2025-11-01').toISOString(),
                statusUpdatedAt: new Date('2025-11-05').toISOString(),
                estimatedDelivery: new Date('2025-11-12').toISOString(),
                trackingNumber: 'TRK-2025-SHIPPED',
                shippingName: 'John Doe',
                shippingStreet: '123 Main Street',
                shippingCity: 'New York',
                shippingState: 'NY',
                shippingZipCode: '10001',
                items: [
                    { productId: 'SKU-002', name: 'Casual Max', size: 9, price: 79.50, quantity: 1 },
                    { productId: 'SKU-003', name: 'Sport Pro Elite', size: 10, price: 79.99, quantity: 1 }
                ]
            },
            {
                orderId: 'ORD-2025-9012GHI',
                userId: userIds[0],
                status: 'Processing',
                totalAmount: 199.98,
                orderDate: new Date('2025-11-08').toISOString(),
                statusUpdatedAt: new Date('2025-11-08').toISOString(),
                estimatedDelivery: new Date('2025-11-15').toISOString(),
                trackingNumber: null,
                shippingName: 'John Doe',
                shippingStreet: '123 Main Street',
                shippingCity: 'New York',
                shippingState: 'NY',
                shippingZipCode: '10001',
                items: [
                    { productId: 'SKU-004', name: 'Urban Street Classic', size: 10, price: 99.99, quantity: 2 }
                ]
            }
        ];

        // Sample orders for user 2 (jane.smith@example.com)
        const orders2 = [
            {
                orderId: 'ORD-2025-3456JKL',
                userId: userIds[1],
                status: 'Shipped',
                totalAmount: 129.99,
                orderDate: new Date('2025-11-05').toISOString(),
                statusUpdatedAt: new Date('2025-11-07').toISOString(),
                estimatedDelivery: new Date('2025-11-14').toISOString(),
                trackingNumber: 'TRK-2025-JANE001',
                shippingName: 'Jane Smith',
                shippingStreet: '456 Oak Avenue',
                shippingCity: 'Los Angeles',
                shippingState: 'CA',
                shippingZipCode: '90001',
                items: [
                    { productId: 'SKU-001', name: 'Runner X2000', size: 8, price: 129.99, quantity: 1 }
                ]
            }
        ];

        const insertOrder = db.prepare(`
            INSERT INTO orders (
                orderId, userId, status, totalAmount, orderDate, 
                statusUpdatedAt, estimatedDelivery, trackingNumber,
                shippingName, shippingStreet, shippingCity, shippingState, shippingZipCode
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertItem = db.prepare(`
            INSERT INTO order_items (orderId, productId, name, size, price, quantity)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        // Insert all orders
        [...orders, ...orders2].forEach(order => {
            insertOrder.run(
                order.orderId,
                order.userId,
                order.status,
                order.totalAmount,
                order.orderDate,
                order.statusUpdatedAt,
                order.estimatedDelivery,
                order.trackingNumber,
                order.shippingName,
                order.shippingStreet,
                order.shippingCity,
                order.shippingState,
                order.shippingZipCode
            );

            // Insert order items
            order.items.forEach(item => {
                insertItem.run(
                    order.orderId,
                    item.productId,
                    item.name,
                    item.size,
                    item.price,
                    item.quantity
                );
            });

            console.log(`   ✓ Created order: ${order.orderId} (${order.status}) for user ${order.userId}`);
        });

        console.log('\n✅ Database seeded successfully!\n');
        console.log('📝 Test Login Credentials:');
        console.log('   Email: john.doe@example.com');
        console.log('   Password: password123');
        console.log('\n   Email: jane.smith@example.com');
        console.log('   Password: password123');
        console.log('\n   Email: test@sneakerhub.com');
        console.log('   Password: password123\n');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        db.close();
    }
}

seedDatabase();
