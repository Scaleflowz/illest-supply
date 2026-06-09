// ═══════════════════════════════════════════════
// THE ILLEST SUPPLY — PRODUCT CATALOG
// ═══════════════════════════════════════════════

const PRODUCTS = [
  {
    id: 1, name: "Balenciaga Slides", slug: "balenciaga-slides",
    price: 89, origPrice: 145, category: "slides", brand: "Balenciaga",
    condition: "Brand New / Deadstock", isNewArrival: false, isBestSeller: true, isSoldOut: false,
    badges: ["AUTH", "HOT"],
    desc: "Iconic Balenciaga pool slides. Clean colorway, premium rubber sole. Deadstock condition.",
    sizes: ["6","7","8","9","10","11","12","13"],
    stock: {"6":2,"7":3,"8":4,"9":3,"10":2,"11":1,"12":0,"13":0},
    img: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/05a792aed_AdobeExpress-file.png",
    imgs: ["https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/05a792aed_AdobeExpress-file.png"],
    video: null, type: "shoe", sold: 89
  },
  {
    id: 2, name: "Prada Cup (Black)", slug: "prada-cup-black",
    price: 95, origPrice: 165, category: "sneakers", brand: "Prada",
    condition: "Brand New", isNewArrival: false, isBestSeller: true, isSoldOut: false,
    badges: ["AUTH", "HOT"],
    desc: "Prada Cup sneaker in classic black. Lightweight sole, premium leather upper.",
    sizes: ["7","8","9","10","11","12"],
    stock: {"7":2,"8":3,"9":2,"10":3,"11":1,"12":1},
    img: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/ab18f8c12_CBA80A5F-97CF-45C5-AA11-522922875DE3.png",
    imgs: ["https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/ab18f8c12_CBA80A5F-97CF-45C5-AA11-522922875DE3.png"],
    video: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/d411fd6a5_IMG_3816.mov", type: "shoe", sold: 54
  },
  {
    id: 3, name: "Prada Cup (Blue)", slug: "prada-cup-blue",
    price: 95, origPrice: 165, category: "sneakers", brand: "Prada",
    condition: "Brand New", isNewArrival: false, isBestSeller: false, isSoldOut: false,
    badges: ["AUTH", "NEW"],
    desc: "Prada Cup in ocean blue. Clean colorway for premium everyday wear.",
    sizes: ["7","8","9","10","11","12"],
    stock: {"7":1,"8":2,"9":3,"10":2,"11":2,"12":1},
    img: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/eac22a547_FF86E6B6-910B-416D-8894-171D71295C5C.png",
    imgs: ["https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/eac22a547_FF86E6B6-910B-416D-8894-171D71295C5C.png"],
    video: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/5b35fc966_IMG_3817.mov", type: "shoe", sold: 47
  },
  {
    id: 4, name: "Dior Slides", slug: "dior-slides",
    price: 120, origPrice: 195, category: "slides", brand: "Dior",
    condition: "Brand New / Deadstock", isNewArrival: true, isBestSeller: true, isSoldOut: false,
    badges: ["AUTH", "NEW", "HOT"],
    desc: "Dior Aqua slides — the silhouette of the season. Premium rubber, clean Dior branding.",
    sizes: ["6","7","8","9","10","11","12"],
    stock: {"6":1,"7":3,"8":4,"9":3,"10":2,"11":1,"12":1},
    img: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/e6a45f9dd_FEF16C09-1B37-4184-95F3-F18D4A350911.png",
    imgs: ["https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/e6a45f9dd_FEF16C09-1B37-4184-95F3-F18D4A350911.png"],
    video: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/3852cb545_IMG_3818.mov", type: "shoe", sold: 76
  },
  {
    id: 5, name: "Vale Forever College Jorts", slug: "vale-forever-college-jorts",
    price: 64.99, origPrice: 95, category: "bottoms", brand: "Vale Forever",
    condition: "Brand New", isNewArrival: false, isBestSeller: false, isSoldOut: true,
    badges: ["SOLD"],
    desc: "Vale Forever college jorts. Limited run streetwear piece.",
    sizes: ["S","M","L","XL"],
    stock: {"S":0,"M":0,"L":0,"XL":0},
    img: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/f4b027634_74A998F7-E15E-4E87-8A68-5C2D9880512F.png",
    imgs: ["https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/f4b027634_74A998F7-E15E-4E87-8A68-5C2D9880512F.png"],
    video: null, type: "short", sold: 35
  },
  {
    id: 6, name: "Vale Forever Jorts", slug: "vale-forever-jorts",
    price: 69.99, origPrice: 105, category: "bottoms", brand: "Vale Forever",
    condition: "Brand New", isNewArrival: false, isBestSeller: false, isSoldOut: true,
    badges: ["SOLD"],
    desc: "Vale Forever signature denim shorts. Heavy wash, premium cut.",
    sizes: ["S","M","L","XL"],
    stock: {"S":0,"M":0,"L":0,"XL":0},
    img: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/6b287f63d_AA36F7DE-F3CD-47CF-BAFB-FEE327EF145A.png",
    imgs: ["https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/6b287f63d_AA36F7DE-F3CD-47CF-BAFB-FEE327EF145A.png"],
    video: null, type: "short", sold: 42
  },
  {
    id: 7, name: "Vale Forever Jorts (Rhinestone)", slug: "vale-forever-jorts-rhinestone",
    price: 79.99, origPrice: 120, category: "bottoms", brand: "Vale Forever",
    condition: "Brand New", isNewArrival: false, isBestSeller: false, isSoldOut: true,
    badges: ["SOLD"],
    desc: "Limited rhinestone edition Vale Forever shorts.",
    sizes: ["S","M","L","XL"],
    stock: {"S":0,"M":0,"L":0,"XL":0},
    img: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/effd672da_F748D361-0A5E-4D84-B7CE-21A80BF31A03.png",
    imgs: ["https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/effd672da_F748D361-0A5E-4D84-B7CE-21A80BF31A03.png"],
    video: null, type: "short", sold: 28
  },
  {
    id: 8, name: "Vale Forever Bad Dreams Jorts", slug: "vale-forever-bad-dreams-jorts",
    price: 79.99, origPrice: 120, category: "bottoms", brand: "Vale Forever",
    condition: "Brand New", isNewArrival: false, isBestSeller: false, isSoldOut: true,
    badges: ["SOLD"],
    desc: "Vale Forever Bad Dreams limited edition denim shorts.",
    sizes: ["S","M","L","XL"],
    stock: {"S":0,"M":0,"L":0,"XL":0},
    img: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/607e2c691_CF43C058-BCF4-41FB-963A-95E3D9C3D886.png",
    imgs: ["https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/607e2c691_CF43C058-BCF4-41FB-963A-95E3D9C3D886.png"],
    video: null, type: "short", sold: 19
  },
  {
    id: 9, name: "Asics Gel Kayano 14 Pink Glow", slug: "asics-gel-kayano-14-pink-glow",
    price: 110, origPrice: 175, category: "sneakers", brand: "Asics",
    condition: "Brand New / Deadstock", isNewArrival: true, isBestSeller: true, isSoldOut: false,
    badges: ["AUTH", "NEW", "HOT"],
    desc: "Asics Gel Kayano 14 in the rare Pink Glow colorway. Chunky 90s silhouette. All sizes verified.",
    sizes: ["6","7","8","9","10","11","12"],
    stock: {"6":1,"7":2,"8":3,"9":3,"10":2,"11":2,"12":1},
    img: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/e6282f07d_918D9A7E-D61E-4658-A7B6-5DF1F8B5AC78.png",
    imgs: [
      "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/e6282f07d_918D9A7E-D61E-4658-A7B6-5DF1F8B5AC78.png",
      "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/409f6a116_918D9A7E-D61E-4658-A7B6-5DF1F8B5AC78.png"
    ],
    video: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/5dd2172fc_IMG_3820.mov", type: "shoe", sold: 112
  },
  {
    id: 10, name: "Rick Owens Ramones", slug: "rick-owens-ramones",
    price: 150, origPrice: 245, category: "sneakers", brand: "Rick Owens",
    condition: "Brand New / Deadstock", isNewArrival: true, isBestSeller: true, isSoldOut: false,
    badges: ["AUTH", "NEW"],
    desc: "Rick Owens Ramones low in white canvas. Signature geobasket sole. Luxury streetwear staple.",
    sizes: ["7","8","9","10","11","12"],
    stock: {"7":1,"8":2,"9":2,"10":3,"11":2,"12":1},
    img: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/3dd13263d_AdobeExpress-file3.png",
    imgs: ["https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/3dd13263d_AdobeExpress-file3.png"],
    video: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/888b8f45f_IMG_3821.mov", type: "shoe", sold: 63
  },
  {
    id: 11, name: "Bottega Veneta (Green)", slug: "bottega-veneta-green",
    price: 150, origPrice: 240, category: "sneakers", brand: "Bottega Veneta",
    condition: "Brand New / Deadstock", isNewArrival: true, isBestSeller: false, isSoldOut: false,
    badges: ["AUTH", "NEW", "LOW"],
    desc: "Bottega Veneta Speedster sneaker in forest green. Woven leather upper. Limited stock.",
    sizes: ["7","8","9","10","11"],
    stock: {"7":1,"8":1,"9":2,"10":1,"11":1},
    img: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/040af7300_AdobeExpress-file3.png",
    imgs: ["https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/040af7300_AdobeExpress-file3.png"],
    video: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/7099759ef_IMG_3824.mov", type: "shoe", sold: 58
  },
  {
    id: 12, name: "Bottega Veneta (Blue)", slug: "bottega-veneta-blue",
    price: 150, origPrice: 240, category: "sneakers", brand: "Bottega Veneta",
    condition: "Brand New / Deadstock", isNewArrival: true, isBestSeller: false, isSoldOut: false,
    badges: ["AUTH", "NEW"],
    desc: "Bottega Veneta in cobalt blue. Clean and rare.",
    sizes: ["7","8","9","10","11"],
    stock: {"7":1,"8":2,"9":2,"10":1,"11":1},
    img: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/35ae1e2e5_AdobeExpress-file.png",
    imgs: ["https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/35ae1e2e5_AdobeExpress-file.png"],
    video: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/9874363bd_IMG_3823.mov", type: "shoe", sold: 71
  },
  {
    id: 13, name: "Bottega Veneta (Pink)", slug: "bottega-veneta-pink",
    price: 150, origPrice: 240, category: "sneakers", brand: "Bottega Veneta",
    condition: "Brand New / Deadstock", isNewArrival: true, isBestSeller: true, isSoldOut: false,
    badges: ["AUTH", "NEW", "HOT"],
    desc: "Bottega Veneta in dusty rose/pink. The hardest colorway to find. Limited pairs.",
    sizes: ["7","8","9","10","11"],
    stock: {"7":1,"8":1,"9":1,"10":1,"11":1},
    img: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/ab18f8c12_CBA80A5F-97CF-45C5-AA11-522922875DE3.png",
    imgs: ["https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/ab18f8c12_CBA80A5F-97CF-45C5-AA11-522922875DE3.png"],
    video: "https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/3852cb545_IMG_3818.mov", type: "shoe", sold: 77
  }
];

function getProduct(id) { return PRODUCTS.find(p => p.id === id); }
function getProductBySlug(slug) { return PRODUCTS.find(p => p.slug === slug); }
function getFeatured() { return PRODUCTS.filter(p => p.isBestSeller && !p.isSoldOut).slice(0, 8); }
function getNewArrivals() { return PRODUCTS.filter(p => p.isNewArrival).slice(0, 8); }
function getSavePercent(p) { return Math.round((1 - p.price/p.origPrice)*100); }

function renderProductCard(p, selectedSize = null) {
  const save = getSavePercent(p);
  let mediaHTML = p.video
    ? `<video src="${p.video}" autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;"></video>`
    : `<img src="${p.img}" alt="${p.name}" loading="lazy">`;

  const badgeMap = {AUTH:'badge-auth',HOT:'badge-hot',NEW:'badge-new',LOW:'badge-low',SOLD:'badge-sold'};
  const badgeLabels = {AUTH:'Authenticated',HOT:'🔥 Hot',NEW:'New',LOW:'Low Stock',SOLD:'Sold Out'};
  const badgesHTML = (p.badges||[]).map(b=>`<span class="badge ${badgeMap[b]||''}">${badgeLabels[b]||b}</span>`).join('');

  let sizePills = '';
  if (p.sizes && p.sizes.length) {
    p.sizes.forEach(s => {
      const inStock = (p.stock[s]||0) > 0;
      const sel = s === selectedSize ? ' selected' : '';
      sizePills += `<button class="csz${inStock?'':' oos'}${sel}" onclick="event.stopPropagation();selectSize(${p.id},'${s}',this)" data-size="${s}">${s}</button>`;
    });
  }

  const soldOut = p.isSoldOut || Object.values(p.stock||{}).every(v=>v===0);
  const cardClass = soldOut ? ' is-sold-out' : '';

  return `
    <div class="product-card${cardClass}" data-id="${p.id}" onclick="${soldOut?'':'goToProduct('+p.id+')'}">
      <div class="product-img-wrap">
        ${mediaHTML}
        <div class="product-badge">${badgesHTML}</div>
        ${soldOut ? '<div class="sold-out-overlay"><div class="sold-out-tag">Sold Out</div></div>' : ''}
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="price-row">
          <span class="price-current">$${p.price}</span>
          <span class="price-original">$${p.origPrice}</span>
          <span class="price-save">-${save}%</span>
        </div>
        <div class="sold-count">${soldOut ? 'All pairs gone' : `${p.sold}+ sold`}</div>
        ${sizePills ? `<div class="card-sizes" id="cs${p.id}">${sizePills}</div>` : ''}
        <div class="card-actions">
          <button class="card-atc${soldOut?' disabled':''}" onclick="event.stopPropagation();addToCartFromCard(${p.id})" ${soldOut?'disabled':''}>
            ${soldOut ? 'Sold Out' : 'Add to Cart'}
          </button>
          <button class="card-bn${soldOut?' disabled':''}" onclick="event.stopPropagation();buyNowFromCard(${p.id})" ${soldOut?'disabled':''} title="Buy Now">
            ⚡
          </button>
        </div>
      </div>
    </div>`;
}

function selectSize(productId, size, btn) {
  const container = document.getElementById(`cs${productId}`);
  if (container) {
    container.querySelectorAll('.csz').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  }
}

function getSelectedSize(productId) {
  const container = document.getElementById(`cs${productId}`);
  if (!container) return null;
  const sel = container.querySelector('.csz.selected');
  return sel ? sel.dataset.size : null;
}

function addToCartFromCard(productId) {
  const p = getProduct(productId);
  if (!p) return;
  const size = getSelectedSize(productId);
  if (Cart.add(p, size)) Cart.openDrawer();
}

function buyNowFromCard(productId) {
  const p = getProduct(productId);
  if (!p) return;
  const size = getSelectedSize(productId);
  if (Cart.add(p, size)) window.location.href = 'checkout.html';
}

function goToProduct(id) {
  const p = getProduct(id);
  if (p) window.location.href = `product.html?id=${p.id}`;
}
