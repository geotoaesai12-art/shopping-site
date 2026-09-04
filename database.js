// database.js — sets up shop.db and seeds sample data. Uses Node's built-in
// sqlite module, so no native compilation / build tools are required.

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'shop.db'));
db.exec('PRAGMA journal_mode = WAL;');

db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  original_price REAL,
  discount_percent INTEGER DEFAULT 0,
  description TEXT,
  image_url TEXT,
  stock INTEGER DEFAULT 100,
  rating REAL DEFAULT 4.5,
  rating_count INTEGER DEFAULT 0,
  delivery_days INTEGER DEFAULT 4,
  coupon_code TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  payment_method TEXT DEFAULT 'cod',
  coupon_code TEXT,
  discount_amount REAL DEFAULT 0,
  subtotal REAL,
  total REAL NOT NULL,
  status TEXT DEFAULT 'received',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price_at_purchase REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  reply TEXT,
  replied_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

const count = db.prepare('SELECT COUNT(*) as c FROM products').get().c;

if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name, category, price, original_price, discount_percent, description, image_url, stock, rating, rating_count, delivery_days, coupon_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleProducts = [
    { name: 'Wireless Earbuds Pro', category: 'Electronics', price: 2499, original_price: 3499, discount: 29, description: 'Bluetooth 5.0 earbuds with charging case, 24-hour battery life, and active noise isolation. Great for calls, workouts, and daily commutes.', image: 'https://picsum.photos/seed/sahn-earbuds/600/600', stock: 50, rating: 4.4, ratingCount: 812, delivery: 3, coupon: 'EARBUD10' },
    { name: "Men's Casual Cotton Shirt", category: 'Fashion', price: 1499, original_price: 1999, discount: 25, description: 'Breathable slim-fit cotton shirt, machine washable, available in multiple colors and sizes.', image: 'https://picsum.photos/seed/sahn-shirt/600/600', stock: 80, rating: 4.2, ratingCount: 356, delivery: 4, coupon: 'FASHION15' },
    { name: 'Stainless Steel Water Bottle', category: 'Home', price: 899, original_price: 1199, discount: 25, description: 'Double-wall insulated, keeps drinks cold for 24 hours or hot for 12. 1 litre capacity, leak-proof lid.', image: 'https://picsum.photos/seed/sahn-bottle/600/600', stock: 120, rating: 4.6, ratingCount: 1204, delivery: 3, coupon: null },
    { name: 'Smart Fitness Watch', category: 'Electronics', price: 5999, original_price: 8999, discount: 33, description: 'Heart-rate monitoring, sleep tracking, 7-day battery, and smartphone notifications. Water-resistant up to 50m.', image: 'https://picsum.photos/seed/sahn-watch/600/600', stock: 30, rating: 4.3, ratingCount: 549, delivery: 5, coupon: 'WATCH20' },
    { name: "Women's Leather Handbag", category: 'Fashion', price: 2199, original_price: 2999, discount: 27, description: 'Faux leather handbag with adjustable strap, multiple compartments, and a magnetic clasp closure.', image: 'https://picsum.photos/seed/sahn-handbag/600/600', stock: 40, rating: 4.5, ratingCount: 287, delivery: 4, coupon: null },
    { name: 'Non-Stick Frying Pan 28cm', category: 'Home', price: 1299, original_price: 1699, discount: 24, description: 'Induction-compatible non-stick frying pan with a heat-resistant handle. Easy to clean, PFOA-free coating.', image: 'https://picsum.photos/seed/sahn-pan/600/600', stock: 60, rating: 4.1, ratingCount: 198, delivery: 4, coupon: null },
    { name: "Kids' Illustrated Story Set", category: 'Books', price: 799, original_price: 999, discount: 20, description: 'Set of 5 colorfully illustrated story books for children ages 4-8. Durable hardcover binding.', image: 'https://picsum.photos/seed/sahn-books/600/600', stock: 100, rating: 4.7, ratingCount: 421, delivery: 5, coupon: 'READ5' },
    { name: 'Portable Bluetooth Speaker', category: 'Electronics', price: 3499, original_price: 4999, discount: 30, description: 'Rich, room-filling sound with a 12-hour battery. Splash resistant, pairs with two devices at once.', image: 'https://picsum.photos/seed/sahn-speaker/600/600', stock: 45, rating: 4.4, ratingCount: 673, delivery: 3, coupon: null },
    { name: 'Lightweight Running Shoes', category: 'Fashion', price: 3999, original_price: 5499, discount: 27, description: 'Breathable mesh upper, cushioned sole, designed for daily running and everyday wear.', image: 'https://picsum.photos/seed/sahn-shoes/600/600', stock: 55, rating: 4.5, ratingCount: 902, delivery: 4, coupon: 'RUN10' },
    { name: 'Modern LED Table Lamp', category: 'Home', price: 1599, original_price: 2199, discount: 27, description: 'Adjustable brightness LED lamp with a touch-sensitive base, ideal for desks and bedside tables.', image: 'https://picsum.photos/seed/sahn-lamp/600/600', stock: 70, rating: 4.3, ratingCount: 245, delivery: 4, coupon: null },
    { name: 'Water-Resistant Laptop Backpack', category: 'Fashion', price: 1899, original_price: 2599, discount: 27, description: 'Padded laptop compartment fits up to 15.6", multiple pockets, water-resistant fabric.', image: 'https://picsum.photos/seed/sahn-backpack/600/600', stock: 65, rating: 4.6, ratingCount: 511, delivery: 3, coupon: null },
    { name: 'Fast-Charging Power Bank 10000mAh', category: 'Electronics', price: 1999, original_price: 2799, discount: 29, description: 'Compact power bank with dual USB output and fast-charge support for phones and small devices.', image: 'https://picsum.photos/seed/sahn-powerbank/600/600', stock: 90, rating: 4.2, ratingCount: 389, delivery: 3, coupon: 'POWER10' },
  ];

  db.exec('BEGIN');
  try {
    for (const p of sampleProducts) {
      insert.run(p.name, p.category, p.price, p.original_price, p.discount, p.description, p.image, p.stock, p.rating, p.ratingCount, p.delivery, p.coupon);
    }
    db.exec('COMMIT');
    console.log(`Seeded ${sampleProducts.length} sample products into the database.`);
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

module.exports = db;
