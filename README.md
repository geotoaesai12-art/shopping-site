# SAHN — Full-Stack Online Store

Professional multi-page shopping website:
- **Frontend**: Home (5-slide banner + offer bar), Shop (Amazon-style grid + search), individual Product pages, Contact (with replies), Order Tracking, Sign in / Sign up
- **Backend**: Node.js + Express (REST API + auth)
- **Database**: SQLite via Node's built-in `node:sqlite` — no external database, no native build step

## Pages
- **Home** — 11.11 sale offer bar, 5-slide auto-banner, category cards, featured deals
- **Shop** — full catalog, search (top header bar), category filter — clicking a product opens its own page
- **Product page** — price with discount %, star rating, delivery estimate, coupon code, quantity picker, Buy Now
- **Checkout** — coupon code discount, city field, payment method (COD / EasyPaisa / JazzCash / Bank Transfer)
- **Order Tracking** (`/track.html`) — enter an order number to see a live status timeline: Received → Warehouse → Packed → Out for delivery → Delivered
- **Contact** — send a message, then use "Check for a reply" (with your email) to see admin's response
- **Sign in / Sign up** — clean centered box, real accounts with hashed passwords
- **Admin** (`/admin.html`) — view orders, click "Advance to next stage" to move an order through tracking, reply to contact messages

## Admin password
Default: `depot123` — change it in `backend/server.js` (search for `ADMIN_KEY`) before going live.

## Coupon codes (demo)
`SALE11` (11% off), `WELCOME10` (10% off), plus a few product-specific codes shown on product pages. Edit the `COUPON_CODES` object in `backend/server.js` to add your own.

## Payment methods
Checkout lets customers choose Cash on Delivery, EasyPaisa, JazzCash, or Bank Transfer. This only *records* the choice — no real payment gateway is connected yet, so no money actually moves. Wiring up real EasyPaisa/JazzCash/Stripe processing is a bigger next step; let me know if you want that built.

> **Email note**: Contact replies are saved and shown on the site when the customer checks — they are not emailed out yet. Connecting a real SMTP provider (Gmail, SendGrid) would let admin replies also arrive in the customer's inbox.

> **Images note**: Product and banner photos load from Picsum's photo service (real photography, reliable hosting). Swap the URLs in `backend/database.js` (products) or `frontend/index.html` (banners) for your own product photos before launch.

---

## 1. Run locally

```
cd shopping-site/backend
npm install
npm start
```
Open `http://localhost:3000`

## 2. Go live (free hosting)

**Render.com** or **Railway.app**: push code to GitHub → connect repo → Root directory `backend`, Build command `npm install`, Start command `npm start` → deploy.

> SQLite is file-based; free hosting may reset it on restart. For real production traffic, migrate to PostgreSQL later.

---

## Roadmap

### Phase 1 — Launch-ready
- [ ] Replace sample products/images with real inventory and photos
- [ ] Real payment gateway integration (EasyPaisa/JazzCash APIs, or Stripe)
- [ ] Real email sending for replies + order confirmations (SMTP)
- [ ] Update social links (WhatsApp number, Facebook, X) and admin password
- [ ] Deploy to Render/Railway

### Phase 2 — Core features
- [ ] Admin panel to add/edit products (no code needed)
- [ ] Order history for logged-in users
- [ ] Product image uploads
- [ ] "Forgot password" flow

### Phase 3 — Growth
- [ ] Customer reviews on product pages
- [ ] SEO optimization
- [ ] Analytics dashboard

### Phase 4 — Scale
- [ ] Migrate SQLite → PostgreSQL/MySQL
- [ ] CDN for images
- [ ] Multiple admin roles, inventory management

