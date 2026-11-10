  /* =========================================================
     ORDER CONFIG — edit these two values
     ========================================================= */
  const ORDER_CONFIG = {
    whatsappNumber: '2348012345678', // international format, no +, no spaces
    email: 'orders@nsipeesluxury.com',
    brand: 'Nsipees Luxury'
  };

  /* ---------------- DATA ---------------- */
  const PRODUCTS = [
    { id:1, name:"Embellished Peplum Set",     price:50000, cat:"Couture",    img:"images/dress1.jpg" },
    { id:2, name:"Structured Lace Gown",       price:48000, cat:"Gowns",      img:"images/dress2.jpg" },
    { id:3, name:"Beaded Ankara Midi",         price:48000, cat:"Ankara",     img:"images/dress3.jpg" },
    { id:4, name:"Off-Shoulder Lace Dress",    price:50000, cat:"Gowns",      img:"images/dress4.jpg" },
    { id:5, name:"Sequined Statement Dress",   price:40000, cat:"Evening",    img:"images/dress5.jpg" },
    { id:6, name:"Asymmetric Ankara Dress",    price:38000, cat:"Ankara",     img:"images/dress6.jpg" },
    { id:7, name:"Corset Lace Gown",           price:36000, cat:"Couture",    img:"images/dress7.jpg" },
    { id:8, name:"Embroidered Formal Set",     price:48000, cat:"Sets",       img:"images/dress8.jpg" }
  ];
  const FEATURED_IDS = [1, 2, 4];

  const imgUrl = (src, w=1000) => src.startsWith('images/') ? src : `https://images.unsplash.com/${src}?auto=format&fit=crop&w=${w}&q=80`;
  const fmt    = n => '₦' + n.toLocaleString('en-NG');

  /* ---------------- RENDER ---------------- */
  function cardHTML(p, i){
    return `
      <article class="product" data-reveal style="transition-delay:${(i%8)*0.06}s">
        <div class="product__media">
          <img src="${imgUrl(p.img, 900)}" alt="${p.name}" loading="lazy" onerror="this.classList.add('is-broken')" />
        </div>
        <div class="product__info">
          <h3 class="product__name">${p.name}</h3>
          <p class="product__cat">${p.cat}</p>
          <div class="product__bottom">
            <p class="product__price">${fmt(p.price)}</p>
            <button class="product__add" data-add="${p.id}">Add to Bag +</button>
          </div>
        </div>
      </article>`;
  }

  document.getElementById('featuredGrid').innerHTML =
    FEATURED_IDS.map((id,i) => cardHTML(PRODUCTS.find(p=>p.id===id), i)).join('');

  document.getElementById('shopGrid').innerHTML =
    PRODUCTS.map((p,i) => cardHTML(p, i)).join('');

  /* ---------------- REVEAL ---------------- */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));

  /* ---------------- TOPBAR SCROLL ---------------- */
  const topbar = document.getElementById('topbar');
  const onScroll = () => topbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---------------- MOBILE MENU ---------------- */
  const menu = document.querySelector('[data-menu]');
  const openMenu = () => { menu.classList.add('open'); document.body.classList.add('no-scroll'); };
  const closeMenu = () => { menu.classList.remove('open'); document.body.classList.remove('no-scroll'); };
  document.querySelector('[data-menu-open]').addEventListener('click', openMenu);
  document.querySelectorAll('[data-menu-close]').forEach(b=>b.addEventListener('click', closeMenu));

  /* ---------------- CART ---------------- */
  const cartEl   = document.querySelector('[data-cart]');
  const overlay  = document.querySelector('[data-cart-overlay]');
  const itemsEl  = document.querySelector('[data-cart-items]');
  const totalEl  = document.querySelector('[data-cart-total]');
  const countEls = document.querySelectorAll('[data-cart-count]');
  const waBtn    = document.querySelector('[data-order-wa]');
  const emBtn    = document.querySelector('[data-order-em]');
  let cart = [];

  const openCart  = () => { cartEl.classList.add('open'); overlay.classList.add('show'); document.body.classList.add('no-scroll'); };
  const closeCart = () => { cartEl.classList.remove('open'); overlay.classList.remove('show'); document.body.classList.remove('no-scroll'); };

  /* Build the pre-filled order message (plain text) */
  function buildOrderMessage(){
    const lines = [
      `Hello ${ORDER_CONFIG.brand},`,
      ``,
      `I'd like to place an order:`,
      ``
    ];
    cart.forEach((x,i)=>{
      lines.push(`${i+1}. ${x.name} — ${fmt(x.price)} × ${x.qty} = ${fmt(x.price * x.qty)}`);
    });
    const total = cart.reduce((s,x)=>s + x.price*x.qty, 0);
    lines.push(
      ``,
      `Total: ${fmt(total)}`,
      ``,
      `Please confirm availability, delivery, and payment details.`,
      ``,
      `Name:`,
      `Delivery address:`,
      `Preferred payment:`
    );
    return lines.join('\n');
  }

  /* Wire the order buttons to the current cart */
  function updateOrderLinks(){
    const hasItems = cart.length > 0;
    const msg = encodeURIComponent(buildOrderMessage());

    waBtn.href = `https://wa.me/${ORDER_CONFIG.whatsappNumber}?text=${msg}`;
    emBtn.href = `mailto:${ORDER_CONFIG.email}?subject=${encodeURIComponent('New Order — ' + ORDER_CONFIG.brand)}&body=${msg}`;

    [waBtn, emBtn].forEach(b=>{
      b.setAttribute('aria-disabled', hasItems ? 'false' : 'true');
    });
  }

  function renderCart(){
    const qty   = cart.reduce((s,x)=>s+x.qty, 0);
    const total = cart.reduce((s,x)=>s+x.price*x.qty, 0);
    
    // Update all bag count text
    countEls.forEach(el=>el.textContent = qty);
    totalEl.textContent = fmt(total);

    if(!cart.length){
      itemsEl.innerHTML = '<p class="cart__empty">Your bag is empty.</p>';
      updateOrderLinks();
      return;
    }
    
    // Render items with +/- buttons
    itemsEl.innerHTML = cart.map(x=>`
      <div class="cart-item">
        <img src="${imgUrl(x.img, 200)}" alt="${x.name}" onerror="this.style.opacity=0" />
        <div class="cart-item__body" style="flex:1">
          <p class="cart-item__name">${x.name}</p>
          <p class="cart-item__meta">${fmt(x.price)}</p>
          <div class="cart-item__actions">
            <div class="qty-control">
              <button data-decrease="${x.id}">-</button>
              <span>${x.qty}</span>
              <button data-increase="${x.id}">+</button>
            </div>
            <button class="cart-item__remove" data-remove="${x.id}">Remove</button>
          </div>
        </div>
      </div>`).join('');

    updateOrderLinks();
  }

  // Adds an item and triggers the pop animation
  function addToCart(id){
    const p = PRODUCTS.find(x=>x.id===id);
    const existing = cart.find(x=>x.id===id);
    if(existing) {
      existing.qty++;
    } else {
      cart.push({ ...p, qty:1 });
    }
    
    renderCart();
    openCart(); // Open bag so they see it
    
    // Animate the bag counter
    countEls.forEach(el => {
      el.classList.remove('bump');
      void el.offsetWidth; // Trigger reflow to restart animation
      el.classList.add('bump');
    });
  }

  function removeFromCart(id){
    cart = cart.filter(x=>x.id!==id);
    renderCart();
  }

  function updateQty(id, delta) {
    const item = cart.find(x=>x.id===id);
    if(!item) return;
    item.qty += delta;
    if(item.qty <= 0) {
      removeFromCart(id);
    } else {
      renderCart();
    }
  }

  document.addEventListener('click', (e)=>{
    // Add to bag
    const addBtn = e.target.closest('[data-add]');
    if(addBtn){ addToCart(parseInt(addBtn.dataset.add, 10)); return; }
    
    // Increase / Decrease Qty
    const incBtn = e.target.closest('[data-increase]');
    if(incBtn){ updateQty(parseInt(incBtn.dataset.increase, 10), 1); return; }
    
    const decBtn = e.target.closest('[data-decrease]');
    if(decBtn){ updateQty(parseInt(decBtn.dataset.decrease, 10), -1); return; }
    
    // Remove item
    const remBtn = e.target.closest('[data-remove]');
    if(remBtn){ removeFromCart(parseInt(remBtn.dataset.remove, 10)); return; }
    
    // Toggle Cart UI
    if(e.target.closest('[data-cart-open]')){ openCart(); return; }
    if(e.target.closest('[data-cart-close]') || e.target === overlay){ closeCart(); }
  });

  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape'){ closeCart(); closeMenu(); } });

  renderCart();
