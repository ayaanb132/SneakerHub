/**
 * Order Tracking Frontend Logic (ORD-1)
 * Handles fetching and displaying user orders with real-time status updates
 */

// Configuration - Update this to match your backend URL
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const ordersContainer = document.getElementById('orders-container');
const orderHistoryContainer = document.getElementById('order-history-container');
const noOrdersMessage = document.getElementById('no-orders-message');
const userEmailSpan = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const tabActiveOrders = document.getElementById('tab-active-orders');
const tabOrderHistory = document.getElementById('tab-order-history');
const receiptModal = document.getElementById('receipt-modal');
const receiptContent = document.getElementById('receipt-content');
const closeReceiptModal = document.getElementById('close-receipt-modal');

// Auto-refresh interval (in milliseconds) - refresh every 30 seconds
const REFRESH_INTERVAL = 30000;
let refreshTimer = null;

// Current active tab ('active' or 'history')
let currentTab = 'active';

/**
 * Initialize the order tracking page
 * Checks authentication and loads orders
 */
async function initializeOrderTracking() {
    // Check if user is authenticated
    const authToken = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!authToken || !userEmail) {
        // Redirect to login if not authenticated
        alert('Please log in to view your orders');
        window.location.href = 'user-registration.HTML';
        return;
    }
    
    // Display user email
    userEmailSpan.textContent = userEmail;
    
    // Set up tab switching
    setupTabs();
    
    // Load active orders by default
    await loadOrders();
    
    // Set up auto-refresh for real-time updates (only for active orders tab)
    setupAutoRefresh();
    
    // Set up receipt modal close handler
    setupReceiptModal();
}

/**
 * Fetch orders from the backend API
 */
async function loadOrders() {
    try {
        showLoading();
        hideError();
        
        const authToken = localStorage.getItem('authToken');
        
        // Make API request to fetch user orders
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                handleAuthError();
                return;
            }
            throw new Error(`Failed to fetch orders: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        hideLoading();
        
        if (data.orders && data.orders.length > 0) {
            displayOrders(data.orders);
        } else {
            showNoOrders();
        }
        
    } catch (error) {
        console.error('Error loading orders:', error);
        hideLoading();
        showError('Failed to load orders. Please try again later.');
    }
}

/**
 * Display orders in the UI
 * Filters out cancelled orders (they're already filtered on backend, but double-check here)
 * @param {Array} orders - Array of order objects
 */
function displayOrders(orders) {
    ordersContainer.innerHTML = '';
    ordersContainer.classList.remove('hidden');
    noOrdersMessage.classList.add('hidden');
    
    // Filter out cancelled orders (backend already does this, but extra safety)
    const activeOrders = orders.filter(order => order.status !== 'Cancelled');
    
    if (activeOrders.length === 0) {
        showNoOrders();
        return;
    }
    
    // Sort orders by date (newest first)
    activeOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    activeOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersContainer.appendChild(orderCard);
    });
}

/**
 * Create an order card element
 * @param {Object} order - Order object
 * @returns {HTMLElement} - Order card element
 */
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition';
    card.setAttribute('data-order-id', order.orderId); // Store order ID for easy removal
    
    // Determine status styling and icon
    const statusInfo = getStatusInfo(order.status);
    
    // Show cancel button only for Processing orders (ORD-2)
    const cancelButton = order.status === 'Processing' ? `
        <button 
            id="cancel-btn-${order.orderId}" 
            class="mt-3 w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-semibold"
            onclick="handleCancelOrder('${order.orderId}')"
        >
            🗑️ Cancel Order
        </button>
    ` : '';
    
    card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-xl font-bold text-gray-800">Order #${order.orderId}</h3>
                <p class="text-sm text-gray-500 mt-1">Placed on ${formatDate(order.orderDate)}</p>
            </div>
            <div class="text-right">
                <span class="inline-block px-4 py-2 rounded-full text-sm font-semibold" ${statusInfo.bgColor} ${statusInfo.textColor}>
                    ${statusInfo.icon} ${order.status}
                </span>
            </div>
        </div>
        
        <!-- Order Items -->
        <div class="border-t border-gray-200 pt-4 mb-4">
            <h4 class="font-semibold text-gray-700 mb-2">Items:</h4>
            <ul class="space-y-2">
                ${order.items.map(item => `
                    <li class="flex justify-between text-sm">
                        <span>${item.name} (Size: ${item.size}) x ${item.quantity}</span>
                        <span class="font-semibold">$${item.price.toFixed(2)}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
        
        <!-- Total -->
        <div class="border-t border-gray-200 pt-3 mb-4">
            <div class="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span style="color: #00C853;">$${order.totalAmount.toFixed(2)}</span>
            </div>
        </div>
        
        <!-- Shipping Information -->
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 class="font-semibold text-gray-700 mb-2">Shipping Address:</h4>
            <p class="text-sm text-gray-600">${order.shippingAddress.name}</p>
            <p class="text-sm text-gray-600">${order.shippingAddress.street}</p>
            <p class="text-sm text-gray-600">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
        </div>
        
        <!-- Status Timeline -->
        <div class="bg-blue-50 rounded-lg p-4">
            <h4 class="font-semibold text-gray-700 mb-3">Order Timeline:</h4>
            ${createStatusTimeline(order)}
        </div>
        
        <!-- Estimated Delivery (if applicable) -->
        ${order.estimatedDelivery ? `
            <div class="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p class="text-sm text-green-800">
                    <span class="font-semibold">📦 Estimated Delivery:</span> 
                    ${formatDate(order.estimatedDelivery)}
                </p>
            </div>
        ` : ''}
        
        <!-- Tracking Number (if shipped) -->
        ${order.trackingNumber ? `
            <div class="mt-4 rounded-lg p-4" style="background-color: rgba(0,200,83,0.1); border: 1px solid #00C853;">
                <p class="text-sm" style="color: #00C853;">
                    <span class="font-semibold">📮 Tracking Number:</span> 
                    <span class="font-mono">${order.trackingNumber}</span>
                </p>
            </div>
        ` : ''}
        
        <!-- Cancel Button (ORD-2: Only show for Processing orders) -->
        ${cancelButton}
    `;
    
    return card;
}

/**
 * Create status timeline visualization
 * @param {Object} order - Order object
 * @returns {String} - HTML string for timeline
 */
function createStatusTimeline(order) {
    const statuses = ['Processing', 'Shipped', 'Delivered'];
    const currentStatusIndex = statuses.indexOf(order.status);
    
    return statuses.map((status, index) => {
        const isCompleted = index <= currentStatusIndex;
        const isCurrent = index === currentStatusIndex;
        
        return `
            <div class="flex items-center ${index < statuses.length - 1 ? 'mb-2' : ''}">
                <div class="flex items-center justify-center w-8 h-8 rounded-full ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                } text-white font-bold">
                    ${isCompleted ? '✓' : index + 1}
                </div>
                <div class="ml-3 flex-1">
                    <p class="font-semibold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}">
                        ${status}
                    </p>
                    ${isCurrent && order.statusUpdatedAt ? `
                        <p class="text-xs text-gray-500">Updated: ${formatDate(order.statusUpdatedAt)}</p>
                    ` : ''}
                </div>
            </div>
            ${index < statuses.length - 1 ? '<div class="w-0.5 h-6 bg-gray-300 ml-4 mb-2"></div>' : ''}
        `;
    }).join('');
}

/**
 * Get status styling information
 * @param {String} status - Order status
 * @returns {Object} - Status styling object
 */
function getStatusInfo(status) {
    const statusMap = {
        'Processing': {
            bgColor: 'style="background-color: #FFF3CD;"',
            textColor: 'style="color: #856404;"',
            icon: '⏳'
        },
        'Shipped': {
            bgColor: 'style="background-color: rgba(0,200,83,0.2);"',
            textColor: 'style="color: #00C853;"',
            icon: '🚚'
        },
        'Delivered': {
            bgColor: 'style="background-color: rgba(0,200,83,0.2);"',
            textColor: 'style="color: #00C853;"',
            icon: '✓'
        },
        'Cancelled': {
            bgColor: 'style="background-color: rgba(255,61,0,0.2);"',
            textColor: 'style="color: #FF3D00;"',
            icon: '✕'
        }
    };
    
    return statusMap[status] || {
        bgColor: 'style="background-color: #F5F5F5;"',
        textColor: 'style="color: #222222;"',
        icon: '•'
    };
}

/**
 * Format date to readable string
 * @param {String} dateString - ISO date string
 * @returns {String} - Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Set up auto-refresh for real-time updates
 */
function setupAutoRefresh() {
    // Clear any existing timer
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
    
    // Set up new timer
    refreshTimer = setInterval(() => {
        console.log('Auto-refreshing orders...');
        loadOrders();
    }, REFRESH_INTERVAL);
}

/**
 * Show loading indicator
 */
function showLoading() {
    loadingIndicator.classList.remove('hidden');
    ordersContainer.classList.add('hidden');
    noOrdersMessage.classList.add('hidden');
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

/**
 * Show error message
 * @param {String} message - Error message
 */
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.classList.add('hidden');
}

/**
 * Show no orders message
 */
function showNoOrders() {
    noOrdersMessage.classList.remove('hidden');
    ordersContainer.classList.add('hidden');
}

/**
 * Handle authentication error
 */
function handleAuthError() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    alert('Your session has expired. Please log in again.');
    window.location.href = 'user-registration.HTML';
}

/**
 * Handle order cancellation (ORD-2)
 * @param {String} orderId - Order ID to cancel
 */
async function handleCancelOrder(orderId) {
    // Show confirmation dialog
    const confirmed = confirm(
        `Are you sure you want to cancel order #${orderId}?\n\n` +
        `This action cannot be undone. The order will be cancelled and removed from your active orders.`
    );
    
    if (!confirmed) {
        return; // User cancelled the confirmation
    }
    
    try {
        const authToken = localStorage.getItem('authToken');
        
        // Disable the cancel button to prevent double-clicks
        const cancelBtn = document.getElementById(`cancel-btn-${orderId}`);
        if (cancelBtn) {
            cancelBtn.disabled = true;
            cancelBtn.textContent = 'Cancelling...';
            cancelBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        
        // Make API request to cancel the order
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            
            if (response.status === 401) {
                handleAuthError();
                return;
            }
            
            // Re-enable button on error
            if (cancelBtn) {
                cancelBtn.disabled = false;
                cancelBtn.textContent = '🗑️ Cancel Order';
                cancelBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
            
            throw new Error(errorData.error || `Failed to cancel order: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Show success message
        showSuccessMessage(`Order #${orderId} has been cancelled successfully.`);
        
        // Remove the order card from the UI immediately (no page refresh needed)
        const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
        if (orderCard) {
            // Add fade-out animation
            orderCard.style.transition = 'opacity 0.3s ease-out';
            orderCard.style.opacity = '0';
            
            setTimeout(() => {
                orderCard.remove();
                
                // Check if there are any remaining orders
                const remainingOrders = ordersContainer.querySelectorAll('[data-order-id]');
                if (remainingOrders.length === 0) {
                    showNoOrders();
                }
            }, 300);
        } else {
            // If card not found, reload orders to ensure UI is in sync
            await loadOrders();
        }
        
    } catch (error) {
        console.error('Error cancelling order:', error);
        showError(error.message || 'Failed to cancel order. Please try again later.');
    }
}

/**
 * Show success message after order cancellation
 * @param {String} message - Success message to display
 */
function showSuccessMessage(message) {
    // Create or get success message element
    let successMsg = document.getElementById('success-message');
    
    if (!successMsg) {
        // Create success message element if it doesn't exist
        successMsg = document.createElement('div');
        successMsg.id = 'success-message';
        successMsg.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6';
        
        // Insert it before the orders container
        const mainContent = document.querySelector('.max-w-7xl');
        if (mainContent && ordersContainer.parentElement) {
            ordersContainer.parentElement.insertBefore(successMsg, ordersContainer);
        }
    }
    
    successMsg.innerHTML = `
        <p class="font-bold">Success</p>
        <p>${message}</p>
    `;
    successMsg.classList.remove('hidden');
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
        successMsg.classList.add('hidden');
    }, 5000);
}

/**
 * Handle logout
 */
logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        
        // Clear refresh timer
        if (refreshTimer) {
            clearInterval(refreshTimer);
        }
        
        window.location.href = '../index.HTML';
    }
});

// Make handleCancelOrder available globally so it can be called from inline onclick
// (Alternative: Use event delegation, but inline onclick is simpler for this use case)
window.handleCancelOrder = handleCancelOrder;

// ============================================
// ORDER HISTORY FUNCTIONS (ORD-3)
// ============================================

/**
 * Set up tab switching between Active Orders and Order History
 */
function setupTabs() {
    tabActiveOrders.addEventListener('click', () => {
        switchTab('active');
    });
    
    tabOrderHistory.addEventListener('click', () => {
        switchTab('history');
    });
}

/**
 * Switch between Active Orders and Order History tabs
 * @param {String} tab - 'active' or 'history'
 */
async function switchTab(tab) {
    currentTab = tab;
    
    // Update tab button styles
    if (tab === 'active') {
        tabActiveOrders.style.color = '#00C853';
        tabActiveOrders.style.borderBottomColor = '#00C853';
        tabActiveOrders.style.borderBottomWidth = '2px';
        tabOrderHistory.style.color = '#666666';
        tabOrderHistory.style.borderBottomWidth = '0';
        
        // Show active orders container, hide history
        ordersContainer.classList.remove('hidden');
        orderHistoryContainer.classList.add('hidden');
        
        // Load active orders
        await loadOrders();
        
        // Resume auto-refresh for active orders
        setupAutoRefresh();
    } else {
        tabOrderHistory.style.color = '#00C853';
        tabOrderHistory.style.borderBottomColor = '#00C853';
        tabOrderHistory.style.borderBottomWidth = '2px';
        tabActiveOrders.style.color = '#666666';
        tabActiveOrders.style.borderBottomWidth = '0';
        
        // Show history container, hide active orders
        orderHistoryContainer.classList.remove('hidden');
        ordersContainer.classList.add('hidden');
        
        // Load order history
        await loadOrderHistory();
        
        // Stop auto-refresh when viewing history
        if (refreshTimer) {
            clearInterval(refreshTimer);
            refreshTimer = null;
        }
    }
}

/**
 * Fetch order history from the backend API (includes all orders including cancelled)
 */
async function loadOrderHistory() {
    try {
        showLoading();
        hideError();
        
        const authToken = localStorage.getItem('authToken');
        
        // Make API request to fetch order history
        const response = await fetch(`${API_BASE_URL}/orders/history`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                handleAuthError();
                return;
            }
            throw new Error(`Failed to fetch order history: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        hideLoading();
        
        if (data.orders && data.orders.length > 0) {
            displayOrderHistory(data.orders);
        } else {
            showNoOrdersHistory();
        }
        
    } catch (error) {
        console.error('Error loading order history:', error);
        hideLoading();
        showError('Failed to load order history. Please try again later.');
    }
}

/**
 * Display order history in the UI
 * Shows all orders including cancelled ones in a compact format
 * @param {Array} orders - Array of order objects
 */
function displayOrderHistory(orders) {
    orderHistoryContainer.innerHTML = '';
    orderHistoryContainer.classList.remove('hidden');
    noOrdersMessage.classList.add('hidden');
    
    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    // Group orders by date (optional enhancement - can be removed if not needed)
    const ordersList = document.createElement('div');
    ordersList.className = 'space-y-4';
    
    orders.forEach(order => {
        const historyCard = createOrderHistoryCard(order);
        ordersList.appendChild(historyCard);
    });
    
    orderHistoryContainer.appendChild(ordersList);
}

/**
 * Create a compact order history card element (ORD-3)
 * Displays: shoe name, price, size, date, and status
 * @param {Object} order - Order object
 * @returns {HTMLElement} - Order history card element
 */
function createOrderHistoryCard(order) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition';
    
    // Determine status styling
    const statusInfo = getStatusInfo(order.status);
    
    // Get all items in the order
    const itemsList = order.items.map(item => 
        `${item.name} (Size: ${item.size}) - $${item.price.toFixed(2)} x ${item.quantity}`
    ).join(', ');
    
    // Calculate total items count
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    
    card.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-bold text-gray-800">Order #${order.orderId}</h3>
                    <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold" ${statusInfo.bgColor} ${statusInfo.textColor}>
                        ${statusInfo.icon} ${order.status}
                    </span>
                </div>
                <p class="text-sm text-gray-600 mb-2">
                    <span class="font-semibold">Date:</span> ${formatDate(order.orderDate)}
                </p>
                <div class="text-sm text-gray-700 mb-2">
                    <span class="font-semibold">Items (${totalItems}):</span> ${itemsList}
                </div>
            </div>
            <div class="text-right ml-4">
                <p class="text-lg font-bold" style="color: #00C853;">$${order.totalAmount.toFixed(2)}</p>
                <button 
                    onclick="showReceipt('${order.orderId}')"
                    class="mt-2 text-sm px-3 py-1 rounded transition text-white"
                    style="background-color: #00C853;"
                    onmouseover="this.style.backgroundColor='#00B047'"
                    onmouseout="this.style.backgroundColor='#00C853'"
                >
                    View Receipt
                </button>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Show detailed receipt for an order (ORD-3)
 * @param {String} orderId - Order ID to display receipt for
 */
async function showReceipt(orderId) {
    try {
        const authToken = localStorage.getItem('authToken');
        
        // Fetch order details
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                handleAuthError();
                return;
            }
            throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        const order = data.order;
        
        // Generate receipt HTML
        const receiptHTML = generateReceiptHTML(order);
        receiptContent.innerHTML = receiptHTML;
        
        // Show modal
        receiptModal.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading receipt:', error);
        showError('Failed to load receipt. Please try again later.');
    }
}

/**
 * Generate HTML for order receipt
 * @param {Object} order - Order object with full details
 * @returns {String} - HTML string for receipt
 */
function generateReceiptHTML(order) {
    const statusInfo = getStatusInfo(order.status);
    
    // Calculate subtotal and items
    const itemsHTML = order.items.map(item => {
        const itemTotal = item.price * item.quantity;
        return `
            <tr class="border-b">
                <td class="py-2">${item.name}</td>
                <td class="text-center">${item.size}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">$${item.price.toFixed(2)}</td>
                <td class="text-right font-semibold">$${itemTotal.toFixed(2)}</td>
            </tr>
        `;
    }).join('');
    
    return `
        <div class="space-y-4">
            <!-- Order Header -->
            <div class="border-b pb-4">
                <h4 class="text-xl font-bold text-gray-800 mb-2">Order #${order.orderId}</h4>
                <div class="flex items-center gap-2">
                    <span class="inline-block px-3 py-1 rounded-full text-sm font-semibold" ${statusInfo.bgColor} ${statusInfo.textColor}>
                        ${statusInfo.icon} ${order.status}
                    </span>
                    <span class="text-sm" style="color: #666666;">Ordered on ${formatDate(order.orderDate)}</span>
                </div>
            </div>
            
            <!-- Order Items Table -->
            <div>
                <h5 class="font-semibold text-gray-700 mb-2">Items Ordered:</h5>
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b-2 border-gray-300">
                            <th class="text-left py-2">Product</th>
                            <th class="text-center py-2">Size</th>
                            <th class="text-center py-2">Qty</th>
                            <th class="text-right py-2">Price</th>
                            <th class="text-right py-2">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
            </div>
            
            <!-- Order Total -->
            <div class="border-t pt-4">
                <div class="flex justify-end">
                    <div class="w-64">
                        <div class="flex justify-between text-lg font-bold mb-2">
                            <span>Total:</span>
                            <span style="color: #00C853;">$${order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Shipping Address -->
            <div class="border-t pt-4">
                <h5 class="font-semibold text-gray-700 mb-2">Shipping Address:</h5>
                <p class="text-sm text-gray-600">${order.shippingAddress.name}</p>
                <p class="text-sm text-gray-600">${order.shippingAddress.street}</p>
                <p class="text-sm text-gray-600">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
            </div>
            
            <!-- Additional Info -->
            ${order.trackingNumber ? `
                <div class="border-t pt-4">
                    <p class="text-sm text-gray-600">
                        <span class="font-semibold">Tracking Number:</span> 
                        <span class="font-mono">${order.trackingNumber}</span>
                    </p>
                </div>
            ` : ''}
            ${order.estimatedDelivery ? `
                <div class="border-t pt-4">
                    <p class="text-sm text-gray-600">
                        <span class="font-semibold">Estimated Delivery:</span> 
                        ${formatDate(order.estimatedDelivery)}
                    </p>
                </div>
            ` : ''}
            ${order.statusUpdatedAt ? `
                <div class="border-t pt-4">
                    <p class="text-sm text-gray-600">
                        <span class="font-semibold">Status Updated:</span> 
                        ${formatDate(order.statusUpdatedAt)}
                    </p>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Set up receipt modal close handlers
 */
function setupReceiptModal() {
    // Close button
    closeReceiptModal.addEventListener('click', () => {
        receiptModal.classList.add('hidden');
    });
    
    // Close on outside click
    receiptModal.addEventListener('click', (e) => {
        if (e.target === receiptModal) {
            receiptModal.classList.add('hidden');
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !receiptModal.classList.contains('hidden')) {
            receiptModal.classList.add('hidden');
        }
    });
}

/**
 * Show no orders message for history tab
 */
function showNoOrdersHistory() {
    orderHistoryContainer.innerHTML = `
        <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded text-center">
            <p class="font-semibold">No order history found</p>
            <p class="text-sm mt-2">You haven't placed any orders yet. Start shopping!</p>
            <a href="../index.HTML" class="inline-block mt-4 text-white px-6 py-2 rounded transition" style="background-color: #FF3D00;" onmouseover="this.style.backgroundColor='#e63600'" onmouseout="this.style.backgroundColor='#FF3D00'">Browse Products</a>
        </div>
    `;
    orderHistoryContainer.classList.remove('hidden');
}

// Make showReceipt available globally so it can be called from inline onclick
window.showReceipt = showReceipt;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeOrderTracking);

// Clean up timer when page unloads
window.addEventListener('beforeunload', () => {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
});
