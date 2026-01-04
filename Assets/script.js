// T-shirt and view selection functionality
let currentTshirt = '1';

// T-shirt selection
document.querySelectorAll('[data-tshirt]').forEach(thumb => {
    thumb.addEventListener('click', function() {
        // Remove active from all t-shirt thumbs
        document.querySelectorAll('[data-tshirt]').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        currentTshirt = this.dataset.tshirt;
        
        // Update main image
        document.getElementById('mainImage').src = `Assets/img/${currentTshirt}.jpg`;
        
        // Update view option images
        document.getElementById('frontImg').src = `Assets/img/${currentTshirt}.jpg`;
        document.getElementById('backImg').src = `Assets/img/${currentTshirt}-back.jpg`;
        document.getElementById('closeImg').src = `Assets/img/${currentTshirt}-close.jpg`;
        document.getElementById('modelImg').src = `Assets/img/${currentTshirt}-model.jpg`;
        
        // Reset to front view
        document.querySelectorAll('.view-thumb').forEach(v => v.classList.remove('active'));
        document.querySelector('[data-view="front"]').classList.add('active');
    });
});

// View selection (front, back, close, model)
document.querySelectorAll('[data-view]').forEach(viewThumb => {
    viewThumb.addEventListener('click', function() {
        // Remove active from all view thumbs
        document.querySelectorAll('.view-thumb').forEach(v => v.classList.remove('active'));
        this.classList.add('active');
        
        const view = this.dataset.view;
        let imageSrc;
        
        if (view === 'front') {
            imageSrc = `Assets/img/${currentTshirt}.jpg`;
        } else {
            imageSrc = `Assets/img/${currentTshirt}-${view}.jpg`;
        }
        
        // Update main image
        document.getElementById('mainImage').src = imageSrc;
    });
});

// Quantity controls
document.getElementById('incQty').addEventListener('click', function() {
    const qtyElement = document.getElementById('qtyNum');
    let qty = parseInt(qtyElement.textContent);
    qtyElement.textContent = qty + 1;
});

document.getElementById('decQty').addEventListener('click', function() {
    const qtyElement = document.getElementById('qtyNum');
    let qty = parseInt(qtyElement.textContent);
    if (qty > 1) {
        qtyElement.textContent = qty - 1;
    }
});


// Custom Alert System
function showCustomAlert(message, title = 'Alert', type = 'info') {
    // Remove existing alerts
    const existing = document.querySelector('.alert-overlay');
    if (existing) existing.remove();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'alert-overlay visible';

    // Create alert
    const alert = document.createElement('div');
    alert.className = 'custom-alert';
    alert.innerHTML = `
        <div class="alert-content">
            <div class="alert-title">${title}</div>
            <div class="alert-message">${message}</div>
        </div>
        <div class="alert-actions">
            <button class="alert-btn primary" onclick="closeCustomAlert()">OK</button>
        </div>
    `;

    overlay.appendChild(alert);
    document.body.appendChild(overlay);

    // Focus for accessibility
    alert.querySelector('.alert-btn').focus();

    // Close on ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeCustomAlert();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

function closeCustomAlert() {
    const overlay = document.querySelector('.alert-overlay');
    if (overlay) overlay.remove();
}

// Override default alert
const originalAlert = window.alert;
window.alert = function(message) {
    showCustomAlert(message);
};

const state = {
    title: 'Classic Premium T-Shirt',
    unitPrice: 1599,
    qty: 1,
    color: 'Black',
    size: 'M',
    style: 'Regular',
    items: []
};

// ---------- SELECTION LOGGING PATCH (paste after your `state` object) ----------
/* ensures state has selection fields */
state.selection = {
  size: state.size || 'M',
  fit: state.style || 'Regular',
  image: document.getElementById('mainImage') ? document.getElementById('mainImage').src : '',
  qty: state.qty || 1,
  price: state.unitPrice || 0
};

function sendOrderEmail(summary) {
  return emailjs.send("service_iuud3b3", "template_djkhsdl", {
    name: summary.name,
    email: summary.email,
    phone: summary.phone,
    address: summary.address,
    paymentMethod: summary.paymentMethod,
    total: summary.total,
    items: JSON.stringify(summary.items, null, 2),
    order_json: JSON.stringify(summary, null, 2),
    time: new Date().toLocaleString(),
    to_email: "YOUR_EMAIL_HERE"
  });
}



/* helper: prints current selection object to console */
function logSelection(context = '') {
  const sel = {
    size: state.selection.size,
    fit: state.selection.fit,
    image: state.selection.image,
    qty: state.selection.qty,
    price: state.selection.price
  };
  console.log('[Selection' + (context ? ' - ' + context : '') + ']', sel);
}

/* wire size options (if you already have attachOption, this is redundant — but safe) */
const sizeContainer = document.getElementById('sizeOpts');
if (sizeContainer) {
  sizeContainer.querySelectorAll('.opt').forEach(el => {
    el.addEventListener('click', () => {
      // update state.selection.size
      state.selection.size = el.getAttribute('data-value') || el.textContent.trim();
      state.size = state.selection.size; // keep legacy state in sync
      logSelection('size changed');
    });
  });
}

/* wire fit/style options */
const fitContainer = document.getElementById('styleOpts');
if (fitContainer) {
  fitContainer.querySelectorAll('.opt').forEach(el => {
    el.addEventListener('click', () => {
      state.selection.fit = el.getAttribute('data-value') || el.textContent.trim();
      state.style = state.selection.fit;
      logSelection('fit changed');
    });
  });
}

/* wire thumbnail clicks to update selected image */
const thumbs = document.querySelectorAll('.thumb');
thumbs.forEach(t => {
  t.addEventListener('click', (ev) => {
    const src = t.getAttribute('data-src') || (t.querySelector('img') && t.querySelector('img').src);
    if (src) {
      // update main image and state
      const mainImg = document.getElementById('mainImage') || document.getElementById('mainImg');
      if (mainImg) mainImg.src = src;
      state.selection.image = src;
      logSelection('image changed');
    }
  });
});

/* quantity changes should also update selection (if you have +/- controls) */
const incBtn = document.getElementById('incQty');
const decBtn = document.getElementById('decQty');
const qtyDisplay = document.getElementById('qtyNum') || document.getElementById('qty');

function syncQty() {
  // handle both select (#qty) and numeric display (#qtyNum)
  const qEl = document.getElementById('qty');
  let q = 1;
  if (qEl && qEl.tagName.toLowerCase() === 'select') q = parseInt(qEl.value, 10) || 1;
  else if (qtyDisplay) q = parseInt(qtyDisplay.textContent || qtyDisplay.value || 1, 10) || 1;
  state.selection.qty = q;
  state.qty = q;
  logSelection('qty changed');
}
if (incBtn) incBtn.addEventListener('click', () => { setTimeout(syncQty, 0); });
if (decBtn) decBtn.addEventListener('click', () => { setTimeout(syncQty, 0); });
const qtySelect = document.getElementById('qty');
if (qtySelect) qtySelect.addEventListener('change', syncQty);

/* make Add to cart & Buy now also print the selection (they already add to cart) */
const addBtn = document.getElementById('addCart') || document.querySelector('.add-btn');
if (addBtn) {
  addBtn.addEventListener('click', () => {
    // ensure qty synced immediately
    syncQty();
    logSelection('Add to Cart clicked');
  }, { capture: true });
}
// === Replace buyNow with a clean clone to remove old listeners ===
(function() {
  let buyBtn = document.getElementById('buyNow');
  if (!buyBtn) return;

  // clone to remove any old event listeners
  const clean = buyBtn.cloneNode(true);
  buyBtn.parentNode.replaceChild(clean, buyBtn);
  buyBtn = clean; // reassign to the fresh node

  // fresh handler — STOP propagation so no other listener runs
  buyBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation(); // critical: prevents delegated or parent listeners from firing

    // keep your original utilities
    try { if (typeof syncQty === 'function') syncQty(); } catch (err) {}
    try { if (typeof logSelection === 'function') logSelection('Buy Now clicked'); } catch (err) {}

    // build item safely (check ids used in your page)
    const mainImgEl = document.getElementById('mainImage') || document.getElementById('mainImg') || document.getElementById('mainImg') || document.querySelector('.thumb.active img');
    const mainImgSrc = mainImgEl ? (mainImgEl.src || mainImgEl.getAttribute('data-src') || '') : '';

    const item = {
      title: state.title || 'Premium T-Shirt',
      price: state.unitPrice || 1599,
      qty: state.qty || (state.selection?.qty || 1),
      color: state.color || state.selection?.color || '',
      size: state.size || state.selection?.size || '',
      style: state.style || state.selection?.fit || state.selection?.style || '',
      image: mainImgSrc
    };

    // push item to cart state
    state.items.push(item);

    // UI updates
    try { renderCart(); } catch (err) {}
    try { if (typeof updateCartBadge === 'function') updateCartBadge(); } catch (err) {}
    try { if (typeof positionCartDrawer === 'function') positionCartDrawer(); } catch (err) {}
    try { if (typeof openCart === 'function') openCart(); } catch (err) {}

    // accessibility focus
    try { cartDrawer && cartDrawer.focus && cartDrawer.focus(); } catch (err) {}

    // Done — intentionally DO NOT open checkout here
  }, { capture: true });
})();


// initial log (page load)
logSelection('initial');


// helpers
const money = n => '₹' + (n).toLocaleString('en-IN');

// thumbs click -> main image
document.querySelectorAll('.thumb').forEach(t => {
    t.addEventListener('click', e => {
        // update active
        document.querySelectorAll('.thumb').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        const src = t.getAttribute('data-src');
        document.getElementById('mainImage').src = src;
    });
});

// option selections
function attachOption(containerId, key) {
  const container = document.getElementById(containerId);
  if (!container) {
    // no element found — do nothing (prevents runtime error)
    console.warn(`attachOption: no element with id '${containerId}'`);
    return;
  }

  container.querySelectorAll('.opt').forEach(el => {
    el.addEventListener('click', () => {
      container.querySelectorAll('.opt').forEach(x => x.classList.remove('selected'));
      el.classList.add('selected');
      const v = el.getAttribute('data-value');
      state[key] = v;
      // if option carries an image, update main
      const img = el.getAttribute('data-image');
      if (img) document.getElementById('mainImage').src = img;
      refreshSummary();
    });
  });
}

// safe calls — if an id is missing, attachOption will return without breaking
attachOption('colorOpts','color');
attachOption('sizeOpts','size');
attachOption('styleOpts','style');


// qty controls
const qtyNum = document.getElementById('qtyNum');
document.getElementById('incQty').addEventListener('click', () => {
    state.qty = Math.min(10, state.qty + 1);
    qtyNum.textContent = state.qty;
    refreshSummary();
});
document.getElementById('decQty').addEventListener('click', () => {
    state.qty = Math.max(1, state.qty - 1);
    qtyNum.textContent = state.qty;
    refreshSummary();
});

// Add to cart
const cartDrawer = document.getElementById('cartDrawer');
const cartBody = document.getElementById('cartBody');
const subtotalEl = document.getElementById('subtotal');
function openCart() { cartDrawer.classList.add('visible'); cartDrawer.setAttribute('aria-hidden', 'false') }
function closeCart() { cartDrawer.classList.remove('visible'); cartDrawer.setAttribute('aria-hidden', 'true') }
document.getElementById('closeCart').addEventListener('click', closeCart);
document.getElementById('continueBtn').addEventListener('click', closeCart);

function renderCart() {
    cartBody.innerHTML = '';
    if (state.items.length === 0) {
        cartBody.innerHTML = '<div class="small" style="padding:8px;color:var(--muted)">Your cart is empty</div>';
        subtotalEl.textContent = money(0);
        document.getElementById('orderTotal').textContent = money(0);
        return;
    }
    let sum = 0;
    state.items.forEach((it, idx) => {
        sum += it.price * it.qty;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
  <img src="${it.image}" alt="">
  <div style="flex:1">
    <div style="font-weight:600">${it.title}</div>
    <div class="small" style="color:var(--muted)">
      ${it.color} • ${it.size} • ${it.style}
    </div>
    <div class="small">Qty ${it.qty}</div>
  </div>

  <div style="text-align:right; margin-right:8px;">
    <div style="font-weight:700">${money(it.price * it.qty)}</div>
  </div>

  <!-- NEW DELETE ICON -->
  <button class="del-btn" data-index="${idx}" aria-label="Remove item">
    ✕
  </button>
`;
        cartBody.appendChild(div);
    });
    subtotalEl.textContent = money(sum);
    document.getElementById('orderTotal').textContent = money(sum);
}

cartBody.addEventListener('click', function(e) {
  if (e.target.classList.contains('del-btn')) {
    e.stopPropagation();
    const index = e.target.getAttribute('data-index');
    state.items.splice(index, 1);   // remove item
    renderCart();                   // refresh cart
    updateCartBadge();              // update badge
  }
});


const cartBtn = document.getElementById('cartBtn');
const cartBadge = document.getElementById('cartBadge');
const headerEl = document.querySelector('header');

// Position the cart drawer below the header (handles responsive header height)
function positionCartDrawer() {
    const headerH = headerEl ? headerEl.getBoundingClientRect().height : 0;
    cartDrawer.style.top = (headerH + 12) + 'px';
    // keep the z-index high (CSS also sets this)
    cartDrawer.style.zIndex = 2200;
}
window.addEventListener('resize', positionCartDrawer);
window.addEventListener('load', positionCartDrawer);
// if logo image changes size after load, re-run
document.querySelectorAll('header img').forEach(img => img.addEventListener('load', positionCartDrawer));

// update badge whenever cart changes
function updateCartBadge() {
    const totalItems = state.items.reduce((s, it) => s + it.qty, 0);
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems ? 'inline-flex' : 'none';
}

// open/close cart drawer and toggle aria-expanded
function openCart() {
    cartDrawer.classList.add('visible');
    cartDrawer.setAttribute('aria-hidden', 'false');
    cartBtn.setAttribute('aria-expanded', 'true');
}
function closeCart() {
    cartDrawer.classList.remove('visible');
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartBtn.setAttribute('aria-expanded', 'false');
}

// wire button
cartBtn.addEventListener('click', () => {
    if (cartDrawer.classList.contains('visible')) closeCart();
    else {
        renderCart();      // make sure cart contents are up-to-date
        updateCartBadge();
        positionCartDrawer();
        openCart();
    }
});

// close drawer if click outside (optional but nice)
// Keep cart open while deleting items
window.addEventListener('click', (e) => {

  // If click is inside cart or cart button → DO NOTHING
  if (
    cartDrawer.contains(e.target) ||
    cartBtn.contains(e.target)
  ) return;

  // Otherwise, close
  if (cartDrawer.classList.contains('visible')) {
    closeCart();
  }
});


// whenever cart changes (you already call renderCart after add/remove)
// ensure renderCart calls updateCartBadge at the end:
const originalRenderCart = renderCart;
renderCart = function () {
    originalRenderCart();
    updateCartBadge();
};

// initial badge state
updateCartBadge();
positionCartDrawer();

document.getElementById('addCart').addEventListener('click', () => {
    // push to cart
    const mainImg = document.getElementById('mainImage').src;
    const item = {
        title: state.title,
        price: state.unitPrice,
        qty: state.qty,
        color: state.color,
        size: state.size,
        style: state.style,
        image: mainImg
    };
    state.items.push(item);
    // reset qty to 1 after add (nice UX)
    state.qty = 1;
    qtyNum.textContent = 1;
    renderCart();
    openCart();
});

// Buy now -> add & go to checkout overlay
document.getElementById('buyNow').addEventListener('click', () => {
    document.getElementById('addCart').click();
    openCheckout();
});

// Checkout flow
const overlay = document.getElementById('checkoutOverlay');
function openCheckout() { overlay.style.display = 'grid'; overlay.setAttribute('aria-hidden', 'false'); overlay.focus(); }
function closeCheckout() { overlay.style.display = 'none'; overlay.setAttribute('aria-hidden', 'true'); }

document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (state.items.length === 0) { alert('Your cart is empty. Add an item first.'); return; }
    openCheckout();
});
document.getElementById('cancelCheckout').addEventListener('click', closeCheckout);

// payment method select
document.getElementById('payMethods').querySelectorAll('.pay').forEach(p => {
    p.addEventListener('click', () => {
        document.querySelectorAll('.pay').forEach(x => x.classList.remove('sel'));
        p.classList.add('sel');
    });
});

// place order (simulated)
document.getElementById('placeOrder').addEventListener('click', () => {
  const name = document.getElementById('name').value.trim();
  const address = document.getElementById('address').value.trim();

  if (!name || !address) {
    alert('Please enter name and address.');
    return;
  }

  // make phone number mandatory
const phone = document.getElementById('phone').value.trim();
if (!phone) {
  alert('Please enter your mobile number.');
  return;
}


  // find selected payment method (fallback to 'Unknown' if none)
  const paySel = document.querySelector('#payMethods .pay.sel');
  const paymentMethod = paySel ? (paySel.getAttribute('data-pay') || paySel.textContent.trim()) : 'cod';

  const total = state.items.reduce((s, i) => s + i.price * i.qty, 0);

  const summary = {
    name,
    address,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    paymentMethod,
    total,
    items: state.items.slice()
  };

  // updated alert includes payment method
  const formattedMessage = `Thanks <strong>${summary.name}</strong>! Order placed for <span class="highlight">${summary.items.length} item(s)</span>.<br><br>Total: <span class="price">₹${summary.total}</span><br>Payment method: <strong>${summary.paymentMethod}</strong><br><br><em>This is a demo checkout.</em>`;
  showCustomAlert(formattedMessage, 'Order Confirmed');

  // print final order once
  console.log("FINAL ORDER DETAILS:", summary);

  sendOrderEmail(summary)
  .then(() => {
    console.log("Order email sent successfully.");
  })
  .catch(err => {
    console.error("Failed to send order email:", err);
  });


  // clear cart & UI
  state.items = [];
  renderCart();
  closeCheckout();
  closeCart();
});


// small helpers
function refreshSummary() {
    const priceEl = document.getElementById('price');
    const total = state.unitPrice * state.qty;
    priceEl.textContent = money(state.unitPrice);
    document.getElementById('orderTotal').textContent = money(state.items.reduce((s, i) => s + i.price * i.qty, 0));
}

// initial render
refreshSummary();
renderCart();

// Accessibility: close overlay on ESC
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCart();
        closeCheckout();
    }
});