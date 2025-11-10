/**
 * Simple test script to verify API endpoints
 * Run with: node test-api.js
 */

const BASE_URL = 'http://localhost:3000/api';

let authToken = '';
let testEmail = 'test@sneakerhub.com';
let testPassword = 'password123';

async function runTests() {
    console.log('🧪 Starting API Tests...\n');
    
    try {
        // Test 1: Health Check
        console.log('Test 1: Health Check');
        const healthResponse = await fetch(`${BASE_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check passed:', healthData.message);
        console.log('');
        
        // Test 2: Login
        console.log('Test 2: User Login');
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword
            })
        });
        
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            authToken = loginData.token;
            console.log('✅ Login successful');
            console.log('   Email:', loginData.user.email);
            console.log('   Token:', authToken.substring(0, 20) + '...');
        } else {
            const error = await loginResponse.json();
            console.log('❌ Login failed:', error.error);
            return;
        }
        console.log('');
        
        // Test 3: Get Orders
        console.log('Test 3: Fetch User Orders');
        const ordersResponse = await fetch(`${BASE_URL}/orders`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            console.log('✅ Orders fetched successfully');
            console.log('   Total orders:', ordersData.orders.length);
            if (ordersData.orders.length > 0) {
                const firstOrder = ordersData.orders[0];
                console.log('   First order:', firstOrder.orderId);
                console.log('   Status:', firstOrder.status);
                console.log('   Total:', '$' + firstOrder.totalAmount.toFixed(2));
            }
        } else {
            console.log('❌ Failed to fetch orders');
        }
        console.log('');
        
        // Test 4: Create New Order
        console.log('Test 4: Create New Order');
        const newOrder = {
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
                street: '789 Test Street',
                city: 'Test City',
                state: 'TS',
                zipCode: '12345'
            },
            totalAmount: 99.99
        };
        
        const createResponse = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newOrder)
        });
        
        if (createResponse.ok) {
            const createData = await createResponse.json();
            console.log('✅ Order created successfully');
            console.log('   Order ID:', createData.orderId);
            console.log('   Status:', createData.status);
            console.log('   Estimated Delivery:', new Date(createData.estimatedDelivery).toLocaleDateString());
            
            // Test 5: Update Order Status
            console.log('');
            console.log('Test 5: Update Order Status to Shipped');
            const updateResponse = await fetch(`${BASE_URL}/orders/${createData.orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'Shipped' })
            });
            
            if (updateResponse.ok) {
                const updateData = await updateResponse.json();
                console.log('✅ Order status updated');
                console.log('   New Status:', updateData.status);
                console.log('   Tracking Number:', updateData.trackingNumber);
            } else {
                console.log('❌ Failed to update order status');
            }
        } else {
            console.log('❌ Failed to create order');
        }
        console.log('');
        
        console.log('🎉 All tests completed!\n');
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
        console.log('\n⚠️  Make sure the server is running: npm start\n');
    }
}

// Run tests if server is available
console.log('Checking if server is running...\n');
fetch(`${BASE_URL}/health`)
    .then(() => runTests())
    .catch(() => {
        console.log('❌ Cannot connect to server at', BASE_URL);
        console.log('\n📝 Please start the server first:');
        console.log('   1. npm install');
        console.log('   2. npm run seed');
        console.log('   3. npm start');
        console.log('\nThen run this test script again.\n');
    });
