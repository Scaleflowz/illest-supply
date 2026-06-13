// ── NAVIGATION ───────────────────────────────────────────────────────────
function goToProduct(id) {
  window.location.href = 'product.html?id=' + id;
}

// ── PRODUCT LOOKUP ────────────────────────────────────────────────────────
function getProduct(id) {
  id = parseInt(id);
  return PRODUCTS.find(function(p) { return p.id === id; }) || null;
}

function getProducts() {
  return PRODUCTS;
}

function getSavePercent(p) {
  if (!p.origPrice || p.origPrice <= p.price) return 0;
  return Math.round((1 - p.price / p.origPrice) * 100);
}


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
        // Parse sizes: support comma-separated OR space-separated, strip * separators
        const sizes = o.sizes
          ? (o.sizes.includes(',')
              ? o.sizes.split(',')
              : o.sizes.split(/[\s*]+/)
            ).map(s => s.replace(/\*/g,'').trim()).filter(Boolean)
          : [];
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
          isSoldOut: o.is_sold_out === true,
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

// ── SHARED CARD RENDERER ─────────────────────────────────────────────────
function renderProductCard(p) {
  const soldOut = p.isSoldOut || Object.values(p.stock||{}).every(v=>v===0);
  const imgHtml = p.img
    ? `<img src="${p.img}" alt="${p.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:12px 12px 0 0;">`
    : `<div style="width:100%;height:100%;background:#111;border-radius:12px 12px 0 0;display:flex;align-items:center;justify-content:center;font-size:48px;">👟</div>`;
  // Card media: show image if available, video only as fallback (no autoplay)
  let media;
  if (p.img || (p.imgs && p.imgs.length)) {
    // Has image — show image, add ▶ badge if video also exists
    media = `<div style="position:relative;width:100%;height:100%;">${imgHtml}${p.video ? '<div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,.65);border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:10px;pointer-events:none;">▶</div>' : ''}</div>`;
  } else if (p.video) {
    // No image — show video, play on hover
    media = `<div style="position:relative;width:100%;height:100%;"><video src="${p.video}" muted loop playsinline preload="metadata" style="width:100%;height:100%;object-fit:cover;border-radius:12px 12px 0 0;" onmouseenter="this.play()" onmouseleave="this.pause();this.currentTime=0;"></video><div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,.65);border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:10px;pointer-events:none;">▶</div></div>`;
  } else {
    media = imgHtml;
  }
  const badge = p.badges && p.badges.length
    ? `<span style="position:absolute;top:10px;left:10px;background:#111;border:1px solid rgba(255,255,255,.15);color:#fff;font-size:10px;font-weight:700;letter-spacing:.06em;padding:4px 8px;border-radius:20px;">${p.badges[0]==='HOT'?'🔥 HOT':p.badges[0]}</span>`
    : '';
  const soldOverlay = soldOut
    ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,.55);border-radius:12px 12px 0 0;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-size:13px;font-weight:700;letter-spacing:.08em;">SOLD OUT</span></div>`
    : '';
  const viewers = p.viewers || Math.floor(Math.random()*68)+8;
  const viewBadge = `<span style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.1);color:#fff;font-size:9px;font-weight:600;padding:3px 7px;border-radius:20px;">👁 ${viewers} viewing</span>`;
  const sale = p.origPrice && p.origPrice > p.price
    ? `<span style="font-size:11px;color:#22c55e;font-weight:700;margin-left:6px;">-${Math.round((1-p.price/p.origPrice)*100)}%</span>`
    : '';
  const btn = soldOut
    ? `<button disabled style="width:100%;padding:11px;background:#1a1a1a;color:#444;border:1px solid #222;border-radius:8px;font-size:12px;font-weight:700;cursor:not-allowed;letter-spacing:.06em;">SOLD OUT</button>`
    : `<button onclick="event.stopPropagation();goToProduct(${p.id})" style="width:100%;padding:11px;background:#fff;color:#000;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;letter-spacing:.06em;" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">SHOP NOW</button>`;
  return `<div onclick="${soldOut?'':('goToProduct('+p.id+')')}" style="background:#0d0d0d;border:1px solid rgba(255,255,255,.07);border-radius:12px;overflow:hidden;cursor:${soldOut?'default':'pointer'};transition:transform .2s,border-color .2s;" onmouseover="this.style.transform='translateY(-3px)';this.style.borderColor='rgba(255,255,255,.18)'" onmouseout="this.style.transform='';this.style.borderColor='rgba(255,255,255,.07)'">
    <div style="position:relative;aspect-ratio:1;overflow:hidden;">${media}${badge}${viewBadge}${soldOverlay}</div>
    <div style="padding:14px;">
      <div style="font-size:10px;color:#555;letter-spacing:.08em;text-transform:uppercase;margin-bottom:3px;">${p.brand||''}</div>
      <div style="font-size:15px;font-family:'Bebas Neue',sans-serif;letter-spacing:.05em;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div style="font-size:16px;font-weight:800;">$${p.price}${sale}</div>
        ${p.soldCount>0?`<div style="font-size:10px;color:#555;">${p.soldCount}+ sold</div>`:''}
      </div>
      <div style="margin-top:10px;">${btn}</div>
    </div>
  </div>`;
}
