/* ============================
   Product Details Feature Module (product-details.html)
   Extends global js/app.js product rendering
   ============================ */

/* ===== Product Details Page Initialization ===== */
function initProductDetailsPage() {
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get("id"));

  if (!productId) {
    showProductNotFound();
    return;
  }

  const product = productsDatabase.find((p) => p.id === productId);

  if (!product) {
    showProductNotFound();
    return;
  }

  renderProductDetails(product);
  renderRelatedProducts(product);
}

/* ===== Render Product Details ===== */
function renderProductDetails(product) {
  // Update breadcrumb
  const breadcrumb = document.getElementById("breadcrumbProduct");
  if (breadcrumb) breadcrumb.textContent = product.name;

  // Update page title
  document.title = `OceanGate | ${product.name}`;

  // Update product brand
  const brandElem = document.querySelector("[id='productBrand']");
  if (brandElem) brandElem.textContent = product.brand.toUpperCase();

  // Update product title
  const titleElem = document.getElementById("productTitle");
  if (titleElem) titleElem.textContent = product.name;

  // Update product price
  const priceElem = document.getElementById("productPrice");
  if (priceElem) priceElem.textContent = `Rs. ${product.price}`;

  // Update product icon
  const iconElem = document.getElementById("productDetailIcon");
  if (iconElem) {
    iconElem.innerHTML = `<img src="${product.image}" alt="${product.name}" style="max-width: 100%; max-height: 100%;">`;
  }

  // Update product warranty
  const warrantyElem = document.getElementById("productWarranty");
  if (warrantyElem) {
    warrantyElem.textContent = product.specs.lifespan || "Lifetime";
  }

  // Render specifications
  renderSpecifications(product);

  // Setup Add to Cart button
  setupAddToCartButton(product);
}

/* ===== Render Product Specifications ===== */
function renderSpecifications(product) {
  const specsContainer = document.getElementById("productSpecsDetail");
  if (!specsContainer) return;

  const specs = product.specs;
  let specsHTML = "";

  const specKeys = [
    { key: "type", label: "Product Type" },
    { key: "readSpeed", label: "Read Speed" },
    { key: "writeSpeed", label: "Write Speed" },
    { key: "interface", label: "Interface" },
    { key: "lifespan", label: "Lifespan" },
  ];

  specKeys.forEach(({ key, label }) => {
    if (specs[key]) {
      specsHTML += `
        <div class="spec-item">
          <div class="spec-item-label">${label}</div>
          <div class="spec-item-value">
            <span class="highlight">${specs[key]}</span>
          </div>
        </div>
      `;
    }
  });

  specsContainer.innerHTML = specsHTML;
}

/* ===== Setup Add to Cart Button ===== */
function setupAddToCartButton(product) {
  const addBtn = document.getElementById("addToCartBtn");
  const quantityInput = document.getElementById("quantityInput");

  if (!addBtn) return;

  addBtn.onclick = () => {
    const quantity = parseInt(quantityInput.value) || 1;

    if (quantity < 1) {
      showNotification("Please select a valid quantity", "error");
      return;
    }

    // Add to cart (uses global cartState from app.js)
    for (let i = 0; i < quantity; i++) {
      cartState.addItem(product);
    }

    refreshCartDrawer();
    updateCartBadge();

    showNotification(
      `${product.name} added to cart! (Qty: ${quantity})`,
      "success"
    );
  };
}

/* ===== Render Related Products ===== */
function renderRelatedProducts(currentProduct) {
  const container = document.getElementById("relatedProductsContainer");
  if (!container) return;

  // Get related products (same category or brand, but not the current product)
  let related = productsDatabase.filter(
    (p) =>
      p.id !== currentProduct.id &&
      (p.category === currentProduct.category ||
        p.brand === currentProduct.brand)
  );

  // Limit to 4 products
  related = related.slice(0, 4);

  if (related.length === 0) {
    container.innerHTML =
      '<p style="color: var(--text-gray); text-align: center; grid-column: 1/-1; padding: 40px;">No related products found</p>';
    return;
  }

  container.innerHTML = related
    .map((product) => {
      return `
        <div class="col-md-6 col-lg-3">
          <a href="./product-details.html?id=${product.id}" style="text-decoration: none;">
            <div class="related-product-card">
              <div class="related-product-image">
                ${product.image}
              </div>
              <div class="related-product-body">
                <h4 class="related-product-title">${product.name}</h4>
                <div class="related-product-specs">
                  <span class="related-product-badge">${product.speed}X</span>
                  <span class="related-product-badge">${product.capacity}</span>
                </div>
                <div class="related-product-footer">
                  <span class="related-product-price">Rs. ${product.price}</span>
                  <button class="related-product-link" onclick="event.preventDefault(); addToCartQuick(${product.id});">
                    <i class="fas fa-cart-plus"></i> Add
                  </button>
                </div>
              </div>
            </div>
          </a>
        </div>
      `;
    })
    .join("");
}

/* ===== Quick Add to Cart for Related Products ===== */
function addToCartQuick(productId) {
  const product = productsDatabase.find((p) => p.id === productId);
  if (!product) return;

  cartState.addItem(product);
  refreshCartDrawer();
  updateCartBadge();

  showNotification(`${product.name} added to cart!`, "success");
}

/* ===== Product Not Found Handler ===== */
function showProductNotFound() {
  const container = document.getElementById("productDetailsContainer");
  if (container) {
    container.innerHTML = `
      <div class="container" style="text-align: center; padding: 100px 20px;">
        <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: var(--primary-red); margin-bottom: 20px; display: block;"></i>
        <h1 style="font-size: 2rem; color: var(--text-white); margin-bottom: 12px;">Product Not Found</h1>
        <p style="color: var(--text-gray); font-size: 1.1rem; margin-bottom: 30px;">The product you're looking for doesn't exist or has been removed.</p>
        <a href="./shop.html" class="btn btn-red">Return to Shop</a>
      </div>
    `;
  }
}

/* ===== Notification System ===== */
function showNotification(message, type = "info") {
  const existing = document.querySelector(".product-notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = "product-notification";
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === "success" ? "rgba(76, 175, 80, 0.9)" : type === "error" ? "rgba(244, 67, 54, 0.9)" : "rgba(33, 150, 243, 0.9)"};
    color: white;
    border-radius: 6px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/* ===== Initialize on Page Load ===== */
document.addEventListener("DOMContentLoaded", () => {
  // Initialize global app features first
  cartState.load();
  comparisonState.load();
  updateCartBadge();

  // Then initialize product details page
  initProductDetailsPage();

  // Initialize AOS animations
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 800, once: true, offset: 120 });
  }
});

/* ===== Add notification animations to page ===== */
if (!document.querySelector("style[data-product-animations]")) {
  const style = document.createElement("style");
  style.setAttribute("data-product-animations", "");
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
