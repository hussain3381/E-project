/* ===========================
   OceanGate App Logic
   Cart, comparison, checkout, search, and notifications
   =========================== */

const cartState = {
  items: [],
  total: 0,
  load() {
    try {
      const stored = JSON.parse(localStorage.getItem("oceangate_cart") || "null");
      if (stored && Array.isArray(stored.items)) {
        this.items = stored.items;
        this.total =
          stored.total ??
          this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      } else {
        this.items = [];
        this.total = 0;
      }
    } catch (error) {
      this.items = [];
      this.total = 0;
    }
  },
  save() {
    localStorage.setItem(
      "oceangate_cart",
      JSON.stringify({
        items: this.items,
        total: this.total,
      }),
    );
  },
  recalcTotal() {
    this.total = this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  },
  addItem(product) {
    const existing = this.items.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
    this.recalcTotal();
    this.save();
  },
  removeItem(productId) {
    this.items = this.items.filter((item) => item.id !== productId);
    this.recalcTotal();
    this.save();
  },
  clear() {
    this.items = [];
    this.total = 0;
    this.save();
  },
};

const comparisonState = {
  items: [],
  load() {
    try {
      const stored = JSON.parse(localStorage.getItem("comparisonList") || "null");
      this.items = stored && Array.isArray(stored.items) ? stored.items : [];
    } catch (error) {
      this.items = [];
    }
  },
  save() {
    localStorage.setItem(
      "comparisonList",
      JSON.stringify({ items: this.items }),
    );
  },
  addItem(product) {
    if (this.items.some((item) => item.id === product.id)) return;
    if (this.items.length >= 3) {
      showNotification("Maximum comparison selection is 3 items", "error");
      return;
    }
    this.items.push({ ...product });
    this.save();
  },
  removeItem(productId) {
    this.items = this.items.filter((item) => item.id !== productId);
    this.save();
  },
  clear() {
    this.items = [];
    this.save();
  },
};

const productsDatabase = [
  {
    id: 101,
    name: "Sony CD-R 700MB Archival Premium",
    brand: "Sony",
    category: "CD",
    price: 350,
    speed: "52X",
    capacity: "700MB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "52X",
      writeSpeed: "52X",
      interface: "Optical",
      type: "CD",
      lifespan: "50+ Years",
    },
  },
  {
    id: 102,
    name: "Verbatim CD-R 700MB Professional",
    brand: "Verbatim",
    category: "CD",
    price: 360,
    speed: "52X",
    capacity: "700MB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "52X",
      writeSpeed: "52X",
      interface: "Optical",
      type: "CD",
      lifespan: "50+ Years",
    },
  },
  {
    id: 103,
    name: "Samsung CD-RW 700MB Rewritable",
    brand: "Samsung",
    category: "CD",
    price: 420,
    speed: "24X",
    capacity: "700MB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "24X",
      writeSpeed: "24X",
      interface: "Optical",
      type: "CD-RW",
      lifespan: "50+ Years",
    },
  },
  {
    id: 104,
    name: "Kingston CD-R 700MB Classic",
    brand: "Kingston",
    category: "CD",
    price: 340,
    speed: "52X",
    capacity: "700MB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "52X",
      writeSpeed: "52X",
      interface: "Optical",
      type: "CD",
      lifespan: "50+ Years",
    },
  },
  {
    id: 105,
    name: "SanDisk CD-R 700MB Archive",
    brand: "SanDisk",
    category: "CD",
    price: 365,
    speed: "52X",
    capacity: "700MB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "52X",
      writeSpeed: "52X",
      interface: "Optical",
      type: "CD",
      lifespan: "50+ Years",
    },
  },
  {
    id: 106,
    name: "Sony DVD-R 4.7GB High-Speed",
    brand: "Sony",
    category: "DVD",
    price: 780,
    speed: "16X",
    capacity: "4.7GB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "16X",
      writeSpeed: "16X",
      interface: "Optical",
      type: "DVD",
      lifespan: "50+ Years",
    },
  },
  {
    id: 107,
    name: "Verbatim DVD-RW 4.7GB Reusable",
    brand: "Verbatim",
    category: "DVD",
    price: 720,
    speed: "16X",
    capacity: "4.7GB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "16X",
      writeSpeed: "8X",
      interface: "Optical",
      type: "DVD-RW",
      lifespan: "50+ Years",
    },
  },
  {
    id: 108,
    name: "Samsung DVD-R 8.5GB Dual Layer",
    brand: "Samsung",
    category: "DVD",
    price: 890,
    speed: "16X",
    capacity: "8.5GB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "16X",
      writeSpeed: "16X",
      interface: "Optical",
      type: "DVD-R DL",
      lifespan: "50+ Years",
    },
  },
  {
    id: 109,
    name: "Kingston DVD-R 4.7GB Archive",
    brand: "Kingston",
    category: "DVD",
    price: 765,
    speed: "16X",
    capacity: "4.7GB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "16X",
      writeSpeed: "16X",
      interface: "Optical",
      type: "DVD",
      lifespan: "50+ Years",
    },
  },
  {
    id: 110,
    name: "SanDisk DVD-RW 4.7GB Professional",
    brand: "SanDisk",
    category: "DVD",
    price: 700,
    speed: "16X",
    capacity: "4.7GB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "16X",
      writeSpeed: "8X",
      interface: "Optical",
      type: "DVD-RW",
      lifespan: "50+ Years",
    },
  },
  {
    id: 111,
    name: "Sony Blu-ray BD-R 25GB Pro",
    brand: "Sony",
    category: "Blu-ray",
    price: 2200,
    speed: "10X",
    capacity: "25GB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "10X",
      writeSpeed: "10X",
      interface: "Optical",
      type: "Blu-ray",
      lifespan: "50+ Years",
    },
  },
  {
    id: 112,
    name: "Verbatim Blu-ray BD-R 50GB Archive",
    brand: "Verbatim",
    category: "Blu-ray",
    price: 2450,
    speed: "10X",
    capacity: "50GB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "10X",
      writeSpeed: "10X",
      interface: "Optical",
      type: "Blu-ray",
      lifespan: "50+ Years",
    },
  },
  {
    id: 113,
    name: "Samsung Blu-ray BD-R 100GB Triple Layer",
    brand: "Samsung",
    category: "Blu-ray",
    price: 4200,
    speed: "10X",
    capacity: "100GB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "10X",
      writeSpeed: "10X",
      interface: "Optical",
      type: "Blu-ray TL",
      lifespan: "50+ Years",
    },
  },
  {
    id: 114,
    name: "Kingston Blu-ray BD-R 25GB Elite",
    brand: "Kingston",
    category: "Blu-ray",
    price: 1750,
    speed: "10X",
    capacity: "25GB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "10X",
      writeSpeed: "10X",
      interface: "Optical",
      type: "Blu-ray",
      lifespan: "50+ Years",
    },
  },
  {
    id: 115,
    name: "SanDisk Blu-ray BD-R 25GB Studio",
    brand: "SanDisk",
    category: "Blu-ray",
    price: 1950,
    speed: "10X",
    capacity: "25GB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "10X",
      writeSpeed: "10X",
      interface: "Optical",
      type: "Blu-ray",
      lifespan: "50+ Years",
    },
  },
  {
    id: 116,
    name: "Sony 970 EVO 500GB NVMe SSD",
    brand: "Sony",
    category: "SSD",
    price: 11500,
    speed: "3500MB/s",
    capacity: "500GB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "3500MB/s",
      writeSpeed: "2500MB/s",
      interface: "NVMe M.2",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 117,
    name: "Verbatim N330 480GB NVMe SSD",
    brand: "Verbatim",
    category: "SSD",
    price: 8900,
    speed: "3200MB/s",
    capacity: "480GB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "3200MB/s",
      writeSpeed: "3000MB/s",
      interface: "NVMe M.2",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 118,
    name: "Samsung 980 PRO 1TB NVMe SSD",
    brand: "Samsung",
    category: "SSD",
    price: 18500,
    speed: "7000MB/s",
    capacity: "1TB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "7000MB/s",
      writeSpeed: "5100MB/s",
      interface: "NVMe M.2",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 119,
    name: "Kingston A400 SATA SSD 480GB",
    brand: "Kingston",
    category: "SSD",
    price: 8800,
    speed: "500MB/s",
    capacity: "480GB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "500MB/s",
      writeSpeed: "450MB/s",
      interface: "SATA III",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 120,
    name: "Kingston KC2500 1TB NVMe SSD",
    brand: "Kingston",
    category: "SSD",
    price: 14600,
    speed: "3500MB/s",
    capacity: "1TB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "3500MB/s",
      writeSpeed: "2900MB/s",
      interface: "NVMe M.2",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 121,
    name: "SanDisk CD-R 700MB Premium",
    brand: "SanDisk",
    category: "CD",
    price: 365,
    speed: "52X",
    capacity: "700MB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "52X",
      writeSpeed: "52X",
      interface: "Optical",
      type: "CD",
      lifespan: "50+ Years",
    },
  },
  {
    id: 122,
    name: "SanDisk DVD-R 4.7GB Reliable",
    brand: "SanDisk",
    category: "DVD",
    price: 590,
    speed: "16X",
    capacity: "4.7GB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "16X",
      writeSpeed: "16X",
      interface: "Optical",
      type: "DVD",
      lifespan: "50+ Years",
    },
  },
  {
    id: 123,
    name: "SanDisk Blu-ray BD-RE 25GB Rewritable",
    brand: "SanDisk",
    category: "Blu-ray",
    price: 3050,
    speed: "6X",
    capacity: "25GB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "6X",
      writeSpeed: "6X",
      interface: "Optical",
      type: "Blu-ray",
      lifespan: "50+ Years",
    },
  },
  {
    id: 124,
    name: "SanDisk Ultra 500GB SATA SSD",
    brand: "SanDisk",
    category: "SSD",
    price: 8900,
    speed: "520MB/s",
    capacity: "500GB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "520MB/s",
      writeSpeed: "500MB/s",
      interface: "SATA III",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 125,
    name: "SanDisk Extreme 1TB NVMe",
    brand: "SanDisk",
    category: "SSD",
    price: 18800,
    speed: "6600MB/s",
    capacity: "1TB",
    image: "src/img/placeholder.png",
    specs: {
      readSpeed: "6600MB/s",
      writeSpeed: "5000MB/s",
      interface: "NVMe M.2",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },
];

/* Assign local src images to products when placeholders are present */
function assignLocalProductImages() {
  const opticalSrc = 'src/img/SSD_SAMSUNG.png';
  const ssdSrc = 'src/img/SSD_SAMSUNG.png';
  const opticalCategories = ['CD', 'DVD', 'Blu-ray'];

  productsDatabase.forEach((product) => {
    const currentImage = (product.image || '').toString().trim();
    if (!currentImage || currentImage.includes('placeholder')) {
      if (opticalCategories.includes(product.category)) {
        product.image = opticalSrc;
      } else if (product.category === 'SSD') {
        product.image = ssdSrc;
      } else {
        product.image = opticalSrc;
      }
    }
  });
}

/* Page initialization and shared UI setup */
function initPage() {
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      this.classList.toggle("active");
      mobileMenu.classList.toggle("active");
    });
  }

  const mobileNavLinks = document.querySelectorAll(".mobile-menu a");
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", function () {
      if (menuBtn) menuBtn.classList.remove("active");
      if (mobileMenu) mobileMenu.classList.remove("active");
    });
  });

  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 800, once: true, offset: 120 });
  }

  assignLocalProductImages();
  cartState.load();
  comparisonState.load();
  updateCartBadge();

  if (document.getElementById("productGrid")) {
    initializeShopPage();
    initMobileFilterDrawer();
  }

  // Initialize global search UI on every page (if present)
  initSearchUI();

  // Inject small floating tech widget
  injectTechWidget();

  if (document.getElementById("comparisonTableContainer")) {
    renderComparisonPage();
  }

  if (document.getElementById("checkoutForm")) {
    initCheckoutPage();
  }
}

document.addEventListener("DOMContentLoaded", initPage);

function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;
  const itemCount = cartState.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  badge.textContent = itemCount;
}

function toggleCart() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  if (!drawer || !overlay) return;
  drawer.classList.toggle("active");
  overlay.classList.toggle("active");
}

function refreshCartDrawer() {
  const container = document.getElementById("cartItems");
  const totalElement = document.getElementById("cartTotal");
  if (!container || !totalElement) return;

  if (cartState.items.length === 0) {
    container.innerHTML =
      '<p style="color: var(--text-muted); text-align: center; padding: 40px 20px;">Your cart is empty</p>';
    totalElement.textContent = "0.00";
    return;
  }

  container.innerHTML = cartState.items
    .map(
      (item) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h6>${item.name}</h6>
                <p>Qty: ${item.quantity}</p>
                <p>Rs. ${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <div class="cart-item-actions">
                <span class="cart-item-price">Rs. ${(item.price * item.quantity).toFixed(2)}</span>
                <button class="cart-remove-btn" onclick="removeFromCart(${item.id})" aria-label="Remove ${item.name}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `,
    )
    .join("");

  totalElement.textContent = `Rs. ${cartState.total.toFixed(2)}`;
}

function removeFromCart(productId) {
  cartState.removeItem(productId);
  refreshCartDrawer();
  updateCartBadge();
}

function initializeShopPage() {
  // If the shop page was opened with a search query (from the navbar), honor it and pre-filter
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");

  attachFilterListeners();
  setupComparisonDelegation();

  if (q && q.trim().length) {
    const query = q.trim().toLowerCase();
    const matched = productsDatabase.filter((p) =>
      p.name.toLowerCase().includes(query),
    );
    renderProducts(matched.length ? matched : productsDatabase);
    // if search input exists on shop page, prefill it for clarity
    const shopSearch = document.getElementById("globalSearchInput");
    if (shopSearch) shopSearch.value = q;
  } else {
    renderProducts(productsDatabase);
  }

  const sortBy = document.getElementById("sortBy");
  if (sortBy) {
    sortBy.addEventListener("change", sortProducts);
  }
}

/* Create product cards for the shop page */
function renderProducts(products) {
  const grid = document.getElementById("productGrid");
  const productCount = document.getElementById("productCount");
  if (!grid) return;

  if (productCount) {
    productCount.textContent = products.length;
  }

  grid.innerHTML = products
    .map((product, index) => {
      const isCompared = comparisonState.items.some(
        (item) => item.id === product.id,
      );
      return `
            <div class="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="${index * 60}">
                <a href="./product-details.html?id=${product.id}" style="text-decoration: none;">
                  <article class="product-card" data-brand="${product.brand}" data-category="${product.category}" data-speed="${product.speed}" data-price="${product.price}">
                    <div class="product-card-image">
                        <img src="${product.image}" alt="${product.name}" class="product-image" />
                    </div>
                    <div class="product-card-body">
                        <h5>${product.name}</h5>
                        <div class="product-specs">
                            <span class="spec-badge">${product.speed}</span>
                            <span class="spec-badge">${product.capacity}</span>
                        </div>
                        <div class="product-price">Rs. ${product.price}</div>
                        <div class="product-actions">
                            <label class="compare-switch">
                                <input type="checkbox" class="compare-checkbox" data-product-id="${product.id}" ${isCompared ? "checked" : ""} />
                                Compare
                            </label>
                            <button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
                        </div>
                    </div>
                  </article>
                </a>
            </div>
        `;
    })
    .join("");

  attachAddToCartListeners();
}

/* ===========================
   Mobile Filter Drawer System (shop.html responsive)
   =========================== */
function initMobileFilterDrawer() {
  const mediaQuery = window.matchMedia("(max-width: 991px)");

  function handleFilterVisibility() {
    const filterContainer = document.querySelector(".filters-container");
    if (!filterContainer) return;

    if (mediaQuery.matches) {
      // Mobile view: hide filters, show toggle button
      filterContainer.style.display = "none";
      createFilterToggleButton();
    } else {
      // Desktop view: show filters inline
      filterContainer.style.display = "block";
      const toggleBtn = document.getElementById("mobileFilterToggle");
      if (toggleBtn) toggleBtn.remove();
    }
  }

  // Check on load
  handleFilterVisibility();

  // Listen for viewport changes
  mediaQuery.addEventListener("change", handleFilterVisibility);
}

function createFilterToggleButton() {
  // Check if button already exists
  if (document.getElementById("mobileFilterToggle")) return;

  const toggleBtn = document.createElement("button");
  toggleBtn.id = "mobileFilterToggle";
  toggleBtn.className = "btn btn-red";
  toggleBtn.innerHTML = '<i class="fas fa-filter"></i> Filters & Sort';
  toggleBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 20px;
    z-index: 1000;
    padding: 14px 20px;
    border: none;
    border-radius: 6px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    gap: 8px;
  `;

  toggleBtn.addEventListener("click", () => {
    const filterContainer = document.querySelector(".filters-container");
    if (!filterContainer) return;

    if (filterContainer.style.display === "none") {
      showFilterModal(filterContainer);
    }
  });

  document.body.appendChild(toggleBtn);
}

function showFilterModal(filterContainer) {
  const modal = document.createElement("div");
  modal.id = "mobileFilterModal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1500;
    display: flex;
    animation: fadeIn 0.3s ease;
  `;

  const drawer = document.createElement("div");
  drawer.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: 85%;
    max-width: 360px;
    height: 100vh;
    background: var(--pure-black);
    border-right: 1px solid rgba(92, 92, 92, 0.35);
    overflow-y: auto;
    z-index: 1600;
    padding: 20px;
    animation: slideInLeft 0.3s ease;
  `;

  drawer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(92, 92, 92, 0.35);">
      <h3 style="color: var(--text-white); margin: 0; font-size: 1.2rem;">Filters & Sort</h3>
      <button onclick="document.getElementById('mobileFilterModal').remove();" style="background: none; border: none; color: var(--text-gray); font-size: 1.5rem; cursor: pointer; padding: 0;">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  // Clone the filter content
  const filterClone = filterContainer.cloneNode(true);
  filterClone.style.display = "block";
  drawer.appendChild(filterClone);

  modal.appendChild(drawer);
  document.body.appendChild(modal);

  // Close modal when clicking overlay
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  // Re-attach event listeners to cloned filters
  attachFilterListeners();
}

/* ===========================
   AI Pulsing Footer Widget System
   =========================== */
function injectTechWidget() {
  if (document.getElementById("techWidget")) return;

  const widget = document.createElement("div");
  widget.id = "techWidget";
  widget.className = "tech-widget";
  widget.style.cssText = `
    animation: glowPulse 2s ease-in-out infinite;
  `;
  widget.innerHTML = '<div class="core">OG</div>';
  widget.title = "OceanGate Core System - Responsive Backend Terminal";

  widget.addEventListener("click", () => {
    showWidgetInfo();
  });

  widget.addEventListener("mouseenter", () => {
    widget.style.boxShadow = "0 12px 40px rgba(157, 0, 0, 0.4)";
  });

  widget.addEventListener("mouseleave", () => {
    widget.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.6)";
  });

  document.body.appendChild(widget);
}

function showWidgetInfo() {
  const existing = document.querySelector(".widget-info-tooltip");
  if (existing) {
    existing.remove();
    return;
  }

  const tooltip = document.createElement("div");
  tooltip.className = "widget-info-tooltip";
  tooltip.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid rgba(157, 0, 0, 0.4);
    border-radius: 6px;
    padding: 16px 20px;
    color: var(--text-white);
    font-size: 0.85rem;
    max-width: 220px;
    z-index: 10000;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
    animation: slideInUp 0.3s ease;
  `;

  tooltip.innerHTML = `
    <p style="margin: 0; font-weight: 700; color: var(--primary-red); margin-bottom: 8px;">
      <i class="fas fa-server"></i> OceanGate System
    </p>
    <p style="margin: 0; color: var(--text-gray); font-size: 0.8rem; line-height: 1.5;">
      Responsive storage platform with real-time cart sync and live product inventory.
    </p>
  `;

  document.body.appendChild(tooltip);

  setTimeout(() => {
    tooltip.remove();
  }, 4000);
}

/* Shop page filter controls */
function attachFilterListeners() {
  document
    .querySelectorAll(".brand-filter, .category-filter, .speed-filter")
    .forEach((input) => {
      input.addEventListener("change", filterProducts);
    });

  const priceRange = document.getElementById("priceRange");
  const priceValue = document.getElementById("priceValue");
  if (priceRange && priceValue) {
    priceRange.addEventListener("input", () => {
      priceValue.textContent = priceRange.value;
      filterProducts();
    });
  }
}

function setupComparisonDelegation() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  grid.removeEventListener("change", handleComparisonCheckboxChange);
  grid.addEventListener("change", handleComparisonCheckboxChange);
}

function handleComparisonCheckboxChange(event) {
  const target = event.target;
  if (!target || !target.classList.contains("compare-checkbox")) return;

  const productId = parseInt(target.dataset.productId, 10);
  if (Number.isNaN(productId)) return;

  const product = productsDatabase.find((p) => p.id === productId);
  if (!product) return;

  if (target.checked) {
    if (comparisonState.items.length >= 3) {
      target.checked = false;
      showNotification("Maximum 3 products can be compared at once", "error");
      return;
    }
    comparisonState.addItem(product);
  } else {
    comparisonState.removeItem(productId);
  }

  renderComparisonPage();
}

function attachAddToCartListeners() {
  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.removeEventListener("click", handleAddToCart);
    btn.addEventListener("click", handleAddToCart);
  });
}

function handleAddToCart(event) {
  const productId = parseInt(event.currentTarget.dataset.productId, 10);
  if (!Number.isNaN(productId)) {
    addToCart(productId);
  }
}

function addToCart(productId) {
  const product = productsDatabase.find((p) => p.id === productId);
  if (product) {
    cartState.addItem(product);
    refreshCartDrawer();
    updateCartBadge();
    showNotification(`${product.name} added to cart`);
  }
}

function toggleComparison(productId, isChecked) {
  const product = productsDatabase.find((p) => p.id === productId);
  if (!product) return;
  if (isChecked) {
    comparisonState.addItem(product);
  } else {
    comparisonState.removeItem(productId);
  }
  renderComparisonPage();
}

function filterProducts() {
  const brands = Array.from(
    document.querySelectorAll(".brand-filter:checked"),
  ).map((el) => el.value);
  const categories = Array.from(
    document.querySelectorAll(".category-filter:checked"),
  ).map((el) => el.value);
  const speeds = Array.from(
    document.querySelectorAll(".speed-filter:checked"),
  ).map((el) => el.value);
  const maxPrice =
    parseFloat(document.getElementById("priceRange")?.value) || 25000;

  const filtered = productsDatabase.filter((product) => {
    const brandMatch = brands.length === 0 || brands.includes(product.brand);
    const categoryMatch =
      categories.length === 0 || categories.includes(product.category);
    const speedMatch = speeds.length === 0 || speeds.includes(product.speed);
    const priceMatch = product.price <= maxPrice;
    return brandMatch && categoryMatch && speedMatch && priceMatch;
  });

  renderProducts(filtered);
}

function resetFilters() {
  document
    .querySelectorAll('#shopPage input[type="checkbox"]')
    .forEach((input) => (input.checked = false));
  const priceRange = document.getElementById("priceRange");
  const priceValue = document.getElementById("priceValue");
  if (priceRange && priceValue) {
    priceRange.value = 25000;
    priceValue.textContent = 25000;
  }
  filterProducts();
}

function sortProducts() {
  const sortBy = document.getElementById("sortBy")?.value;
  let sorted = [...productsDatabase];

  if (sortBy === "price-low") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    sorted.sort((a, b) => b.price - a.price);
  } else if (sortBy === "popular") {
    sorted.sort((a, b) => b.id - a.id);
  } else {
    sorted.reverse();
  }

  renderProducts(sorted);
}

/* Generate the comparison table for selected products */
function renderComparisonPage() {
  const container = document.getElementById("comparisonTableContainer");
  if (!container) return;

  if (comparisonState.items.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-bar"></i>
                <h3 style="color: var(--text-white); font-weight: 800; margin-bottom: 12px;">No Products Selected</h3>
                <p style="color: var(--text-gray); margin-bottom: 25px;">
                    Visit the shop and select products using the compare checkbox to view them here.
                </p>
                <a href="shop.html" class="btn btn-red">Start Shopping</a>
            </div>
        `;
    return;
  }

  const headings = comparisonState.items
    .map(
      (product) => `
        <th>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                <span><i class="fas fa-box-open" style="color: var(--primary-red); margin-right: 8px;"></i> ${product.name}</span>
                <button class="cart-remove-btn" onclick="removeFromComparison(${product.id})" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </th>
    `,
    )
    .join("");

  const rows = [
    { label: "Price", key: (item) => `Rs. ${item.price.toFixed(2)}` },
    { label: "Capacity", key: (item) => item.capacity },
    { label: "Read Speed", key: (item) => item.specs.readSpeed },
    { label: "Write Speed", key: (item) => item.specs.writeSpeed },
    { label: "Interface", key: (item) => item.specs.interface },
    { label: "Lifespan", key: (item) => item.specs.lifespan },
    { label: "Type", key: (item) => item.specs.type },
    {
      label: "Best For",
      key: (item) =>
        item.category === "ssd" ? "Fast Compute" : "Archival Backup",
    },
  ];

  const bodyRows = rows
    .map(
      (row) => `
        <tr>
            <td>${row.label}</td>
            ${comparisonState.items
              .map(
                (item) => `
                <td>${row.key(item)}</td>
            `,
              )
              .join("")}
        </tr>
    `,
    )
    .join("");

  container.innerHTML = `
        <div class="comparison-table-wrapper">
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Specification</th>
                        ${headings}
                    </tr>
                </thead>
                <tbody>
                    ${bodyRows}
                </tbody>
            </table>
        </div>
        <div style="margin-top: 30px; padding: 25px; background: rgba(255, 77, 77, 0.08); border: 1px solid rgba(255, 77, 77, 0.18); border-radius: 18px;">
            <h5 style="color: var(--primary-red); margin-bottom: 12px;">Smart Recommendation</h5>
            <p style="color: var(--text-gray); margin: 0; line-height: 1.8;">
                Comparing these selected devices helps highlight how optical media remains unmatched for archival longevity, while SSDs deliver premium speed for modern productivity and gaming workloads.
            </p>
        </div>
    `;
}

function removeFromComparison(productId) {
  comparisonState.removeItem(productId);
  renderComparisonPage();
  document.querySelectorAll(".compare-switch input").forEach((input) => {
    if (parseInt(input.dataset.productId, 10) === productId) {
      input.checked = false;
    }
  });
}

function clearComparison() {
  comparisonState.clear();
  renderComparisonPage();
  showNotification("Comparison list cleared");
}

function downloadComparison() {
  if (comparisonState.items.length === 0) {
    showNotification("No comparison data to export");
    return;
  }

  const headers = [
    "Name",
    "Price",
    "Capacity",
    "Read Speed",
    "Write Speed",
    "Interface",
    "Lifespan",
    "Type",
  ];
  const rows = comparisonState.items.map((item) => [
    item.name,
    `Rs. ${item.price.toFixed(2)}`,
    item.capacity,
    item.specs.readSpeed,
    item.specs.writeSpeed,
    item.specs.interface,
    item.specs.lifespan,
    item.specs.type,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "oceangate_comparison.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showNotification("Comparison exported as CSV");
}

/* Checkout page rendering and order flow */
function initCheckoutPage() {
  renderCheckoutSummary();
  attachCheckoutFormListener();
}

function renderCheckoutSummary() {
  const summaryContainer = document.getElementById("checkoutSummary");
  const checkoutTotal = document.getElementById("checkoutTotal");
  if (!summaryContainer || !checkoutTotal) return;

  if (cartState.items.length === 0) {
    summaryContainer.innerHTML = `
            <div style="color: var(--text-muted); text-align: center; padding: 40px 0;">
                <p>Your cart is empty.</p>
                <a href="shop.html" class="btn btn-red">Continue Shopping</a>
            </div>
        `;
    checkoutTotal.textContent = "Rs. 0.00";
    return;
  }

  summaryContainer.innerHTML = cartState.items
    .map(
      (item) => `
        <div class="order-item" style="display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <span class="order-item-name" style="color: var(--text-white);">${item.name} x${item.quantity}</span>
            <span class="order-item-price" style="color: var(--text-white);">Rs. ${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `,
    )
    .join("");

  checkoutTotal.textContent = `Rs. ${cartState.total.toFixed(2)}`;
}

function attachCheckoutFormListener() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (validateCheckoutForm()) {
      processOrder();
    }
  });
}

function validateCheckoutForm() {
  const name = document.getElementById("fullName")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const address = document.getElementById("address")?.value.trim();
  const payment = document.querySelector(
    'input[name="paymentMethod"]:checked',
  )?.value;

  if (!name || !email || !address || !payment) {
    showNotification("Please complete all required fields");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showNotification("Please enter a valid email address");
    return false;
  }

  return true;
}

function processOrder() {
  const order = {
    id: `OG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    items: cartState.items,
    total: cartState.total,
    customer: {
      name: document.getElementById("fullName")?.value || "",
      email: document.getElementById("email")?.value || "",
      address: document.getElementById("address")?.value || "",
      city: document.getElementById("city")?.value || "",
      postalCode: document.getElementById("postalCode")?.value || "",
    },
    payment:
      document.querySelector('input[name="paymentMethod"]:checked')?.value ||
      "",
  };

  const orders = JSON.parse(localStorage.getItem("oceangate_orders") || "[]");
  orders.push(order);
  localStorage.setItem("oceangate_orders", JSON.stringify(orders));

  showOrderSuccessModal(order);
  cartState.clear();
  renderCheckoutSummary();
  updateCartBadge();
}

function showOrderSuccessModal(order) {
  const modal = document.createElement("div");
  modal.style.cssText = `position: fixed; inset: 0; background: rgba(0, 0, 0, 0.82); display: flex; align-items: center; justify-content: center; z-index: 3000; animation: fadeIn 0.3s ease;`;
  modal.innerHTML = `
        <div style="background: var(--bg-panel); padding: 36px; border-radius: 28px; max-width: 520px; width: 92%; text-align: center; border: 1px solid rgba(255, 77, 77, 0.22);">
            <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--primary-red); margin-bottom: 20px; display: block;"></i>
            <h2 style="color: var(--text-white); margin-bottom: 14px;">Order Placed Successfully!</h2>
            <p style="color: var(--text-gray); margin-bottom: 16px;">Order ID: <span style="color: var(--primary-red); font-weight: 700;">${order.id}</span></p>
            <p style="color: var(--text-gray); margin-bottom: 24px;">A confirmation email has been sent to <strong>${order.customer.email}</strong>.</p>
            <button id="successContinueButton" class="btn btn-red" style="padding: 14px 32px; border-radius: 20px;">Continue Shopping</button>
        </div>
    `;

  document.body.appendChild(modal);
  document
    .getElementById("successContinueButton")
    ?.addEventListener("click", () => {
      document.body.removeChild(modal);
      window.location.href = "shop.html";
    });

  setTimeout(() => {
    if (document.body.contains(modal)) {
      modal.style.animation = "fadeOut 0.3s ease";
      setTimeout(() => modal.remove(), 300);
    }
  }, 6000);
}

function closeSuccessModal() {
  const modal = document.getElementById("orderSuccessModal");
  if (!modal) return;
  modal.style.display = "none";
}

/* Notification helper for user feedback */
function showNotification(message) {
  let container = document.getElementById("notificationContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "notificationContainer";
    container.style.cssText =
      "position: fixed; top: 20px; right: 20px; z-index: 3100; display: flex; flex-direction: column; gap: 12px;";
    document.body.appendChild(container);
  }

  const notification = document.createElement("div");
  notification.style.cssText = `background: var(--primary-red); color: white; padding: 14px 20px; border-radius: 18px; box-shadow: 0 14px 40px rgba(255, 77, 77, 0.24); font-weight: 700; min-width: 240px; max-width: 320px; animation: slideInRight 0.3s ease;`;
  notification.textContent = message;
  container.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

const utilStyle = document.createElement("style");
utilStyle.textContent = `
    @keyframes slideInRight { from { transform: translateX(36px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(36px); opacity: 0; } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
`;
document.head.appendChild(utilStyle);

/*
 * Search UI: lightweight, human-friendly handlers.
 * - Initializes any `.search-wrapper` on the page.
 * - Shows live suggestions when typing 2+ characters.
 * - Redirects to `shop.html?q=...` when selecting or pressing Enter.
 */
function initSearchUI() {
  const wrappers = document.querySelectorAll(".search-wrapper");
  if (!wrappers || wrappers.length === 0) return;

  wrappers.forEach((sw) => {
    const trigger = sw.querySelector(".search-trigger");
    const expand = sw.querySelector(".search-expand");
    const input = sw.querySelector(".search-input");
    const panel = sw.querySelector(".suggestions-panel");

    if (!trigger || !input || !panel) return;

    trigger.addEventListener("click", (ev) => {
      ev.stopPropagation();
      sw.classList.toggle("open");
      if (sw.classList.contains("open")) {
        input.focus();
        expand.setAttribute("aria-hidden", "false");
        panel.setAttribute("aria-hidden", "false");
      } else {
        expand.setAttribute("aria-hidden", "true");
        panel.setAttribute("aria-hidden", "true");
        clearSuggestions(panel);
      }
    });

    // Live suggestions
    input.addEventListener("input", () => {
      const q = input.value.trim();
      if (q.length < 2) {
        clearSuggestions(panel);
        return;
      }
      const matches = productsDatabase.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()),
      );
      showSuggestions(panel, matches, q);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const q = input.value.trim();
        if (q) goToShopWithQuery(q);
      }
      if (e.key === "Escape") {
        sw.classList.remove("open");
        clearSuggestions(panel);
      }
    });

    panel.addEventListener("click", (e) => {
      const it = e.target.closest(".suggestion-item");
      if (!it) return;
      const q = it.dataset.q || it.textContent.trim();
      goToShopWithQuery(q);
    });

    // Close when clicking outside the control
    document.addEventListener("click", (e) => {
      if (!sw.contains(e.target)) {
        sw.classList.remove("open");
        clearSuggestions(panel);
      }
    });
  });
}

function showSuggestions(panel, items, query) {
  if (!panel) return;
  if (!items || items.length === 0) {
    panel.innerHTML =
      '<div style="padding:12px;color:var(--text-gray);">No results</div>';
    return;
  }

  panel.innerHTML = items
    .slice(0, 8)
    .map((it) => {
      const highlighted = it.name.replace(
        new RegExp(query, "ig"),
        (match) => `<span class="match">${match}</span>`,
      );
      return `<div class="suggestion-item" data-q="${it.name}"><div class="label">${highlighted}</div><div class="meta">${it.brand || ""}</div></div>`;
    })
    .join("");
}

function clearSuggestions(panel) {
  if (panel) panel.innerHTML = "";
}

function goToShopWithQuery(q) {
  // Keep UX simple � programmatic redirect
  const target = "shop.html?q=" + encodeURIComponent(q);
  window.location.href = target;
}

/*
 * Floating tech widget (non-intrusive demo). Injected into the page.
 * Small, animated, and triggers a lightweight notification.
 */
function injectTechWidget() {
  if (document.querySelector(".tech-widget")) return;
  const w = document.createElement("div");
  w.className = "tech-widget";
  w.innerHTML = '<div class="core">OG</div>'; // OG = OceanGate small badge
  w.addEventListener("click", () => {
    showNotification("Tech core � quick demo widget");
  });
  document.body.appendChild(w);
}

window.toggleCart = toggleCart;
window.removeFromCart = removeFromCart;
window.addToCart = addToCart;
window.filterProducts = filterProducts;
window.resetFilters = resetFilters;
window.sortProducts = sortProducts;
window.toggleComparison = toggleComparison;
window.processOrder = processOrder;
window.initCheckoutPage = initCheckoutPage;
window.clearComparison = clearComparison;
window.downloadComparison = downloadComparison;
window.showNotification = showNotification;
window.closeSuccessModal = closeSuccessModal;

