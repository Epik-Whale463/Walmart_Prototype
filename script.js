// ===== Global State Management =====
const state = {
  cart: [],
  favorites: [],
  products: [],
  filters: {
    category: [],
    brand: [],
    priceRange: { min: 0, max: 1000 },
    rating: null
  },
  currentPage: 1,
  productsPerPage: 12,
  sortBy: 'featured'
};

// ===== Utility Functions =====
const utils = {
  formatPrice: (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  },

  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  showToast: (message, duration = 3000) => {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  },

  saveToLocalStorage: (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  },

  getFromLocalStorage: (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
};

// ===== Mock Data Generation =====
const mockData = {
  categories: [
    { id: 'electronics', name: 'Electronics', image: 'https://via.placeholder.com/200x150', count: 1250 },
    { id: 'clothing', name: 'Clothing & Fashion', image: 'https://via.placeholder.com/200x150', count: 3420 },
    { id: 'home', name: 'Home & Garden', image: 'https://via.placeholder.com/200x150', count: 2180 },
    { id: 'sports', name: 'Sports & Outdoors', image: 'https://via.placeholder.com/200x150', count: 890 },
    { id: 'toys', name: 'Toys & Games', image: 'https://via.placeholder.com/200x150', count: 1560 },
    { id: 'books', name: 'Books & Media', image: 'https://via.placeholder.com/200x150', count: 4320 }
  ],

  brands: [
    'TechPro', 'StyleMax', 'HomeComfort', 'SportZone', 'FunPlay', 'BookWorld',
    'ElectroHub', 'FashionForward', 'GardenGrow', 'FitLife', 'GameMaster', 'ReadMore'
  ],

  generateProducts: (count = 50) => {
    const products = [];
    const productNames = {
      electronics: ['Smartphone', 'Laptop', 'Headphones', 'Smart Watch', 'Tablet', 'Camera'],
      clothing: ['T-Shirt', 'Jeans', 'Dress', 'Jacket', 'Sneakers', 'Handbag'],
      home: ['Sofa', 'Coffee Table', 'Lamp', 'Rug', 'Curtains', 'Vase'],
      sports: ['Yoga Mat', 'Dumbbells', 'Running Shoes', 'Bicycle', 'Tennis Racket', 'Basketball'],
      toys: ['LEGO Set', 'Board Game', 'Action Figure', 'Puzzle', 'Doll', 'RC Car'],
      books: ['Novel', 'Cookbook', 'Biography', 'Science Book', 'Art Book', 'Magazine']
    };

    for (let i = 0; i < count; i++) {
      const category = mockData.categories[Math.floor(Math.random() * mockData.categories.length)];
      const categoryProducts = productNames[category.id];
      const productName = categoryProducts[Math.floor(Math.random() * categoryProducts.length)];
      const brand = mockData.brands[Math.floor(Math.random() * mockData.brands.length)];
      const price = Math.floor(Math.random() * 900) + 10;
      const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 50) + 10 : 0;
      
      products.push({
        id: utils.generateId(),
        name: `${brand} ${productName}`,
        category: category.id,
        brand: brand,
        price: price,
        originalPrice: discount ? Math.floor(price * (1 + discount / 100)) : null,
        discount: discount,
        rating: Math.floor(Math.random() * 20 + 30) / 10,
        reviewCount: Math.floor(Math.random() * 500) + 10,
        image: `https://via.placeholder.com/300x300`,
        images: [
          `https://via.placeholder.com/600x600`,
          `https://via.placeholder.com/600x600`,
          `https://via.placeholder.com/600x600`
        ],
        description: `High-quality ${productName} from ${brand}. Perfect for your needs with excellent features and durability.`,
        inStock: Math.random() > 0.1,
        isNew: Math.random() > 0.8
      });
    }
    
    return products;
  }
};

// ===== DOM Elements =====
const elements = {
  searchForm: document.getElementById('searchForm'),
  searchInput: document.getElementById('searchInput'),
  searchSuggestions: document.getElementById('searchSuggestions'),
  mobileMenuToggle: document.querySelector('.mobile-menu-toggle'),
  mobileMenu: document.getElementById('mobileMenu'),
  closeMobileMenu: document.getElementById('closeMobileMenu'),
  departmentBtn: document.getElementById('departmentBtn'),
  megaMenu: document.getElementById('megaMenu'),
  cartBtn: document.getElementById('cartBtn'),
  cartDropdown: document.getElementById('cartDropdown'),
  closeCart: document.getElementById('closeCart'),
  cartItems: document.getElementById('cartItems'),
  cartCount: document.getElementById('cartCount'),
  cartTotal: document.getElementById('cartTotal'),
  favoritesBtn: document.getElementById('favoritesBtn'),
  favoritesCount: document.getElementById('favoritesCount'),
  categoryGrid: document.getElementById('categoryGrid'),
  productsGrid: document.getElementById('productsGrid'),
  loadMore: document.getElementById('loadMore'),
  sortSelect: document.getElementById('sortSelect'),
  clearFilters: document.getElementById('clearFilters'),
  quickViewModal: document.getElementById('quickViewModal'),
  closeQuickView: document.getElementById('closeQuickView'),
  newsletterForm: document.getElementById('newsletterForm'),
  toast: document.getElementById('toast')
};

// ===== Search Functionality =====
const searchModule = {
  trendingSearches: ['Summer Sale', 'Electronics', 'Fashion', 'Home Decor', 'Sports Equipment'],
  recentSearches: [],

  init() {
    this.loadRecentSearches();
    this.bindEvents();
    this.updateSuggestions();
  },

  bindEvents() {
    elements.searchInput.addEventListener('focus', () => this.showSuggestions());
    elements.searchInput.addEventListener('input', utils.debounce((e) => this.handleSearch(e), 300));
    elements.searchForm.addEventListener('submit', (e) => this.handleSubmit(e));
    
    document.addEventListener('click', (e) => {
      if (!elements.searchForm.contains(e.target)) {
        this.hideSuggestions();
      }
    });
  },

  showSuggestions() {
    elements.searchSuggestions.classList.add('active');
  },

  hideSuggestions() {
    elements.searchSuggestions.classList.remove('active');
  },

  handleSearch(e) {
    const query = e.target.value.trim();
    if (query.length > 2) {
      // In real app, this would fetch suggestions from API
      this.updateSuggestions(query);
    }
  },

  handleSubmit(e) {
    e.preventDefault();
    const query = elements.searchInput.value.trim();
    if (query) {
      this.addToRecentSearches(query);
      this.performSearch(query);
      this.hideSuggestions();
      elements.searchInput.blur();
    }
  },

  performSearch(query) {
    // Filter products based on search query
    const filteredProducts = state.products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase())
    );
    
    productsModule.renderProducts(filteredProducts);
    utils.showToast(`Found ${filteredProducts.length} results for "${query}"`);
  },

  addToRecentSearches(query) {
    this.recentSearches = [query, ...this.recentSearches.filter(s => s !== query)].slice(0, 5);
    utils.saveToLocalStorage('recentSearches', this.recentSearches);
    this.updateSuggestions();
  },

  loadRecentSearches() {
    this.recentSearches = utils.getFromLocalStorage('recentSearches') || [];
  },

  updateSuggestions(query = '') {
    const trendingList = document.getElementById('trendingSearches');
    const recentList = document.getElementById('recentSearches');
    
    // Update trending searches
    trendingList.innerHTML = this.trendingSearches
      .filter(search => search.toLowerCase().includes(query.toLowerCase()))
      .map(search => `<li onclick="searchModule.selectSuggestion('${search}')">${search}</li>`)
      .join('');
    
    // Update recent searches
    recentList.innerHTML = this.recentSearches.length > 0
      ? this.recentSearches
          .filter(search => search.toLowerCase().includes(query.toLowerCase()))
          .map(search => `<li onclick="searchModule.selectSuggestion('${search}')">${search}</li>`)
          .join('')
      : '<li style="color: var(--gray-500)">No recent searches</li>';
  },

  selectSuggestion(suggestion) {
    elements.searchInput.value = suggestion;
    this.handleSubmit(new Event('submit'));
  }
};

// ===== Cart Management =====
const cartModule = {
  init() {
    this.loadCart();
    this.updateCartUI();
    this.bindEvents();
  },

  bindEvents() {
    elements.cartBtn.addEventListener('click', () => this.toggleCart());
    elements.closeCart.addEventListener('click', () => this.closeCart());
    document.getElementById('viewCart').addEventListener('click', () => {
      this.closeCart();
      utils.showToast('Cart page would open here');
    });
  },

  loadCart() {
    state.cart = utils.getFromLocalStorage('cart') || [];
  },

  saveCart() {
    utils.saveToLocalStorage('cart', state.cart);
    this.updateCartUI();
  },

  addToCart(product, quantity = 1) {
    const existingItem = state.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      state.cart.push({
        ...product,
        quantity: quantity
      });
    }
    
    this.saveCart();
    utils.showToast(`${product.name} added to cart`);
    this.showCart();
  },

  removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    this.saveCart();
    utils.showToast('Item removed from cart');
  },

  updateQuantity(productId, quantity) {
    const item = state.cart.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCart();
    }
  },

  toggleCart() {
    elements.cartDropdown.classList.toggle('active');
    if (elements.cartDropdown.classList.contains('active')) {
      elements.mobileMenu.classList.remove('active');
    }
  },

  showCart() {
    elements.cartDropdown.classList.add('active');
  },

  closeCart() {
    elements.cartDropdown.classList.remove('active');
  },

  updateCartUI() {
    const cartCount = state.cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    elements.cartCount.textContent = cartCount;
    elements.cartTotal.textContent = utils.formatPrice(cartTotal);
    
    if (state.cart.length === 0) {
      elements.cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
      elements.cartItems.innerHTML = state.cart.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item-details">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-price">${utils.formatPrice(item.price)} × ${item.quantity}</div>
          </div>
          <button class="cart-item-remove" onclick="cartModule.removeFromCart('${item.id}')">×</button>
        </div>
      `).join('');
    }
  }
};

// ===== Favorites Management =====
const favoritesModule = {
  init() {
    this.loadFavorites();
    this.updateFavoritesUI();
  },

  loadFavorites() {
    state.favorites = utils.getFromLocalStorage('favorites') || [];
  },

  saveFavorites() {
    utils.saveToLocalStorage('favorites', state.favorites);
    this.updateFavoritesUI();
  },

  toggleFavorite(productId) {
    const index = state.favorites.indexOf(productId);
    if (index > -1) {
      state.favorites.splice(index, 1);
      utils.showToast('Removed from favorites');
    } else {
      state.favorites.push(productId);
      utils.showToast('Added to favorites');
    }
    this.saveFavorites();
    productsModule.updateFavoriteButtons();
  },

  isFavorite(productId) {
    return state.favorites.includes(productId);
  },

  updateFavoritesUI() {
    elements.favoritesCount.textContent = state.favorites.length;
  }
};

// ===== Products Module =====
const productsModule = {
  init() {
    this.loadProducts();
    this.renderCategories();
    this.renderFilters();
    this.bindEvents();
  },

  bindEvents() {
    elements.sortSelect.addEventListener('change', (e) => this.handleSort(e.target.value));
    elements.loadMore.addEventListener('click', () => this.loadMoreProducts());
    elements.clearFilters.addEventListener('click', () => this.clearAllFilters());
    
    // Category links
    document.querySelectorAll('[data-category]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.filterByCategory(e.target.dataset.category);
      });
    });
  },

  loadProducts() {
    state.products = mockData.generateProducts(50);
    this.renderProducts();
  },

  renderCategories() {
    elements.categoryGrid.innerHTML = mockData.categories.map(category => `
      <div class="category-card" onclick="productsModule.filterByCategory('${category.id}')">
        <img src="${category.image}" alt="${category.name}">
        <h3>${category.name}</h3>
      </div>
    `).join('');
  },

  renderFilters() {
    // Category filters
    const categoryFilters = document.getElementById('categoryFilters');
    categoryFilters.innerHTML = mockData.categories.map(category => `
      <label class="filter-option">
        <input type="checkbox" value="${category.id}" onchange="productsModule.handleCategoryFilter(this)">
        <span>${category.name}</span>
        <span class="filter-count">(${category.count})</span>
      </label>
    `).join('');
    
    // Brand filters
    const brandFilters = document.getElementById('brandFilters');
    brandFilters.innerHTML = mockData.brands.slice(0, 6).map(brand => `
      <label class="filter-option">
        <input type="checkbox" value="${brand}" onchange="productsModule.handleBrandFilter(this)">
        <span>${brand}</span>
      </label>
    `).join('');
    
    // Price range
    const priceRange = document.getElementById('priceRange');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    
    priceRange.addEventListener('input', (e) => {
      maxPrice.value = e.target.value;
      state.filters.priceRange.max = parseInt(e.target.value);
      this.applyFilters();
    });
    
    minPrice.addEventListener('change', (e) => {
      state.filters.priceRange.min = parseInt(e.target.value) || 0;
      this.applyFilters();
    });
    
    maxPrice.addEventListener('change', (e) => {
      state.filters.priceRange.max = parseInt(e.target.value) || 1000;
      priceRange.value = state.filters.priceRange.max;
      this.applyFilters();
    });
    
    // Rating filters
    document.querySelectorAll('input[name="rating"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        state.filters.rating = parseInt(e.target.value);
        this.applyFilters();
      });
    });
  },

  renderProducts(products = null) {
    const productsToRender = products || this.getFilteredProducts();
    const startIndex = 0;
    const endIndex = state.currentPage * state.productsPerPage;
    const visibleProducts = productsToRender.slice(startIndex, endIndex);
    
    if (visibleProducts.length === 0) {
      elements.productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--gray-500);">No products found</p>';
      elements.loadMore.style.display = 'none';
      return;
    }
    
    elements.productsGrid.innerHTML = visibleProducts.map(product => `
      <div class="product-card">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          ${product.isNew ? '<div class="product-badges"><span class="badge-new">New</span></div>' : ''}
          ${product.discount ? `<div class="product-badges"><span class="badge-sale">-${product.discount}%</span></div>` : ''}
          <button class="quick-view-btn" onclick="productsModule.showQuickView('${product.id}')">Quick View</button>
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <div class="product-rating">
            <div class="stars">
              ${this.renderStars(product.rating)}
            </div>
            <span class="rating-count">(${product.reviewCount})</span>
          </div>
          <div class="product-price">
            <span class="price-current">${utils.formatPrice(product.price)}</span>
            ${product.originalPrice ? `<span class="price-original">${utils.formatPrice(product.originalPrice)}</span>` : ''}
          </div>
          <div class="product-actions">
            <button class="btn btn-primary btn-add-to-cart" onclick="cartModule.addToCart(productsModule.getProduct('${product.id}'))">
              Add to Cart
            </button>
            <button class="btn-favorite ${favoritesModule.isFavorite(product.id) ? 'active' : ''}" 
                    onclick="favoritesModule.toggleFavorite('${product.id}')"
                    data-product-id="${product.id}">
              ${favoritesModule.isFavorite(product.id) ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      </div>
    `).join('');
    
    // Show/hide load more button
    elements.loadMore.style.display = endIndex < productsToRender.length ? 'inline-flex' : 'none';
  },

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return [
      ...Array(fullStars).fill('<span class="star">★</span>'),
      ...(hasHalfStar ? ['<span class="star">★</span>'] : []),
      ...Array(emptyStars).fill('<span class="star empty">☆</span>')
    ].join('');
  },

  getProduct(productId) {
    return state.products.find(p => p.id === productId);
  },

  getFilteredProducts() {
    return state.products.filter(product => {
      // Category filter
      if (state.filters.category.length > 0 && !state.filters.category.includes(product.category)) {
        return false;
      }
      
      // Brand filter
      if (state.filters.brand.length > 0 && !state.filters.brand.includes(product.brand)) {
        return false;
      }
      
      // Price filter
      if (product.price < state.filters.priceRange.min || product.price > state.filters.priceRange.max) {
        return false;
      }
      
      // Rating filter
      if (state.filters.rating && product.rating < state.filters.rating) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      switch (state.sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
  },

  handleCategoryFilter(checkbox) {
    if (checkbox.checked) {
      state.filters.category.push(checkbox.value);
    } else {
      state.filters.category = state.filters.category.filter(c => c !== checkbox.value);
    }
    this.applyFilters();
  },

  handleBrandFilter(checkbox) {
    if (checkbox.checked) {
      state.filters.brand.push(checkbox.value);
    } else {
      state.filters.brand = state.filters.brand.filter(b => b !== checkbox.value);
    }
    this.applyFilters();
  },

  handleSort(sortValue) {
    state.sortBy = sortValue;
    this.renderProducts();
  },

  filterByCategory(categoryId) {
    state.filters.category = [categoryId];
    this.updateFilterUI();
    this.applyFilters();
    window.scrollTo({ top: document.querySelector('.products-container').offsetTop - 100, behavior: 'smooth' });
  },

  applyFilters() {
    state.currentPage = 1;
    this.renderProducts();
    this.updateActiveFilters();
  },

  updateFilterUI() {
    // Update checkboxes
    document.querySelectorAll('#categoryFilters input').forEach(input => {
      input.checked = state.filters.category.includes(input.value);
    });
  },

  updateActiveFilters() {
    const activeFilters = document.getElementById('activeFilters');
    const filters = [];
    
    state.filters.category.forEach(cat => {
      const category = mockData.categories.find(c => c.id === cat);
      filters.push(`<span class="filter-tag">${category.name} <button onclick="productsModule.removeFilter('category', '${cat}')">×</button></span>`);
    });
    
    state.filters.brand.forEach(brand => {
      filters.push(`<span class="filter-tag">${brand} <button onclick="productsModule.removeFilter('brand', '${brand}')">×</button></span>`);
    });
    
    if (state.filters.rating) {
      filters.push(`<span class="filter-tag">${state.filters.rating}+ Stars <button onclick="productsModule.removeFilter('rating')">×</button></span>`);
    }
    
    activeFilters.innerHTML = filters.join('');
  },

  removeFilter(type, value) {
    if (type === 'category') {
      state.filters.category = state.filters.category.filter(c => c !== value);
    } else if (type === 'brand') {
      state.filters.brand = state.filters.brand.filter(b => b !== value);
    } else if (type === 'rating') {
      state.filters.rating = null;
      document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
    }
    
    this.updateFilterUI();
    this.applyFilters();
  },

  clearAllFilters() {
    state.filters = {
      category: [],
      brand: [],
      priceRange: { min: 0, max: 1000 },
      rating: null
    };
    
    // Reset UI
    document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
    document.getElementById('priceRange').value = 1000;
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    
    this.applyFilters();
  },

  loadMoreProducts() {
    state.currentPage++;
    this.renderProducts();
  },

  updateFavoriteButtons() {
    document.querySelectorAll('.btn-favorite').forEach(btn => {
      const productId = btn.dataset.productId;
      const isFavorite = favoritesModule.isFavorite(productId);
      btn.classList.toggle('active', isFavorite);
      btn.textContent = isFavorite ? '❤️' : '🤍';
    });
  },

  showQuickView(productId) {
    const product = this.getProduct(productId);
    const modal = elements.quickViewModal;
    const content = document.getElementById('quickViewContent');
    
    content.innerHTML = `
      <div class="quick-view-images">
        <img src="${product.images[0]}" alt="${product.name}" class="quick-view-main-image" id="mainImage">
        <div class="quick-view-thumbnails">
          ${product.images.map((img, index) => `
            <img src="${img}" alt="${product.name}" onclick="productsModule.changeQuickViewImage('${img}')">
          `).join('')}
        </div>
      </div>
      <div class="quick-view-details">
        <h2>${product.name}</h2>
        <div class="product-rating">
          <div class="stars">${this.renderStars(product.rating)}</div>
          <span class="rating-count">(${product.reviewCount} reviews)</span>
        </div>
        <div class="quick-view-price">
          ${utils.formatPrice(product.price)}
          ${product.originalPrice ? `<s style="color: var(--gray-500); font-size: var(--text-xl);">${utils.formatPrice(product.originalPrice)}</s>` : ''}
        </div>
        <p class="quick-view-description">${product.description}</p>
        <div class="quick-view-actions">
          <button class="btn btn-primary" onclick="cartModule.addToCart(productsModule.getProduct('${product.id}')); productsModule.closeQuickView();">
            Add to Cart
          </button>
          <button class="btn btn-secondary" onclick="favoritesModule.toggleFavorite('${product.id}'); productsModule.updateFavoriteButtons();">
            ${favoritesModule.isFavorite(product.id) ? 'Remove from' : 'Add to'} Favorites
          </button>
        </div>
      </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  changeQuickViewImage(imageSrc) {
    document.getElementById('mainImage').src = imageSrc;
  },

  closeQuickView() {
    elements.quickViewModal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// ===== Navigation Module =====
const navigationModule = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Mobile menu
    elements.mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
    elements.closeMobileMenu.addEventListener('click', () => this.closeMobileMenu());
    
    // Mega menu
    elements.departmentBtn.addEventListener('click', () => this.toggleMegaMenu());
    
    // Close menus on outside click
    document.addEventListener('click', (e) => {
      if (!elements.departmentBtn.contains(e.target) && !elements.megaMenu.contains(e.target)) {
        this.closeMegaMenu();
      }
    });
    
    // Close mobile menu on link click
    document.querySelectorAll('.mobile-nav a').forEach(link => {
      link.addEventListener('click', () => this.closeMobileMenu());
    });
  },

  toggleMobileMenu() {
    elements.mobileMenu.classList.toggle('active');
    document.body.style.overflow = elements.mobileMenu.classList.contains('active') ? 'hidden' : '';
  },

  closeMobileMenu() {
    elements.mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  },

  toggleMegaMenu() {
    elements.megaMenu.classList.toggle('active');
  },

  closeMegaMenu() {
    elements.megaMenu.classList.remove('active');
  }
};

// ===== Newsletter Module =====
const newsletterModule = {
  init() {
    elements.newsletterForm.addEventListener('submit', (e) => this.handleSubmit(e));
  },

  handleSubmit(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    // In real app, this would send to API
    utils.showToast(`Thank you for subscribing with ${email}!`);
    e.target.reset();
  }
};

// ===== Toast Module =====
const toastModule = {
  init() {
    const toastClose = elements.toast.querySelector('.toast-close');
    toastClose.addEventListener('click', () => {
      elements.toast.classList.remove('show');
    });
  }
};

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules
  searchModule.init();
  cartModule.init();
  favoritesModule.init();
  productsModule.init();
  navigationModule.init();
  newsletterModule.init();
  toastModule.init();
  
  // Close quick view modal
  elements.closeQuickView.addEventListener('click', () => productsModule.closeQuickView());
  elements.quickViewModal.addEventListener('click', (e) => {
    if (e.target === elements.quickViewModal) {
      productsModule.closeQuickView();
    }
  });
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  
  // Show search on mobile
  const mobileSearchBtn = document.createElement('button');
  mobileSearchBtn.className = 'mobile-search-toggle';
  mobileSearchBtn.innerHTML = '🔍';
  mobileSearchBtn.style.cssText = `
    display: none;
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 56px;
    height: 56px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 24px;
    box-shadow: var(--shadow-lg);
    z-index: 100;
    cursor: pointer;
  `;
  
  if (window.innerWidth <= 768) {
    mobileSearchBtn.style.display = 'flex';
    mobileSearchBtn.style.alignItems = 'center';
    mobileSearchBtn.style.justifyContent = 'center';
  }
  
  mobileSearchBtn.addEventListener('click', () => {
    const searchContainer = document.querySelector('.search-container');
    searchContainer.style.cssText = `
      display: block;
      position: fixed;
      top: 20px;
      left: 20px;
      right: 20px;
      z-index: 1100;
    `;
    elements.searchInput.focus();
    
    const closeSearch = () => {
      searchContainer.style = '';
      document.removeEventListener('click', handleOutsideClick);
    };
    
    const handleOutsideClick = (e) => {
      if (!searchContainer.contains(e.target) && e.target !== mobileSearchBtn) {
        closeSearch();
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 100);
  });
  
  document.body.appendChild(mobileSearchBtn);
  
  // Handle responsive changes
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 768) {
        navigationModule.closeMobileMenu();
        cartModule.closeCart();
        mobileSearchBtn.style.display = 'none';
        document.querySelector('.search-container').style = '';
      } else {
        mobileSearchBtn.style.display = 'flex';
        mobileSearchBtn.style.alignItems = 'center';
        mobileSearchBtn.style.justifyContent = 'center';
      }
    }, 250);
  });
  
  // Lazy loading for images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });
    
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img);
    });
  }
  
  console.log('ShopHub E-commerce initialized successfully!');
});
