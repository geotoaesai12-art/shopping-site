// track.js — customer-facing order tracking page

mountLayout('track');
mountCartDrawer();

const urlId = new URLSearchParams(window.location.search).get('id');
if (urlId) {
  document.getElementById('orderIdInput').value = urlId;
  loadOrder(urlId);
}

document.getElementById('trackBtn').addEventListener('click', () => {
  const id = document.getElementById('orderIdInput').value.trim();
  if (id) loadOrder(id);
});

async function loadOrder(id) {
  const result = document.getElementById('orderResult');
  result.innerHTML = `<p class="loading">Loading...</p>`;

  try {
    const res = await fetch(`/api/orders/${id}`);
    if (!res.ok) {
      result.innerHTML = `<p class="loading">No order found with that number.</p>`;
      return;
    }
    const order = await res.json();

    result.innerHTML = `
      <div class="form-card">
        <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
          <strong>Order #${order.id}</strong>
          <span style="color:var(--muted); font-size:13px;">${new Date(order.created_at).toLocaleDateString()}</span>
        </div>
        <div style="color:var(--muted); font-size:13.5px; margin-bottom: 20px;">
          Delivering to ${order.city ? order.city + ', ' : ''}${order.address}
        </div>

        <div class="tracking-timeline">
          ${order.stages.map(s => `
            <div class="tracking-step ${s.done ? 'done' : ''} ${s.current ? 'current' : ''}">
              <div class="tracking-dot">${s.done && !s.current ? '✓' : ''}</div>
              <div class="tracking-label">${s.label}</div>
            </div>
          `).join('')}
        </div>

        <div style="border-top:1px solid var(--line); margin-top:22px; padding-top:16px;">
          ${order.items.map(i => `
            <div style="display:flex; justify-content:space-between; font-size:13.5px; padding:4px 0;">
              <span>${i.quantity} × ${i.name}</span>
              <span>Rs. ${(i.price_at_purchase * i.quantity).toLocaleString()}</span>
            </div>
          `).join('')}
          <div style="display:flex; justify-content:space-between; font-weight:700; margin-top:8px; padding-top:8px; border-top:1px solid var(--line);">
            <span>Total</span><span>Rs. ${order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    result.innerHTML = `<p class="loading">Could not load order. Is the backend server running?</p>`;
  }
}
