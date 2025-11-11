const state = {
    title: 'Classic Premium T-Shirt',
    unitPrice: 1599,
    qty: 1,
    color: 'Black',
    size: 'M',
    style: 'Regular',
    items: []
};

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
function attachOption(containerId, key, changeImage = false) {
    const container = document.getElementById(containerId);
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
attachOption('colorOpts', 'color', true);
attachOption('sizeOpts', 'size');
attachOption('styleOpts', 'style');

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
        div.innerHTML = `<img src="${it.image}" alt=""><div style="flex:1"><div style="font-weight:600">${it.title}</div><div class="small" style="color:var(--muted)">${it.color} • ${it.size} • ${it.style}</div></div><div style="text-align:right"><div style="font-weight:700">${money(it.price * it.qty)}</div><div class="small">Qty ${it.qty}</div></div>`;
        cartBody.appendChild(div);
    });
    subtotalEl.textContent = money(sum);
    document.getElementById('orderTotal').textContent = money(sum);
}

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
    // pretend to process payment
    const total = state.items.reduce((s, i) => s + i.price * i.qty, 0);
    // Clear cart & show summary
    const summary = {
        name, address, email: document.getElementById('email').value, phone: document.getElementById('phone').value,
        total, items: state.items.slice()
    };
    // clear
    state.items = [];
    renderCart();
    closeCheckout();
    closeCart();
    // Show a simple confirmation (in production you'd send to server)
    alert(`Thanks ${summary.name}! Order placed for ${summary.items.length} item(s). Total: ${money(summary.total)}. (This is a demo checkout.)`);
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