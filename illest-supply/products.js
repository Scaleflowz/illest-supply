// THE ILLEST SUPPLY — PRODUCT CATALOG v4
// DB-driven only. No hardcoded products.
// Last cleared: 2026-06-10

const PRODUCTS = [];

const API = 'https://superagent-bc2ec54c.base44.app/functions/adminApi';
let _productsReady = false;
let _productsReadyCallbacks = [];

function onProductsReady(cb) {
  if (_productsReady) { cb(PRODUCTS); return; }
  _productsReadyCallbacks.push(cb);
}

async function loadProductOverrides() {
  try {
    const res = await fetch(API + '?action=getProductOverrides&_=' + Date.now());
    const overrides = await res.json();
    if (!Array.isArray(overrides)) throw new Error('bad response');

    PRODUCTS.length = 0;

    overrides
      .filter(o => o.product_name && !o.is_hidden)
      .forEach(o => {
        const sizes = o.sizes ? o.sizes.split(',').map(s => s.trim()).filter(Boolean) : [];
        const imgs = o.imgs ? o.imgs.split(',').map(s => s.trim()).filter(Boolean) : [];
        if (o.img && !imgs.includes(o.img)) imgs.unshift(o.img);
        const badges = o.badges ? o.badges.split(',').map(b => b.trim()).filter(Boolean) : [];

        PRODUCTS.push({
          id: o.product_id,
          _recordId: o.id,
          name: o.product_name,
          slug: o.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          price: o.price || 0,
          origPrice: o.orig_price || 0,
          category: o.category || 'sneakers',
          brand: o.brand || '',
          condition: o.condition || 'Brand New',
          isNewArrival: o.is_new_arrival || false,
          isBestSeller: o.is_best_seller || false,
          isSoldOut: o.is_sold_out || false,
          badges: badges,
          soldCount: o.sold_count || 0,
          sold: o.sold_count || 0,
          desc: (() => { try { return JSON.parse(o.desc || '{}').desc || o.desc || ''; } catch(e) { return o.desc || ''; } })(),
          sizes: sizes,
          stock: sizes.reduce((acc, s) => { acc[s] = o.is_sold_out ? 0 : 1; return acc; }, {}),
          img: o.img || '',
          imgs: imgs,
          video: o.video || '',
          type: o.category === 'bottoms' ? 'clothing' : 'shoe',
          viewers: Math.floor(Math.random() * 68) + 8,
        });
      });

  } catch(e) {
    console.warn('Could not load product overrides:', e);
  }

  _productsReady = true;
  _productsReadyCallbacks.forEach(cb => cb(PRODUCTS));
  _productsReadyCallbacks = [];
}

loadProductOverrides();
