<div id="search-component" class="p-6 bg-white border-b border-gray-100">
    <label for="product-search" class="sr-only">Search for Products</label>
    <div class="relative max-w-lg mx-auto">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <!-- Magnifying Glass Icon -->
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input type="text" id="product-search" placeholder="Search by brand, color, or style"
            class="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-full focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 shadow-sm"
            oninput="handleSearchInput(this.value)">
    </div>
    
    <!-- Area where search results will be displayed (currently empty) -->
    <div id="search-results" class="mt-4">
        <p class="text-center text-sm text-gray-500">Search results will appear here (Search logic pending).</p>
    </div>
</div>
