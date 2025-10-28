<div id="checkout-page" class="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg my-8">
    <h1 class="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">Complete Your Order</h1>
    
    <div class="grid md:grid-cols-3 gap-8">
        
        <!-- Column 1 & 2: Forms (Address and Payment) -->
        <div class="md:col-span-2 space-y-8">
            
            <!-- Shipping Address Form Section -->
            <section class="p-6 border border-indigo-200 rounded-lg bg-indigo-50">
                <h2 class="text-xl font-semibold text-indigo-800 mb-4">1. Shipping Address</h2>
                <form id="address-form" class="space-y-4">
                    <input type="text" placeholder="Full Name" required 
                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500">
                    <input type="text" placeholder="Street Address" required
                           class="w-full p-3 border border-gray-300 rounded-lg">
                    <div class="grid grid-cols-3 gap-4">
                        <input type="text" placeholder="City" required class="p-3 border border-gray-300 rounded-lg">
                        <input type="text" placeholder="State" required class="p-3 border border-gray-300 rounded-lg">
                        <input type="text" placeholder="Zip Code" required class="p-3 border border-gray-300 rounded-lg">
                    </div>
                </form>
            </section>

            <!-- Payment Information Form Section (Payment Handling Not Started) -->
            <section class="p-6 border border-red-200 rounded-lg bg-red-50">
                <h2 class="text-xl font-semibold text-red-800 mb-4">2. Payment Information (Deferred)</h2>
                <p class="text-sm text-red-600 mb-4">
                    Payment handling logic and API integration are deferred to a future sprint. This is a UI placeholder.
                </p>
                <input type="text" placeholder="Card Number (UI only)" disabled
                       class="w-full p-3 border border-gray-300 rounded-lg bg-gray-100">
                <div class="mt-4">
                    <label class="inline-flex items-center text-gray-700">
                        <input type="checkbox" disabled class="rounded text-indigo-600">
                        <span class="ml-2">Save Payment Info</span>
                    </label>
                </div>
            </section>
        </div>

        <!-- Column 3: Order Summary Placeholder -->
        <div class="md:col-span-1 p-6 bg-gray-50 rounded-lg border border-gray-200 h-fit">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">Order Summary</h2>
            <div class="space-y-2 text-sm">
                <p class="flex justify-between"><span>Subtotal:</span><span class="font-medium">$259.98</span></p>
                <p class="flex justify-between border-t pt-2 mt-2 font-bold"><span>Total:</span><span>$275.50</span></p>
            </div>
            <button class="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition">
                Place Order (Placeholder)
            </button>
        </div>
    </div>
</div>
