/* ===========================
   OceanGate App Logic
   Cart, comparison, checkout, search, and notifications
   =========================== */

// OCEANGATE PRE-LOADER IMPLEMENTATION
window.addEventListener('load', () => {
    const preloader = document.getElementById('og-preloader-shuttle');
    
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            setTimeout(() => {
                preloader.remove();
            }, 500);
            
        }, 1500);
    }
});


const cartState = {
  items: [],
  total: 0,
  load() {
    try {
      const stored = JSON.parse(
        localStorage.getItem("oceangate_cart") || "null",
      );
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

/* Comparison state management */
const comparisonState = {
  items: [],
  load() {
    try {
      const stored = JSON.parse(
        localStorage.getItem("oceangate_comparison") || "null",
      );
      this.items = stored && Array.isArray(stored.items) ? stored.items : [];
    } catch (error) {
      this.items = [];
    }
  },
  save() {
    localStorage.setItem(
      "oceangate_comparison",
      JSON.stringify({ items: this.items }),
    );
  },
  addItem(product) {
    if (!this.items.some((item) => item.id === product.id)) {
      this.items.push({ ...product });
      this.save();
    }
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

/* Product metadata for shop and search */
const productsDatabase = [
  /* ===== CD-R / CD-RW OPTICAL MEDIA (IDs: 101-110) ===== */
  {
    id: 101,
    name: "Sony CD-R 700MB Archival Grade",
    brand: "sony",
    category: "cd-r",
    price: 350,
    speed: "52",
    capacity: "700MB",
    image: 'https://picsum.photos/600/400?tech=1',
    specs: {
      readSpeed: "52X",
      writeSpeed: "52X",
      interface: "Optical",
      type: "CD-R",
      lifespan: "10+ Years",
    },
  },
  
  {
    id: 102,
    name: "Verbatim CD-R 700MB Premium",
    brand: "verbatim",
    category: "cd-r",
    price: 380,
    speed: "52",
    capacity: "700MB",
    image: 'https://picsum.photos/600/400?tech=2',
    specs: {
      readSpeed: "52X",
      writeSpeed: "52X",
      interface: "Optical",
      type: "CD-R",
      lifespan: "12+ Years",
    },
  },
  {
    id: 103,
    name: "Samsung CD-RW 700MB Rewritable",
    brand: "samsung",
    category: "cd-rw",
    price: 420,
    speed: "24",
    capacity: "700MB",
    image: 'https://picsum.photos/600/400?tech=3',
    specs: {
      readSpeed: "24X",
      writeSpeed: "24X",
      interface: "Optical",
      type: "CD-RW",
      lifespan: "10+ Years",
    },
  },
  {
    id: 104,
    name: "Kingston CD-R 700MB Standard",
    brand: "kingston",
    category: "cd-r",
    price: 340,
    speed: "52",
    capacity: "700MB",
    image: 'https://picsum.photos/600/400?tech=4',
    specs: {
      readSpeed: "52X",
      writeSpeed: "52X",
      interface: "Optical",
      type: "CD-R",
      lifespan: "10+ Years",
    },
  },
  {
    id: 105,
    name: "SanDisk CD-R 700MB Media",
    brand: "sandisk",
    category: "cd-r",
    price: 360,
    speed: "52",
    capacity: "700MB",
    image: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&w=600&q=80' ,
    specs: {
      readSpeed: "52X",
      writeSpeed: "52X",
      interface: "Optical",
      type: "CD-R",
      lifespan: "10+ Years",
    },
  },

  /* ===== DVD / DVD-RW OPTICAL MEDIA (IDs: 111-120) ===== */
  {
    id: 111,
    name: "Verbatim DVD-RW 4.7GB Single Layer",
    brand: "verbatim",
    category: "dvd-rw",
    price: 650,
    speed: "16",
    capacity: "4.7GB",
    image: 'https://picsum.photos/600/400?tech=5',
    specs: {
      readSpeed: "16X",
      writeSpeed: "8X",
      interface: "Optical",
      type: "DVD-RW",
      lifespan: "10+ Years",
    },
  },
  {
    id: 112,
    name: "Sony DVD-R 8.5GB Dual Layer",
    brand: "sony",
    category: "dvd-r",
    price: 850,
    speed: "16",
    capacity: "8.5GB",
    image: 'https://picsum.photos/600/400?tech=6',
    specs: {
      readSpeed: "16X",
      writeSpeed: "16X",
      interface: "Optical",
      type: "DVD-R DL",
      lifespan: "10+ Years",
    },
  },
  {
    id: 113,
    name: "Samsung DVD-RW 4.7GB Media Pack",
    brand: "samsung",
    category: "dvd-rw",
    price: 620,
    speed: "16",
    capacity: "4.7GB",
    image: 'https://picsum.photos/600/400?tech=7',
    specs: {
      readSpeed: "16X",
      writeSpeed: "8X",
      interface: "Optical",
      type: "DVD-RW",
      lifespan: "10+ Years",
    },
  },
  {
    id: 114,
    name: "Kingston DVD-R 4.7GB Archive",
    brand: "kingston",
    category: "dvd-r",
    price: 580,
    speed: "16",
    capacity: "4.7GB",
    image: 'https://picsum.photos/600/400?tech=8',
    specs: {
      readSpeed: "16X",
      writeSpeed: "16X",
      interface: "Optical",
      type: "DVD-R",
      lifespan: "10+ Years",
    },
  },
  {
    id: 115,
    name: "SanDisk DVD-RW 4.7GB Professional",
    brand: "sandisk",
    category: "dvd-rw",
    price: 680,
    speed: "16",
    capacity: "4.7GB",
    image: 'https://picsum.photos/600/400?tech=9',
    specs: {
      readSpeed: "16X",
      writeSpeed: "8X",
      interface: "Optical",
      type: "DVD-RW",
      lifespan: "10+ Years",
    },
  },

  /* ===== BLU-RAY OPTICAL MEDIA (IDs: 121-127) ===== */
  {
    id: 121,
    name: "Sony Blu-ray BD-R 50GB Single Layer",
    brand: "sony",
    category: "blu-ray",
    price: 2500,
    speed: "10",
    capacity: "50GB",
    image: 'https://picsum.photos/600/400?tech=10',
    specs: {
      readSpeed: "10X",
      writeSpeed: "10X",
      interface: "Optical",
      type: "Blu-ray",
      lifespan: "10+ Years",
    },
  },
  {
    id: 122,
    name: "Verbatim Blu-ray BD-R 25GB",
    brand: "verbatim",
    category: "blu-ray",
    price: 1800,
    speed: "10",
    capacity: "25GB",
    image: 'https://picsum.photos/600/400?tech=11',
    specs: {
      readSpeed: "10X",
      writeSpeed: "10X",
      interface: "Optical",
      type: "Blu-ray",
      lifespan: "10+ Years",
    },
  },
  {
    id: 123,
    name: "Samsung Blu-ray BD-R 100GB Triple Layer",
    brand: "samsung",
    category: "blu-ray",
    price: 4200,
    speed: "10",
    capacity: "100GB",
    image: 'https://picsum.photos/600/400?tech=12',
    specs: {
      readSpeed: "10X",
      writeSpeed: "10X",
      interface: "Optical",
      type: "Blu-ray TL",
      lifespan: "10+ Years",
    },
  },
  {
    id: 124,
    name: "Kingston Blu-ray BD-R 50GB AV Grade",
    brand: "kingston",
    category: "blu-ray",
    price: 2400,
    speed: "10",
    capacity: "50GB",
    image: 'https://picsum.photos/600/400?tech=13',
    specs: {
      readSpeed: "10X",
      writeSpeed: "10X",
      interface: "Optical",
      type: "Blu-ray",
      lifespan: "10+ Years",
    },
  },

  /* ===== SSD STORAGE DRIVES (IDs: 201-215) ===== */
  {
    id: 201,
    name: "Kingston A400 240GB SATA SSD",
    brand: "kingston",
    category: "ssd",
    price: 4200,
    speed: "550",
    capacity: "240GB",
    image: 'https://picsum.photos/600/400?tech=14',
    specs: {
      readSpeed: "550MB/s",
      writeSpeed: "500MB/s",
      interface: "SATA III",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 202,
    name: "Kingston A400 512GB SATA SSD",
    brand: "kingston",
    category: "ssd",
    price: 7500,
    speed: "570",
    capacity: "512GB",
    image: 'https://picsum.photos/600/400?tech=15',
    specs: {
      readSpeed: "570MB/s",
      writeSpeed: "550MB/s",
      interface: "SATA III",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 203,
    name: "Kingston A400 1TB SATA SSD",
    brand: "kingston",
    category: "ssd",
    price: 13500,
    speed: "570",
    capacity: "1TB",
    image: 'https://picsum.photos/600/400?tech=16',
    specs: {
      readSpeed: "570MB/s",
      writeSpeed: "550MB/s",
      interface: "SATA III",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 204,
    name: "Samsung 860 EVO 250GB SATA SSD",
    brand: "samsung",
    category: "ssd",
    price: 4800,
    speed: "550",
    capacity: "250GB",
    image: 'https://picsum.photos/600/400?tech=17',
    specs: {
      readSpeed: "550MB/s",
      writeSpeed: "520MB/s",
      interface: "SATA III",
      type: "SSD",
      lifespan: "4-6 Years",
    },
  },
  {
    id: 205,
    name: "Samsung 860 EVO 500GB SATA SSD",
    brand: "samsung",
    category: "ssd",
    price: 8500,
    speed: "550",
    capacity: "500GB",
    image: 'https://picsum.photos/600/400?tech=18',
    specs: {
      readSpeed: "550MB/s",
      writeSpeed: "520MB/s",
      interface: "SATA III",
      type: "SSD",
      lifespan: "4-6 Years",
    },
  },
  {
    id: 206,
    name: "Samsung 860 EVO 1TB SATA SSD",
    brand: "samsung",
    category: "ssd",
    price: 15000,
    speed: "550",
    capacity: "1TB",
    image: 'https://picsum.photos/600/400?tech=19',
    specs: {
      readSpeed: "550MB/s",
      writeSpeed: "520MB/s",
      interface: "SATA III",
      type: "SSD",
      lifespan: "4-6 Years",
    },
  },
  {
    id: 207,
    name: "SanDisk SSD Plus 240GB SATA",
    brand: "sandisk",
    category: "ssd",
    price: 4100,
    speed: "530",
    capacity: "240GB",
    image: 'https://picsum.photos/600/400?tech=20',
    specs: {
      readSpeed: "530MB/s",
      writeSpeed: "450MB/s",
      interface: "SATA III",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 208,
    name: "SanDisk SSD Plus 480GB SATA",
    brand: "sandisk",
    category: "ssd",
    price: 7200,
    speed: "530",
    capacity: "480GB",
    image: 'https://picsum.photos/600/400?tech=21',
    specs: {
      readSpeed: "530MB/s",
      writeSpeed: "450MB/s",
      interface: "SATA III",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 209,
    name: "Kingston NV1 500GB NVMe SSD",
    brand: "kingston",
    category: "ssd",
    price: 9200,
    speed: "2100",
    capacity: "500GB",
    image: 'https://picsum.photos/600/400?tech=22',
    specs: {
      readSpeed: "2100MB/s",
      writeSpeed: "1700MB/s",
      interface: "NVMe M.2",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 210,
    name: "Kingston NV1 1TB NVMe SSD",
    brand: "kingston",
    category: "ssd",
    price: 16500,
    speed: "2100",
    capacity: "1TB",
    image: 'https://picsum.photos/600/400?tech=23',
    specs: {
      readSpeed: "2100MB/s",
      writeSpeed: "1700MB/s",
      interface: "NVMe M.2",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 211,
    name: "Samsung 970 EVO 500GB NVMe SSD",
    brand: "samsung",
    category: "ssd",
    price: 11500,
    speed: "3500",
    capacity: "500GB",
    image: 'https://picsum.photos/600/400?tech=24',
    specs: {
      readSpeed: "3500MB/s",
      writeSpeed: "2500MB/s",
      interface: "NVMe M.2",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 212,
    name: "Samsung 970 EVO 1TB NVMe SSD",
    brand: "samsung",
    category: "ssd",
    price: 19500,
    speed: "3500",
    capacity: "1TB",
    image: 'https://picsum.photos/600/400?tech=25',
    specs: {
      readSpeed: "3500MB/s",
      writeSpeed: "2500MB/s",
      interface: "NVMe M.2",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 213,
    name: "SanDisk Ultra 3D 500GB SATA SSD",
    brand: "sandisk",
    category: "ssd",
    price: 8800,
    speed: "560",
    capacity: "500GB",
    image: 'https://picsum.photos/600/400?tech=26',
    specs: {
      readSpeed: "560MB/s",
      writeSpeed: "530MB/s",
      interface: "SATA III",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 214,
    name: "Crucial MX500 500GB SATA SSD",
    brand: "crucial",
    category: "ssd",
    price: 8900,
    speed: "560",
    capacity: "500GB",
    image: 'https://picsum.photos/600/400?tech=27',
    specs: {
      readSpeed: "560MB/s",
      writeSpeed: "510MB/s",
      interface: "SATA III",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 215,
    name: "Intel 660p 512GB NVMe SSD",
    brand: "intel",
    category: "ssd",
    price: 9500,
    speed: "1800",
    capacity: "512GB",
    image: 'https://picsum.photos/600/400?tech=28',
    specs: {
      readSpeed: "1800MB/s",
      writeSpeed: "1200MB/s",
      interface: "NVMe M.2",
      type: "SSD",
      lifespan: "5-7 Years",
    },
  },

  /* ===== HDD STORAGE DRIVES (IDs: 301-305) ===== */
  {
    id: 301,
    name: "Seagate Barracuda 1TB HDD",
    brand: "seagate",
    category: "hdd",
    price: 5500,
    speed: "150",
    capacity: "1TB",
    image: 'https://picsum.photos/600/400?tech=29',
    specs: {
      readSpeed: "150MB/s",
      writeSpeed: "150MB/s",
      interface: "SATA III",
      type: "HDD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 302,
    name: "Seagate Barracuda 2TB HDD",
    brand: "seagate",
    category: "hdd",
    price: 8500,
    speed: "150",
    capacity: "2TB",
    image: 'https://picsum.photos/600/400?tech=30',
    specs: {
      readSpeed: "150MB/s",
      writeSpeed: "150MB/s",
      interface: "SATA III",
      type: "HDD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 303,
    name: "Seagate Barracuda 4TB HDD",
    brand: "seagate",
    category: "hdd",
    price: 14500,
    speed: "150",
    capacity: "4TB",
    image: 'https://picsum.photos/600/400?tech=31',
    specs: {
      readSpeed: "150MB/s",
      writeSpeed: "150MB/s",
      interface: "SATA III",
      type: "HDD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 304,
    name: "WD Blue 2TB HDD Standard",
    brand: "wd",
    category: "hdd",
    price: 8800,
    speed: "150",
    capacity: "2TB",
    image: 'https://picsum.photos/600/400?tech=32',
    specs: {
      readSpeed: "150MB/s",
      writeSpeed: "150MB/s",
      interface: "SATA III",
      type: "HDD",
      lifespan: "5-7 Years",
    },
  },
  {
    id: 305,
    name: "WD Blue 4TB HDD Standard",
    brand: "wd",
    category: "hdd",
    price: 15000,
    speed: "150",
    capacity: "4TB",
    image: 'https://picsum.photos/600/400?tech=34',
    specs: {
      readSpeed: "150MB/s",
      writeSpeed: "150MB/s",
      interface: "SATA III",
      type: "HDD",
      lifespan: "5-7 Years",
    },
  },
];

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
                <p>$${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <div class="cart-item-actions">
                <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                <button class="cart-remove-btn" onclick="removeFromCart(${item.id})" aria-label="Remove ${item.name}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `,
    )
    .join("");

  totalElement.textContent = cartState.total.toFixed(2);
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
                  <article class="product-card">
                    <div class="product-card-image">

                    <img src="${product.image}" alt="${product.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    </div>
                    <div class="product-card-body">
                        <h5>${product.name}</h5>
                        <div class="product-specs">
                            <span class="spec-badge">${product.speed}X</span>
                            <span class="spec-badge">${product.capacity}</span>
                        </div>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        <div class="product-actions">
                            <label class="compare-switch" onclick="event.preventDefault(); event.stopPropagation();">
                                <input type="checkbox" data-product-id="${product.id}" onchange="toggleComparison(${product.id}, this.checked)" ${isCompared ? "checked" : ""} />
                                Compare
                            </label>
                            <button class="add-to-cart-btn" data-product-id="${product.id}" onclick="event.preventDefault(); event.stopPropagation();">Add to Cart</button>
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
    bottom: 130px;
    right: 30px;
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
    parseFloat(document.getElementById("priceRange")?.value) || 200;

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
    priceRange.value = 200;
    priceValue.textContent = 200;
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
    { label: "Price", key: (item) => `$${item.price.toFixed(2)}` },
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
    `$${item.price.toFixed(2)}`,
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
    checkoutTotal.textContent = "0.00";
    return;
  }

  summaryContainer.innerHTML = cartState.items
    .map(
      (item) => `
        <div class="order-item" style="display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <span class="order-item-name" style="color: var(--text-white);">${item.name} x${item.quantity}</span>
            <span class="order-item-price" style="color: var(--text-white);">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `,
    )
    .join("");

  checkoutTotal.textContent = cartState.total.toFixed(2);
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
  // Keep UX simple — programmatic redirect
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
    showNotification("Tech core — quick demo Ai is coming soon");
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

