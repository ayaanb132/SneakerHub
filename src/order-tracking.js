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
const noOrdersMessage = document.getElementById('no-orders-message');
const userEmailSpan = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');

// Auto-refresh interval (in milliseconds) - refresh every 30 seconds
const REFRESH_INTERVAL = 30000;
let refreshTimer = null;

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
    
    // Load orders
    await loadOrders();
    
    // Set up auto-refresh for real-time updates
    setupAutoRefresh();
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
                <span class="inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.bgColor} ${statusInfo.textColor}">
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
                <span class="text-indigo-600">$${order.totalAmount.toFixed(2)}</span>
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
            <div class="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p class="text-sm text-indigo-800">
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
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-800',
            icon: '⏳'
        },
        'Shipped': {
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-800',
            icon: '🚚'
        },
        'Delivered': {
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
            icon: '✓'
        }
    };
    
    return statusMap[status] || {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeOrderTracking);

// Clean up timer when page unloads
window.addEventListener('beforeunload', () => {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
});
