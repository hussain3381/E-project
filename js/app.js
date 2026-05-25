/* ===========================
   OceanGate App Logic
   Cart, comparison, checkout, search, and notifications
   =========================== */

const cartState = {
    items: [],
    total: 0,
    load() {
        try {
            const stored = JSON.parse(localStorage.getItem('oceangate_cart') || 'null');
            if (stored && Array.isArray(stored.items)) {
                this.items = stored.items;
                this.total = stored.total ?? this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
        localStorage.setItem('oceangate_cart', JSON.stringify({
            items: this.items,
            total: this.total
        }));
    },
    recalcTotal() {
        this.total = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    addItem(product) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.recalcTotal();
        this.save();
    },
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.recalcTotal();
        this.save();
    },
    clear() {
        this.items = [];
        this.total = 0;
        this.save();
    }
};

/* Comparison state management */
const comparisonState = {
    items: [],
    load() {
        try {
            const stored = JSON.parse(localStorage.getItem('oceangate_comparison') || 'null');
            this.items = stored && Array.isArray(stored.items) ? stored.items : [];
        } catch (error) {
            this.items = [];
        }
    },
    save() {
        localStorage.setItem('oceangate_comparison', JSON.stringify({ items: this.items }));
    },
    addItem(product) {
        if (!this.items.some(item => item.id === product.id)) {
            this.items.push({ ...product });
            this.save();
        }
    },
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
    },
    clear() {
        this.items = [];
        this.save();
    }
};

/* Product metadata for shop and search */
const productsDatabase = [
    {
        id: 1,
        name: 'Sony CD-R 80min',
        brand: 'sony',
        category: 'cd-r',
        price: 2.99,
        speed: '52',
        capacity: '700MB',
        image: '<i class="fas fa-compact-disc"></i>',
        specs: { readSpeed: '52X', writeSpeed: '52X', interface: 'Optical', type: 'CD-R', lifespan: '50+ Years' }
    },
    {
        id: 2,
        name: 'Verbatim DVD-RW 8.5GB',
        brand: 'verbatim',
        category: 'dvd-rw',
        price: 5.49,
        speed: '16',
        capacity: '8.5GB',
        image: '<i class="fas fa-circle"></i>',
        specs: { readSpeed: '16X', writeSpeed: '8X', interface: 'Optical', type: 'DVD-RW', lifespan: '50+ Years' }
    },
    {
        id: 3,
        name: 'Kingston SSD 512GB',
        brand: 'kingston',
        category: 'ssd',
        price: 49.99,
        speed: '570',
        capacity: '512GB',
        image: '<i class="fas fa-microchip"></i>',
        specs: { readSpeed: '570MB/s', writeSpeed: '550MB/s', interface: 'SATA III', type: 'SSD', lifespan: '3-5 Years*' }
    },
    {
        id: 4,
        name: 'Blu-ray BD-R 50GB',
        brand: 'sony',
        category: 'blu-ray',
        price: 12.99,
        speed: '10',
        capacity: '50GB',
        image: '<i class="fas fa-layer-group"></i>',
        specs: { readSpeed: '10X', writeSpeed: '10X', interface: 'Optical', type: 'Blu-ray', lifespan: '50+ Years' }
    },
    {
        id: 5,
        name: 'Samsung 860 EVO 1TB',
        brand: 'samsung',
        category: 'ssd',
        price: 89.99,
        speed: '550',
        capacity: '1TB',
        image: '<i class="fas fa-microchip"></i>',
        specs: { readSpeed: '550MB/s', writeSpeed: '520MB/s', interface: 'SATA III', type: 'SSD', lifespan: '4-6 Years*' }
    },
    {
        id: 6,
        name: 'Seagate 2TB HDD',
        brand: 'seagate',
        category: 'ssd',
        price: 69.99,
        speed: '150',
        capacity: '2TB',
        image: '<i class="fas fa-database"></i>',
        specs: { readSpeed: '150MB/s', writeSpeed: '150MB/s', interface: 'SATA III', type: 'HDD', lifespan: '5-7 Years*' }
    }
];

/* Page initialization and shared UI setup */
function initPage() {
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function () {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }

    const mobileNavLinks = document.querySelectorAll('.mobile-menu a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (menuBtn) menuBtn.classList.remove('active');
            if (mobileMenu) mobileMenu.classList.remove('active');
        });
    });

    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true, offset: 120 });
    }

    cartState.load();
    comparisonState.load();
    updateCartBadge();

    if (document.getElementById('productGrid')) {
        initializeShopPage();
    }

    // Initialize global search UI on every page (if present)
    initSearchUI();

    // Inject small floating tech widget
    injectTechWidget();

    if (document.getElementById('comparisonTableContainer')) {
        renderComparisonPage();
    }

    if (document.getElementById('checkoutForm')) {
        initCheckoutPage();
    }
}

document.addEventListener('DOMContentLoaded', initPage);

function updateCartBadge() {
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    const itemCount = cartState.items.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = itemCount;
}

function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (!drawer || !overlay) return;
    drawer.classList.toggle('active');
    overlay.classList.toggle('active');
}

function refreshCartDrawer() {
    const container = document.getElementById('cartItems');
    const totalElement = document.getElementById('cartTotal');
    if (!container || !totalElement) return;

    if (cartState.items.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px 20px;">Your cart is empty</p>';
        totalElement.textContent = '0.00';
        return;
    }

    container.innerHTML = cartState.items.map(item => `
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
    `).join('');

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
    const q = params.get('q');

    attachFilterListeners();

    if (q && q.trim().length) {
        const query = q.trim().toLowerCase();
        const matched = productsDatabase.filter(p => p.name.toLowerCase().includes(query));
        renderProducts(matched.length ? matched : productsDatabase);
        // if search input exists on shop page, prefill it for clarity
        const shopSearch = document.getElementById('globalSearchInput');
        if (shopSearch) shopSearch.value = q;
    } else {
        renderProducts(productsDatabase);
    }

    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', sortProducts);
    }
}

/* Create product cards for the shop page */
function renderProducts(products) {
    const grid = document.getElementById('productGrid');
    const productCount = document.getElementById('productCount');
    if (!grid) return;

    if (productCount) {
        productCount.textContent = products.length;
    }

    grid.innerHTML = products.map((product, index) => {
        const isCompared = comparisonState.items.some(item => item.id === product.id);
        return `
            <div class="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="${index * 60}">
                <article class="product-card">
                    <div class="product-card-image">
                        ${product.image}
                    </div>
                    <div class="product-card-body">
                        <h5>${product.name}</h5>
                        <div class="product-specs">
                            <span class="spec-badge">${product.speed}X</span>
                            <span class="spec-badge">${product.capacity}</span>
                        </div>
                        <div class="product-actions">
                            <label class="compare-switch">
                                <input type="checkbox" data-product-id="${product.id}" onchange="toggleComparison(${product.id}, this.checked)" ${isCompared ? 'checked' : ''} />
                                Compare
                            </label>
                            <button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
                        </div>
                    </div>
                </article>
            </div>
        `;
    }).join('');

    attachAddToCartListeners();
}

/* Shop page filter controls */
function attachFilterListeners() {
    document.querySelectorAll('.brand-filter, .category-filter, .speed-filter').forEach(input => {
        input.addEventListener('change', filterProducts);
    });

    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    if (priceRange && priceValue) {
        priceRange.addEventListener('input', () => {
            priceValue.textContent = priceRange.value;
            filterProducts();
        });
    }
}

function attachAddToCartListeners() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.removeEventListener('click', handleAddToCart);
        btn.addEventListener('click', handleAddToCart);
    });
}

function handleAddToCart(event) {
    const productId = parseInt(event.currentTarget.dataset.productId, 10);
    if (!Number.isNaN(productId)) {
        addToCart(productId);
    }
}

function addToCart(productId) {
    const product = productsDatabase.find(p => p.id === productId);
    if (product) {
        cartState.addItem(product);
        refreshCartDrawer();
        updateCartBadge();
        showNotification(`${product.name} added to cart`);
    }
}

function toggleComparison(productId, isChecked) {
    const product = productsDatabase.find(p => p.id === productId);
    if (!product) return;
    if (isChecked) {
        comparisonState.addItem(product);
    } else {
        comparisonState.removeItem(productId);
    }
    renderComparisonPage();
}

function filterProducts() {
    const brands = Array.from(document.querySelectorAll('.brand-filter:checked')).map(el => el.value);
    const categories = Array.from(document.querySelectorAll('.category-filter:checked')).map(el => el.value);
    const speeds = Array.from(document.querySelectorAll('.speed-filter:checked')).map(el => el.value);
    const maxPrice = parseFloat(document.getElementById('priceRange')?.value) || 200;

    const filtered = productsDatabase.filter(product => {
        const brandMatch = brands.length === 0 || brands.includes(product.brand);
        const categoryMatch = categories.length === 0 || categories.includes(product.category);
        const speedMatch = speeds.length === 0 || speeds.includes(product.speed);
        const priceMatch = product.price <= maxPrice;
        return brandMatch && categoryMatch && speedMatch && priceMatch;
    });

    renderProducts(filtered);
}

function resetFilters() {
    document.querySelectorAll('#shopPage input[type="checkbox"]').forEach(input => input.checked = false);
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    if (priceRange && priceValue) {
        priceRange.value = 200;
        priceValue.textContent = 200;
    }
    filterProducts();
}

function sortProducts() {
    const sortBy = document.getElementById('sortBy')?.value;
    let sorted = [...productsDatabase];

    if (sortBy === 'price-low') {
        sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
        sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popular') {
        sorted.sort((a, b) => b.id - a.id);
    } else {
        sorted.reverse();
    }

    renderProducts(sorted);
}

/* Generate the comparison table for selected products */
function renderComparisonPage() {
    const container = document.getElementById('comparisonTableContainer');
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

    const headings = comparisonState.items.map(product => `
        <th>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                <span><i class="fas fa-box-open" style="color: var(--primary-red); margin-right: 8px;"></i> ${product.name}</span>
                <button class="cart-remove-btn" onclick="removeFromComparison(${product.id})" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </th>
    `).join('');

    const rows = [
        { label: 'Price', key: item => `$${item.price.toFixed(2)}` },
        { label: 'Capacity', key: item => item.capacity },
        { label: 'Read Speed', key: item => item.specs.readSpeed },
        { label: 'Write Speed', key: item => item.specs.writeSpeed },
        { label: 'Interface', key: item => item.specs.interface },
        { label: 'Lifespan', key: item => item.specs.lifespan },
        { label: 'Type', key: item => item.specs.type },
        { label: 'Best For', key: item => item.category === 'ssd' ? 'Fast Compute' : 'Archival Backup' },
    ];

    const bodyRows = rows.map(row => `
        <tr>
            <td>${row.label}</td>
            ${comparisonState.items.map(item => `
                <td>${row.key(item)}</td>
            `).join('')}
        </tr>
    `).join('');

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
    document.querySelectorAll('.compare-switch input').forEach(input => {
        if (parseInt(input.dataset.productId, 10) === productId) {
            input.checked = false;
        }
    });
}

function clearComparison() {
    comparisonState.clear();
    renderComparisonPage();
    showNotification('Comparison list cleared');
}

function downloadComparison() {
    if (comparisonState.items.length === 0) {
        showNotification('No comparison data to export');
        return;
    }

    const headers = ['Name', 'Price', 'Capacity', 'Read Speed', 'Write Speed', 'Interface', 'Lifespan', 'Type'];
    const rows = comparisonState.items.map(item => [
        item.name,
        `$${item.price.toFixed(2)}`,
        item.capacity,
        item.specs.readSpeed,
        item.specs.writeSpeed,
        item.specs.interface,
        item.specs.lifespan,
        item.specs.type
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'oceangate_comparison.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Comparison exported as CSV');
}

/* Checkout page rendering and order flow */
function initCheckoutPage() {
    renderCheckoutSummary();
    attachCheckoutFormListener();
}

function renderCheckoutSummary() {
    const summaryContainer = document.getElementById('checkoutSummary');
    const checkoutTotal = document.getElementById('checkoutTotal');
    if (!summaryContainer || !checkoutTotal) return;

    if (cartState.items.length === 0) {
        summaryContainer.innerHTML = `
            <div style="color: var(--text-muted); text-align: center; padding: 40px 0;">
                <p>Your cart is empty.</p>
                <a href="shop.html" class="btn btn-red">Continue Shopping</a>
            </div>
        `;
        checkoutTotal.textContent = '0.00';
        return;
    }

    summaryContainer.innerHTML = cartState.items.map(item => `
        <div class="order-item" style="display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <span class="order-item-name" style="color: var(--text-white);">${item.name} x${item.quantity}</span>
            <span class="order-item-price" style="color: var(--text-white);">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    checkoutTotal.textContent = cartState.total.toFixed(2);
}

function attachCheckoutFormListener() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (validateCheckoutForm()) {
            processOrder();
        }
    });
}

function validateCheckoutForm() {
    const name = document.getElementById('fullName')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const address = document.getElementById('address')?.value.trim();
    const payment = document.querySelector('input[name="paymentMethod"]:checked')?.value;

    if (!name || !email || !address || !payment) {
        showNotification('Please complete all required fields');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address');
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
            name: document.getElementById('fullName')?.value || '',
            email: document.getElementById('email')?.value || '',
            address: document.getElementById('address')?.value || '',
            city: document.getElementById('city')?.value || '',
            postalCode: document.getElementById('postalCode')?.value || ''
        },
        payment: document.querySelector('input[name="paymentMethod"]:checked')?.value || ''
    };

    const orders = JSON.parse(localStorage.getItem('oceangate_orders') || '[]');
    orders.push(order);
    localStorage.setItem('oceangate_orders', JSON.stringify(orders));

    showOrderSuccessModal(order);
    cartState.clear();
    renderCheckoutSummary();
    updateCartBadge();
}

function showOrderSuccessModal(order) {
    const modal = document.createElement('div');
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
    document.getElementById('successContinueButton')?.addEventListener('click', () => {
        document.body.removeChild(modal);
        window.location.href = 'shop.html';
    });

    setTimeout(() => {
        if (document.body.contains(modal)) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        }
    }, 6000);
}

function closeSuccessModal() {
    const modal = document.getElementById('orderSuccessModal');
    if (!modal) return;
    modal.style.display = 'none';
}

/* Notification helper for user feedback */
function showNotification(message) {
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 3100; display: flex; flex-direction: column; gap: 12px;';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.style.cssText = `background: var(--primary-red); color: white; padding: 14px 20px; border-radius: 18px; box-shadow: 0 14px 40px rgba(255, 77, 77, 0.24); font-weight: 700; min-width: 240px; max-width: 320px; animation: slideInRight 0.3s ease;`;
    notification.textContent = message;
    container.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const utilStyle = document.createElement('style');
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
    const wrappers = document.querySelectorAll('.search-wrapper');
    if (!wrappers || wrappers.length === 0) return;

    wrappers.forEach(sw => {
        const trigger = sw.querySelector('.search-trigger');
        const expand = sw.querySelector('.search-expand');
        const input = sw.querySelector('.search-input');
        const panel = sw.querySelector('.suggestions-panel');

        if (!trigger || !input || !panel) return;

        trigger.addEventListener('click', (ev) => {
            ev.stopPropagation();
            sw.classList.toggle('open');
            if (sw.classList.contains('open')) {
                input.focus();
                expand.setAttribute('aria-hidden', 'false');
                panel.setAttribute('aria-hidden', 'false');
            } else {
                expand.setAttribute('aria-hidden', 'true');
                panel.setAttribute('aria-hidden', 'true');
                clearSuggestions(panel);
            }
        });

        // Live suggestions
        input.addEventListener('input', () => {
            const q = input.value.trim();
            if (q.length < 2) {
                clearSuggestions(panel);
                return;
            }
            const matches = productsDatabase.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
            showSuggestions(panel, matches, q);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const q = input.value.trim();
                if (q) goToShopWithQuery(q);
            }
            if (e.key === 'Escape') {
                sw.classList.remove('open');
                clearSuggestions(panel);
            }
        });

        panel.addEventListener('click', (e) => {
            const it = e.target.closest('.suggestion-item');
            if (!it) return;
            const q = it.dataset.q || it.textContent.trim();
            goToShopWithQuery(q);
        });

        // Close when clicking outside the control
        document.addEventListener('click', (e) => {
            if (!sw.contains(e.target)) {
                sw.classList.remove('open');
                clearSuggestions(panel);
            }
        });
    });
}

function showSuggestions(panel, items, query) {
    if (!panel) return;
    if (!items || items.length === 0) {
        panel.innerHTML = '<div style="padding:12px;color:var(--text-gray);">No results</div>';
        return;
    }

    panel.innerHTML = items.slice(0, 8).map(it => {
        const highlighted = it.name.replace(new RegExp(query, 'ig'), match => `<span class="match">${match}</span>`);
        return `<div class="suggestion-item" data-q="${it.name}"><div class="label">${highlighted}</div><div class="meta">${it.brand || ''}</div></div>`;
    }).join('');
}

function clearSuggestions(panel) { if (panel) panel.innerHTML = ''; }

function goToShopWithQuery(q) {
    // Keep UX simple — programmatic redirect
    const target = 'shop.html?q=' + encodeURIComponent(q);
    window.location.href = target;
}

/*
 * Floating tech widget (non-intrusive demo). Injected into the page.
 * Small, animated, and triggers a lightweight notification.
 */
function injectTechWidget() {
    if (document.querySelector('.tech-widget')) return;
    const w = document.createElement('div');
    w.className = 'tech-widget';
    w.innerHTML = '<div class="core">OG</div>'; // OG = OceanGate small badge
    w.addEventListener('click', () => {
        showNotification('Tech core — quick demo widget');
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
