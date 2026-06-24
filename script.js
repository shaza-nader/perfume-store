/* Aurélie — script.js
   Covers: variables, functions, events, DOM, form validation, JSON, Fetch (GET & POST simulated)
*/

// ---------- Week 5: Interactive Button (Removed) ----------

// ---------- Week 6: Form validation ----------
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    let ok = true;

    document.getElementById("nameError").textContent = "";
    document.getElementById("emailError").textContent = "";
    document.getElementById("messageError").textContent = "";
    document.getElementById("formSuccess").textContent = "";

    if (!name) { document.getElementById("nameError").textContent = "Name is required"; ok = false; }
    if (!email) {
      document.getElementById("emailError").textContent = "Email is required"; ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById("emailError").textContent = "Please enter a valid email"; ok = false;
    }
    if (!message) { document.getElementById("messageError").textContent = "Message is required"; ok = false; }

    if (ok) {
      document.getElementById("formSuccess").textContent =
        `Thank you, ${name}! Your message has been sent.`;
      contactForm.reset();
    }
  });
}

// ---------- Cart Logic ----------
let cart = JSON.parse(localStorage.getItem('aurelie_cart')) || [];

function updateCartCount() {
  const countEl = document.getElementById('cartCount');
  if (countEl) {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    countEl.textContent = totalCount;
  }
}
updateCartCount();

function addToCart(productId) {
  const product = liveProducts.find(p => p.id === productId);
  if (!product) return;
  
  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem('aurelie_cart', JSON.stringify(cart));
  updateCartCount();
  alert(`Added ${product.name} to your cart.`);
}

// Render Cart on cart.html
const cartContainer = document.getElementById("cartContainer");

function renderCart() {
  if (!cartContainer) return;
  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty.</p><br/><a href='products.html' class='btn'>Continue Shopping</a>";
  } else {
    let total = 0;
    let tableHTML = `
      <table class="products-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
    `;
    cart.forEach(item => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      tableHTML += `
        <tr>
          <td>${item.name}</td>
          <td>$${item.price}</td>
          <td>${item.quantity}</td>
          <td>$${subtotal}</td>
          <td><button class="btn" style="background:#b73e3e; padding: 0.5rem 1rem;" onclick="removeFromCart('${String(item.id).replace(/'/g, "\\\\'").replace(/"/g, "&quot;")}')">Remove</button></td>
        </tr>
      `;
    });
    tableHTML += `
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align: right; font-weight: bold;">Total:</td>
            <td style="font-weight: bold;">$${total}</td>
          </tr>
        </tfoot>
      </table>
      <div style="text-align: right; margin-top: 1rem;">
        <button onclick="checkoutCart()" class="btn">Complete Order</button>
      </div>
    `;
    cartContainer.innerHTML = tableHTML;
  }
}

if (cartContainer) {
  renderCart();
}

function removeFromCart(productId) {
  // Filter out the item to remove it. Using != in case of string/number type differences
  cart = cart.filter(item => item.id != productId);
  localStorage.setItem('aurelie_cart', JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

function checkoutCart() {
  if (cart.length === 0) return;
  alert("Thank you for your order! Your payment has been processed.");
  cart = [];
  localStorage.removeItem('aurelie_cart');
  updateCartCount();
  renderCart();
}

// ---------- Load products from JSON / API ----------
let liveProducts = [];

function renderProducts(list) {
  const container = document.getElementById("apiProducts");
  if (!container) return;
  if (!list.length) { container.innerHTML = "<p>No products yet.</p>"; return; }
  container.innerHTML = list.map(p => {
    const imgSrc = p.image ? p.image : "images/collection.jpg";
    return `
    <div class="product-card flex-col-card">
      <img src="${imgSrc}" alt="${p.name}" class="product-img">
      <h3>${p.name}</h3>
      <p class="price">$${p.price}</p>
      <p class="desc">${p.description}</p>
      <button class="btn add-to-cart-btn" onclick="addToCart(${p.id})">Add to Cart</button>
    </div>
    `;
  }).join("");
}

// Load for storefront products
const apiContainer = document.getElementById("apiProducts");

function loadCatalog() {
  fetch("db.json")
    .then(res => {
      if (!res.ok) throw new Error("Failed to load db.json");
      return res.json();
    })
    .then(data => {
      const dbProducts = data.products || [];
      const deletedIds = JSON.parse(localStorage.getItem('aurelie_deleted_ids')) || [];
      const customProducts = JSON.parse(localStorage.getItem('aurelie_custom_products')) || [];
      
      // Filter out deleted db.json products
      const activeDbProducts = dbProducts.filter(p => !deletedIds.includes(p.id));
      
      liveProducts = [...activeDbProducts, ...customProducts];
      
      if (apiContainer) {
        if (liveProducts.length > 0) {
          renderProducts(liveProducts);
        } else {
          apiContainer.innerHTML = "<p>The catalog is currently empty.</p>";
        }
      }
    })
    .catch(err => {
      const errMsg = `<p style="color:#b73e3e">Error loading products: ${err.message}.<br/><br/><strong>Notice:</strong> To use the JSON file and Fetch API, you MUST open this site using a local server (like the VS Code "Live Server" extension), and NOT directly from your file system (file://).</p>`;
      if (apiContainer) apiContainer.innerHTML = errMsg;
    });
}

if (apiContainer) {
  loadCatalog();
}
