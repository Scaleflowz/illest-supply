// ═══════════════════════════════════════════════
// THE ILLEST SUPPLY — GLOBAL CART ENGINE v1.0
// ═══════════════════════════════════════════════

const CART_KEY = 'illest_cart';
const FREE_SHIP_THRESHOLD = 150;
const SHIP_COST = 9.99;
const TAX_RATE = 0.0875;

const Cart = {
  get() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  },
  save(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    Cart.updateBadge();
    Cart.renderDrawer();
  },
  add(product, size, qty = 1) {
    if (!size && product.type !== 'accessory') {
      Cart.flashMsg('Please select a size first.', 'warn');
      return false;
    }
    const items = Cart.get();
    const key = `${product.id}_${size}`;
    const existing = items.find(i => i.key === key);
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, 10);
    } else {
      items.push({
        key, id: product.id, name: product.name,
        price: product.price, size, qty,
        img: product.img, category: product.category
      });
    }
    Cart.save(items);
    Cart.flashMsg(`${product.name} added to cart ✓`, 'success');
    return true;
  },
  remove(key) {
    Cart.save(Cart.get().filter(i => i.key !== key));
  },
  updateQty(key, qty) {
    const items = Cart.get();
    const item = items.find(i => i.key === key);
    if (item) { item.qty = Math.max(1, Math.min(qty, 10)); Cart.save(items); }
  },
  clear() { localStorage.removeItem(CART_KEY); Cart.updateBadge(); Cart.renderDrawer(); },
  count() { return Cart.get().reduce((s, i) => s + i.qty, 0); },
  subtotal() { return Cart.get().reduce((s, i) => s + i.price * i.qty, 0); },
  shipping() { return Cart.subtotal() >= FREE_SHIP_THRESHOLD ? 0 : SHIP_COST; },
  tax() { return Cart.subtotal() * TAX_RATE; },
  total() { return Cart.subtotal() + Cart.shipping() + Cart.tax(); },

  updateBadge() {
    const c = Cart.count();
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = c;
      el.style.display = c > 0 ? 'flex' : 'none';
    });
  },

  openDrawer() {
    Cart.renderDrawer();
    const d = document.getElementById('cartDrawer');
    const ov = document.getElementById('cartOverlay');
    if (d) { d.classList.add('open'); }
    if (ov) { ov.classList.add('open'); }
    document.body.style.overflow = 'hidden';
  },
  closeDrawer() {
    const d = document.getElementById('cartDrawer');
    const ov = document.getElementById('cartOverlay');
    if (d) d.classList.remove('open');
    if (ov) ov.classList.remove('open');
    document.body.style.overflow = '';
  },

  renderDrawer() {
    const body = document.getElementById('cartDrawerBody');
    if (!body) return;
    const items = Cart.get();
    const sub = Cart.subtotal();
    const ship = Cart.shipping();
    const tax = Cart.tax();
    const total = Cart.total();

    if (items.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <div style="font-size:48px;margin-bottom:16px;">🛍️</div>
          <div style="font-size:16px;font-weight:700;margin-bottom:8px;">Your cart is empty</div>
          <div style="font-size:13px;color:#555;margin-bottom:24px;">Looks like you haven't added anything yet.</div>
          <a href="shop.html" onclick="Cart.closeDrawer()" class="cart-shop-btn">Shop New Arrivals</a>
        </div>`;
      return;
    }

    const freeShipLeft = FREE_SHIP_THRESHOLD - sub;
    const shipBar = freeShipLeft > 0
      ? `<div class="ship-progress-wrap"><div class="ship-progress-text">Add <strong>$${freeShipLeft.toFixed(2)}</strong> more for free shipping!</div><div class="ship-progress-bar"><div class="ship-progress-fill" style="width:${Math.min((sub/FREE_SHIP_THRESHOLD)*100,100)}%"></div></div></div>`
      : `<div class="ship-progress-wrap free"><div class="ship-progress-text">🎉 You've unlocked <strong>free shipping!</strong></div></div>`;

    body.innerHTML = `
      ${shipBar}
      <div class="cart-items">
        ${items.map(i => `
          <div class="cart-item">
            <img src="${i.img}" alt="${i.name}" class="cart-item-img">
            <div class="cart-item-info">
              <div class="cart-item-name">${i.name}</div>
              ${i.size ? `<div class="cart-item-size">Size: ${i.size}</div>` : ''}
              <div class="cart-item-price">$${(i.price * i.qty).toFixed(2)}</div>
              <div class="cart-item-controls">
                <button onclick="Cart.updateQty('${i.key}', ${i.qty - 1})" class="qty-btn">−</button>
                <span class="qty-val">${i.qty}</span>
                <button onclick="Cart.updateQty('${i.key}', ${i.qty + 1})" class="qty-btn">+</button>
                <button onclick="Cart.remove('${i.key}')" class="cart-remove">Remove</button>
              </div>
            </div>
          </div>`).join('')}
      </div>
      <div class="cart-summary">
        <div class="cart-row"><span>Subtotal</span><span>$${sub.toFixed(2)}</span></div>
        <div class="cart-row"><span>Shipping</span><span>${ship === 0 ? '<span style="color:#22c55e">FREE</span>' : '$' + ship.toFixed(2)}</span></div>
        <div class="cart-row"><span>Est. Tax</span><span>$${tax.toFixed(2)}</span></div>
        <div class="cart-row total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
      </div>
      <div class="cart-actions">
        <a href="checkout.html" class="cart-checkout-btn">Secure Checkout →</a>
        <a href="shop.html" onclick="Cart.closeDrawer()" class="cart-continue-btn">Continue Shopping</a>
      </div>`;
  },

  flashMsg(msg, type = 'success') {
    let toast = document.getElementById('cartToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cartToast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = `cart-toast ${type}`;
    toast.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:50px;font-size:13px;font-weight:600;z-index:9999;transition:opacity .3s;opacity:1;${type==='success'?'background:#22c55e;color:#000;':'background:#ef4444;color:#fff;'}`;
    clearTimeout(Cart._toastTimer);
    Cart._toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
  }
};

// Global cart UI HTML — inject into any page
function injectCartDrawer() {
  if (document.getElementById('cartDrawer')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div id="cartOverlay" onclick="Cart.closeDrawer()"></div>
    <div id="cartDrawer">
      <div class="cart-drawer-header">
        <span class="cart-drawer-title">Your Cart (<span id="cartDrawerCount">${Cart.count()}</span>)</span>
        <button onclick="Cart.closeDrawer()" class="cart-close-btn">✕</button>
      </div>
      <div id="cartDrawerBody"></div>
    </div>
  `);
}

// Standard nav HTML for all pages
function getNavHTML(activePage) {
  const count = Cart.count();
  return `
  <div id="announcement" style="background:#080808;border-bottom:1px solid rgba(255,255,255,0.05);overflow:hidden;position:relative;height:36px;">
    <div style="display:flex;width:max-content;animation:announceTicker 18s linear infinite;">
      <span style="white-space:nowrap;padding:9px 40px;font-size:11px;font-weight:700;letter-spacing:0.25em;color:#ffffff;text-transform:uppercase;">DRESS DIFFERENT</span><span style="padding:9px 0;font-size:11px;color:#c00;">·</span><span style="white-space:nowrap;padding:9px 40px;font-size:11px;font-weight:700;letter-spacing:0.25em;color:#ffffff;text-transform:uppercase;">STAY ILLEST</span><span style="padding:9px 0;font-size:11px;color:#c00;">·</span><span style="white-space:nowrap;padding:9px 40px;font-size:11px;font-weight:700;letter-spacing:0.25em;color:#ffffff;text-transform:uppercase;">DRESS DIFFERENT</span><span style="padding:9px 0;font-size:11px;color:#c00;">·</span><span style="white-space:nowrap;padding:9px 40px;font-size:11px;font-weight:700;letter-spacing:0.25em;color:#ffffff;text-transform:uppercase;">STAY ILLEST</span><span style="padding:9px 0;font-size:11px;color:#c00;">·</span><span style="white-space:nowrap;padding:9px 40px;font-size:11px;font-weight:700;letter-spacing:0.25em;color:#ffffff;text-transform:uppercase;">DRESS DIFFERENT</span><span style="padding:9px 0;font-size:11px;color:#c00;">·</span><span style="white-space:nowrap;padding:9px 40px;font-size:11px;font-weight:700;letter-spacing:0.25em;color:#ffffff;text-transform:uppercase;">STAY ILLEST</span><span style="padding:9px 0;font-size:11px;color:#c00;">·</span>
    </div>
  </div>
  <nav>
    <a href="index.html"><img class="nav-logo" src="https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/409f6a116_918D9A7E-D61E-4658-A7B6-5DF1F8B5AC78.png" alt="The Illest Supply"></a>
    <div class="nav-links">
      <a href="index.html" ${activePage==='home'?'class="active"':''}>Home</a>
      <a href="shop.html" ${activePage==='shop'?'class="active"':''}>Shop</a>
      <a href="reviews.html" ${activePage==='reviews'?'class="active"':''}>Reviews</a>
      <a href="faq.html" ${activePage==='faq'?'class="active"':''}>FAQ</a>
      <a href="size-chart.html" ${activePage==='size'?'class="active"':''}>Size Guide</a>
      <a href="about.html" ${activePage==='about'?'class="active"':''}>About</a>
      <a href="order-tracker.html" ${activePage==='track'?'class="active"':''}>Track Order</a>
    </div>
    <div class="nav-right">
      <button onclick="toggleSearch()" class="nav-icon-btn" title="Search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      </button>
      <a href="https://www.instagram.com/theillestsupply" target="_blank" class="nav-icon-btn" title="Instagram">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
      </a>
      <button onclick="Cart.openDrawer()" class="cart-icon-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span class="cart-badge" style="display:${count>0?'flex':'none'}">${count}</span>
      </button>
      <button class="nav-hamburger" onclick="toggleMobileMenu()" id="hamburger">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
  <div id="mobileMenu">
    <a href="index.html">Home</a>
    <a href="shop.html">Shop</a>
    <a href="reviews.html">Reviews</a>
    <a href="faq.html">FAQ</a>
    <a href="size-chart.html">Size Guide</a>
    <a href="about.html">About</a>
    <a href="contact.html">Contact</a>
    <a href="order-tracker.html">Track Order</a>
  </div>
  <div id="searchBar" style="display:none;">
    <input type="text" id="searchInput" placeholder="Search products..." onkeyup="handleSearch(event)">
    <button onclick="toggleSearch()">✕</button>
  </div>`;
}

function getFooterHTML() {
  return `
  <footer>
    <div class="footer-top">
      <div class="footer-brand">
        <img src="https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/409f6a116_918D9A7E-D61E-4658-A7B6-5DF1F8B5AC78.png" alt="The Illest Supply" style="height:52px;mix-blend-mode:screen;opacity:.8;">
        <p>Curated premium designer and streetwear pieces.</p>
        <div class="footer-trust">Premium Quality · Fast Shipping · Secure Checkout</div>
        <a href="https://www.instagram.com/theillestsupply" target="_blank" class="footer-ig">@theillestsupply</a>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">Shop</div>
        <a href="shop.html">New Arrivals</a>
        <a href="shop.html?cat=sneakers">Sneakers</a>
        <a href="shop.html?cat=slides">Slides</a>
        <a href="shop.html?cat=bottoms">Bottoms</a>
        <a href="shop.html?cat=accessories">Accessories</a>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">Support</div>
        <a href="contact.html">Contact</a>
        <a href="faq.html">FAQ</a>
        <a href="size-chart.html">Size Guide</a>
        <a href="shipping-policy.html">Shipping Policy</a>
        <a href="returns-policy.html">Returns Policy</a>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">Company</div>
        <a href="about.html">About</a>
        <a href="authentication.html">Authentication</a>
        <a href="reviews.html">Reviews</a>
        <a href="https://www.instagram.com/theillestsupply" target="_blank">Instagram</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 The Illest Supply. All rights reserved.</span>
      <span style="color:#333">The Illest Supply is an independent resale shop. Brand names describe items only.</span>
    </div>
  </footer>`;
}

function getGlobalCSS() {
  return `
    *{margin:0;padding:0;box-sizing:border-box;}
    body{background:#080808;color:#fff;font-family:'Inter',sans-serif;overflow-x:hidden;}
    a{text-decoration:none;color:inherit;}

    /* NAV */
    nav{display:flex;align-items:center;justify-content:space-between;padding:14px 40px;border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(8,8,8,0.97);position:sticky;top:36px;z-index:200;}
    #announcement{position:sticky;top:0;z-index:201;}
    .nav-logo{height:48px;object-fit:contain;animation:spinY 25s linear infinite;mix-blend-mode:screen;}
    @keyframes spinY{from{transform:rotateY(0deg);}to{transform:rotateY(360deg);}}
    @keyframes announceTicker{from{transform:translateX(0);}to{transform:translateX(-50%);}}
    .nav-links{display:flex;gap:24px;}
    .nav-links a{font-size:13px;color:rgba(255,255,255,0.6);letter-spacing:0.04em;transition:color .2s;font-weight:500;}
    .nav-links a:hover,.nav-links a.active{color:#fff;}
    .nav-right{display:flex;align-items:center;gap:12px;}
    .nav-icon-btn{background:none;border:none;color:#fff;cursor:pointer;padding:6px;opacity:.7;transition:opacity .2s;display:flex;align-items:center;}
    .nav-icon-btn:hover{opacity:1;}
    .cart-icon-btn{background:none;border:none;color:#fff;cursor:pointer;padding:6px;position:relative;display:flex;align-items:center;}
    .cart-badge{position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;width:18px;height:18px;border-radius:50%;align-items:center;justify-content:center;}
    .nav-hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:4px;}
    .nav-hamburger span{display:block;width:22px;height:2px;background:#fff;border-radius:2px;}
    #mobileMenu{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:#080808;z-index:500;flex-direction:column;align-items:center;justify-content:center;gap:28px;}
    #mobileMenu.open{display:flex;}
    #mobileMenu a{font-size:28px;font-weight:700;letter-spacing:0.04em;color:#fff;}
    #searchBar{position:fixed;top:0;left:0;right:0;background:#111;z-index:300;padding:14px 24px;display:flex;gap:12px;border-bottom:1px solid rgba(255,255,255,0.08);}
    #searchBar input{flex:1;background:transparent;border:none;color:#fff;font-size:16px;outline:none;}
    #searchBar button{background:none;border:none;color:#fff;font-size:18px;cursor:pointer;}

    /* CART DRAWER */
    #cartOverlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:599;opacity:0;pointer-events:none;transition:opacity .3s;}
    #cartOverlay.open{opacity:1;pointer-events:all;}
    #cartDrawer{position:fixed;top:0;right:-420px;width:420px;max-width:100vw;height:100vh;background:#0f0f0f;border-left:1px solid rgba(255,255,255,0.07);z-index:600;transition:right .35s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;overflow:hidden;}
    #cartDrawer.open{right:0;}
    .cart-drawer-header{padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
    .cart-drawer-title{font-size:15px;font-weight:700;letter-spacing:0.06em;}
    .cart-close-btn{background:none;border:none;color:#fff;font-size:18px;cursor:pointer;opacity:.6;padding:4px;}
    .cart-close-btn:hover{opacity:1;}
    #cartDrawerBody{flex:1;overflow-y:auto;padding:16px 24px;}
    .cart-empty{text-align:center;padding:60px 20px;}
    .cart-shop-btn{display:inline-block;padding:12px 28px;background:#fff;color:#000;border-radius:50px;font-size:13px;font-weight:700;letter-spacing:0.06em;}
    .ship-progress-wrap{background:#111;border-radius:10px;padding:12px 16px;margin-bottom:16px;border:1px solid rgba(255,255,255,0.05);}
    .ship-progress-wrap.free{border-color:rgba(34,197,94,0.2);background:rgba(34,197,94,0.05);}
    .ship-progress-text{font-size:12px;color:#888;margin-bottom:8px;}
    .ship-progress-bar{height:4px;background:#1f1f1f;border-radius:4px;overflow:hidden;}
    .ship-progress-fill{height:100%;background:#22c55e;border-radius:4px;transition:width .4s;}
    .cart-items{display:flex;flex-direction:column;gap:16px;margin-bottom:20px;}
    .cart-item{display:flex;gap:14px;}
    .cart-item-img{width:72px;height:72px;object-fit:cover;border-radius:10px;background:#151515;}
    .cart-item-info{flex:1;}
    .cart-item-name{font-size:13px;font-weight:600;margin-bottom:3px;}
    .cart-item-size{font-size:11px;color:#555;margin-bottom:4px;}
    .cart-item-price{font-size:14px;font-weight:700;margin-bottom:8px;}
    .cart-item-controls{display:flex;align-items:center;gap:10px;}
    .qty-btn{width:26px;height:26px;border-radius:50%;border:1px solid rgba(255,255,255,0.15);background:transparent;color:#fff;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
    .qty-val{font-size:13px;font-weight:600;min-width:20px;text-align:center;}
    .cart-remove{font-size:11px;color:#555;background:none;border:none;cursor:pointer;margin-left:auto;}
    .cart-remove:hover{color:#ef4444;}
    .cart-summary{border-top:1px solid rgba(255,255,255,0.06);padding-top:16px;margin-bottom:16px;}
    .cart-row{display:flex;justify-content:space-between;font-size:13px;color:#888;margin-bottom:8px;}
    .cart-row.total{font-size:15px;font-weight:700;color:#fff;margin-top:4px;}
    .cart-actions{display:flex;flex-direction:column;gap:10px;padding-bottom:24px;}
    .cart-checkout-btn{display:block;text-align:center;padding:15px;background:#fff;color:#000;border-radius:12px;font-size:14px;font-weight:700;letter-spacing:0.06em;}
    .cart-checkout-btn:hover{background:#e5e5e5;}
    .cart-continue-btn{display:block;text-align:center;padding:13px;border:1px solid rgba(255,255,255,0.12);color:#fff;border-radius:12px;font-size:13px;font-weight:600;letter-spacing:0.04em;}

    /* FOOTER */
    footer{background:#040404;border-top:1px solid rgba(255,255,255,0.05);margin-top:80px;}
    .footer-top{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;padding:60px 60px 40px;}
    .footer-brand p{font-size:13px;color:#444;margin-top:12px;line-height:1.6;max-width:240px;}
    .footer-trust{font-size:11px;letter-spacing:0.12em;color:#333;text-transform:uppercase;margin-top:10px;}
    .footer-ig{display:inline-block;margin-top:14px;font-size:12px;color:#555;letter-spacing:0.06em;}
    .footer-ig:hover{color:#fff;}
    .footer-col-title{font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#444;font-weight:600;margin-bottom:16px;}
    .footer-col{display:flex;flex-direction:column;gap:10px;}
    .footer-col a{font-size:13px;color:#3a3a3a;transition:color .2s;}
    .footer-col a:hover{color:#fff;}
    .footer-bottom{border-top:1px solid rgba(255,255,255,0.04);padding:20px 60px;display:flex;justify-content:space-between;font-size:12px;color:#2a2a2a;flex-wrap:wrap;gap:8px;}

    /* BUTTONS */
    .btn-primary{display:inline-block;padding:14px 32px;background:#fff;color:#000;border-radius:50px;font-size:13px;font-weight:700;letter-spacing:0.07em;cursor:pointer;border:none;transition:all .2s;}
    .btn-primary:hover{background:#e0e0e0;transform:translateY(-1px);}
    .btn-outline{display:inline-block;padding:13px 30px;border:1px solid rgba(255,255,255,0.2);color:#fff;border-radius:50px;font-size:13px;font-weight:600;letter-spacing:0.06em;cursor:pointer;background:transparent;transition:all .2s;}
    .btn-outline:hover{border-color:#fff;background:rgba(255,255,255,0.05);}
    .btn-red{background:#ef4444;color:#fff;}
    .btn-red:hover{background:#dc2626;}

    /* PRODUCT CARD */
    .product-card{background:#0e0e0e;border:1px solid rgba(255,255,255,0.05);border-radius:16px;overflow:hidden;transition:transform .2s,border-color .2s;cursor:pointer;}
    .product-card:hover{transform:translateY(-4px);border-color:rgba(255,255,255,0.12);}
    .product-img-wrap{position:relative;aspect-ratio:1;overflow:hidden;background:#0a0a0a;}
    .product-img-wrap img,.product-img-wrap video{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
    .product-card:hover .product-img-wrap img,.product-card:hover .product-img-wrap video{transform:scale(1.04);}
    .product-badge{position:absolute;top:10px;left:10px;z-index:2;display:flex;flex-direction:column;gap:5px;}
    .badge{font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:4px 10px;border-radius:50px;}
    .badge-new{background:#fff;color:#000;}
    .badge-hot{background:#ef4444;color:#fff;}
    .badge-auth{background:rgba(34,197,94,0.15);color:#22c55e;border:1px solid rgba(34,197,94,0.3);}
    .badge-low{background:rgba(234,179,8,0.15);color:#eab308;border:1px solid rgba(234,179,8,0.3);}
    .badge-sold{background:rgba(255,255,255,0.08);color:#555;}
    .sold-out-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:3;}
    .sold-out-tag{font-size:11px;font-weight:800;letter-spacing:0.2em;color:rgba(255,255,255,0.85);text-transform:uppercase;border:1px solid rgba(255,255,255,0.3);padding:6px 16px;border-radius:50px;backdrop-filter:blur(4px);}
    .product-info{padding:14px 16px 16px;}
    .product-name{font-size:13px;font-weight:600;margin-bottom:6px;letter-spacing:0.02em;}
    .price-row{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
    .price-current{font-size:16px;font-weight:700;}
    .price-original{font-size:12px;color:#333;text-decoration:line-through;}
    .price-save{font-size:10px;color:#22c55e;font-weight:600;}
    .sold-count{font-size:11px;color:#333;margin-bottom:10px;}
    .card-sizes{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px;}
    .csz{padding:5px 9px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:#888;font-size:11px;font-weight:600;cursor:pointer;transition:all .18s;}
    .csz:hover,.csz.selected{border-color:#fff;color:#fff;background:rgba(255,255,255,0.08);}
    .csz.oos{opacity:.25;cursor:not-allowed;pointer-events:none;}
    .card-actions{display:flex;gap:7px;}
    .card-atc{flex:1;padding:9px 0;background:#fff;color:#000;border:none;border-radius:8px;font-size:11px;font-weight:700;letter-spacing:0.07em;cursor:pointer;transition:background .2s;}
    .card-atc:hover{background:#e5e5e5;}
    .card-bn{padding:9px 14px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:#fff;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;transition:all .2s;}
    .card-bn:hover{border-color:#fff;background:rgba(255,255,255,0.05);}
    .card-atc.disabled,.card-bn.disabled{opacity:.3;cursor:not-allowed;}

    /* GRIDS */
    .products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;}
    .section-title{font-size:10px;letter-spacing:0.22em;color:#ef4444;text-transform:uppercase;font-weight:600;margin-bottom:6px;}
    .section-heading{font-family:'Bebas Neue',sans-serif;font-size:clamp(32px,4vw,52px);letter-spacing:0.02em;margin-bottom:24px;}
    .container{max-width:1200px;margin:0 auto;padding:0 40px;}
    section{padding:60px 0;}

    /* TRUST BAR */
    .trust-bar{display:flex;gap:32px;justify-content:center;flex-wrap:wrap;padding:20px 40px;background:rgba(255,255,255,0.02);border-top:1px solid rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.04);}
    .trust-item{display:flex;align-items:center;gap:8px;font-size:12px;color:#555;letter-spacing:0.06em;font-weight:600;}
    .trust-item svg{opacity:.4;}

    /* MOBILE */
    @media(max-width:768px){
      nav{padding:12px 16px;}
      .nav-links{display:none;}
      .nav-hamburger{display:flex;}
      .container{padding:0 16px;}
      .footer-top{grid-template-columns:1fr 1fr;gap:28px;padding:40px 20px 28px;}
      .footer-bottom{padding:16px 20px;flex-direction:column;}
      .products-grid{grid-template-columns:repeat(2,1fr);gap:12px;}
      .trust-bar{gap:16px;padding:14px 16px;}
    }
  `;
}

function toggleMobileMenu() {
  const m = document.getElementById('mobileMenu');
  if (m) m.classList.toggle('open');
}
function toggleSearch() {
  const s = document.getElementById('searchBar');
  if (s) {
    s.style.display = s.style.display === 'none' ? 'flex' : 'none';
    if (s.style.display === 'flex') document.getElementById('searchInput')?.focus();
  }
}
function handleSearch(e) {
  if (e.key === 'Enter') {
    const q = document.getElementById('searchInput')?.value;
    if (q) window.location.href = `shop.html?q=${encodeURIComponent(q)}`;
  }
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateBadge();
  injectCartDrawer();
  Cart.renderDrawer();
});
