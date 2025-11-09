// The structure for a single product item, used when adding to the cart
const productToAdd = {
    id: 'SKU-001',
    name: 'Runner X2000',
    size: 10,
    price: 129.99,
    quantity: 1, // Start with a quantity of 1 when first added
    image: 'url_to_shoe_image'
};

// Global variable representing the local, in-memory cart data.
// The data structure is an Array of Objects.
let shoppingCart = []; 

console.log("Initial Cart Data Structure:", shoppingCart); 
// Expected output: []
