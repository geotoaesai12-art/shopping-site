// server.js
// Main backend server: serves the REST API and frontend files.

const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend files directly from this project folder
app.use(express.static(__dirname));

// ---------- API ROUTES ----------

// Get all products (optional ?category= filter, optional ?search=)
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;

  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }

  const products = db.prepare(query).all(...params);
  res.json(products);
});

// Get distinct categories
app.get('/api/categories', (req, res) => {
  const categories = db
    .prepare('SELECT DISTINCT category FROM products')
    .all();

  res.json(categories.map(c => c.category));
});

// Get single product by id
app.get('/api/products/:id', (req, res) => {
  const product = db
    .prepare('SELECT * FROM products WHERE id = ?')
    .get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

// ---------- COUPONS ----------

const COUPON_CODES = {
  'SALE11': 11,
  'WELCOME10': 10,
  'EARBUD10': 10,
  'FASHION15': 15,
  'WATCH20': 20,
  'RUN10': 10,
  'READ5': 5,
  'POWER10': 10,
};

// ---------- ORDER STATUS ----------

const ORDER_STAGES = [
  'received',
  'warehouse',
  'packed',
  'out_for_delivery',
  'delivered'
];

const STAGE_LABELS = {
  received: 'Order received',
  warehouse: 'Arrived at warehouse',
  packed: 'Packed',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
};

// ---------- CREATE ORDER ----------

app.post('/api/orders', (req, res) => {
  const {
    customer_name,
    email,
    address,
    city,
    payment_method,
    coupon_code,
    items
  } = req.body;

  if (
    !customer_name ||
    !email ||
    !address ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      error: 'Missing required order fields.'
    });
  }

  const validPaymentMethods = [
    'cod',
    'easypaisa',
    'jazzcash',
    'bank'
  ];

  const finalPaymentMethod =
    validPaymentMethods.includes(payment_method)
      ? payment_method
      : 'cod';

  let discountPercent = 0;

  const normalizedCoupon =
    (coupon_code || '').trim().toUpperCase();

  if (
    normalizedCoupon &&
    COUPON_CODES[normalizedCoupon]
  ) {
    discountPercent = COUPON_CODES[normalizedCoupon];
  }

  const getProduct = db.prepare(
    'SELECT * FROM products WHERE id = ?'
  );

  const insertOrder = db.prepare(`
    INSERT INTO orders
    (
      customer_name,
      email,
      address,
      city,
      payment_method,
      coupon_code,
      discount_amount,
      subtotal,
      total,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'received')
  `);

  const insertItem = db.prepare(`
    INSERT INTO order_items
    (
      order_id,
      product_id,
      quantity,
      price_at_purchase
    )
    VALUES (?, ?, ?, ?)
  `);

  const updateStock = db.prepare(
    'UPDATE products SET stock = stock - ? WHERE id = ?'
  );

  function createOrder() {
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = getProduct.get(item.product_id);

      if (!product) {
        throw new Error(
          `Product ${item.product_id} not found`
        );
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Not enough stock for ${product.name}`
        );
      }

      subtotal += product.price * item.quantity;

      validatedItems.push({
        product,
        quantity: item.quantity
      });
    }

    const discountAmount = Math.round(
      subtotal * (discountPercent / 100)
    );

    const total = subtotal - discountAmount;

    const orderResult = insertOrder.run(
      customer_name,
      email,
      address,
      city || '',
      finalPaymentMethod,
      discountPercent > 0 ? normalizedCoupon : null,
      discountAmount,
      subtotal,
      total
    );

    const orderId = orderResult.lastInsertRowid;

    for (const {
      product,
      quantity
    } of validatedItems) {
      insertItem.run(
        orderId,
        product.id,
        quantity,
        product.price
      );

      updateStock.run(
        quantity,
        product.id
      );
    }

    return {
      orderId,
      subtotal,
      discountAmount,
      total
    };
  }

  try {
    db.exec('BEGIN');

    const {
      orderId,
      subtotal,
      discountAmount,
      total
    } = createOrder();

    db.exec('COMMIT');

    res.status(201).json({
      success: true,
      order_id: orderId,
      subtotal,
      discount_amount: discountAmount,
      total
    });

  } catch (err) {
    db.exec('ROLLBACK');

    res.status(400).json({
      error: err.message
    });
  }
});

// ---------- VALIDATE COUPON ----------

app.post('/api/coupons/validate', (req, res) => {
  const code =
    (req.body.code || '').trim().toUpperCase();

  if (COUPON_CODES[code]) {
    return res.json({
      valid: true,
      percent: COUPON_CODES[code]
    });
  }

  res.json({
    valid: false
  });
});

// ---------- GET ORDER ----------

app.get('/api/orders/:id', (req, res) => {
  const order = db
    .prepare('SELECT * FROM orders WHERE id = ?')
    .get(req.params.id);

  if (!order) {
    return res.status(404).json({
      error: 'Order not found'
    });
  }

  const items = db.prepare(`
    SELECT
      oi.quantity,
      oi.price_at_purchase,
      p.name,
      p.image_url
    FROM order_items oi
    JOIN products p
      ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `).all(req.params.id);

  const currentIndex =
    ORDER_STAGES.indexOf(order.status);

  const stages = ORDER_STAGES.map((key, i) => ({
    key,
    label: STAGE_LABELS[key],
    done: i <= currentIndex,
    current: i === currentIndex
  }));

  res.json({
    ...order,
    items,
    stages
  });
});

// ---------- ORDERS BY EMAIL ----------

app.get('/api/orders/by-email/:email', (req, res) => {
  const orders = db
    .prepare(`
      SELECT
        id,
        total,
        status,
        city,
        created_at
      FROM orders
      WHERE email = ?
      ORDER BY id DESC
    `)
    .all(req.params.email);

  res.json(orders);
});

// ---------- ADMIN ----------

const ADMIN_KEY =
  process.env.ADMIN_KEY || 'depot123';

function requireAdmin(req, res, next) {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) {
    return res.status(401).json({
      error: 'Invalid admin password.'
    });
  }

  next();
}

// List all orders
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const orders = db
    .prepare(
      'SELECT * FROM orders ORDER BY id DESC'
    )
    .all();

  const itemsStmt = db.prepare(`
    SELECT
      oi.quantity,
      oi.price_at_purchase,
      p.name
    FROM order_items oi
    JOIN products p
      ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `);

  const withItems = orders.map(order => ({
    ...order,
    items: itemsStmt.all(order.id)
  }));

  res.json(withItems);
});

// List contact messages
app.get('/api/admin/messages', requireAdmin, (req, res) => {
  const messages = db
    .prepare(
      'SELECT * FROM messages ORDER BY id DESC'
    )
    .all();

  res.json(messages);
});

// Reply to contact message
app.post(
  '/api/admin/messages/:id/reply',
  requireAdmin,
  (req, res) => {
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({
        error: 'Reply text is required.'
      });
    }

    const message = db
      .prepare(
        'SELECT * FROM messages WHERE id = ?'
      )
      .get(req.params.id);

    if (!message) {
      return res.status(404).json({
        error: 'Message not found.'
      });
    }

    db.prepare(`
      UPDATE messages
      SET reply = ?,
          replied_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      reply,
      req.params.id
    );

    res.json({
      success: true
    });
  }
);

// Advance order status
app.post(
  '/api/admin/orders/:id/advance',
  requireAdmin,
  (req, res) => {
    const order = db
      .prepare(
        'SELECT * FROM orders WHERE id = ?'
      )
      .get(req.params.id);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found.'
      });
    }

    const currentIndex =
      ORDER_STAGES.indexOf(order.status);

    if (
      currentIndex === -1 ||
      currentIndex >= ORDER_STAGES.length - 1
    ) {
      return res.status(400).json({
        error: 'Order is already at the final stage.'
      });
    }

    const nextStatus =
      ORDER_STAGES[currentIndex + 1];

    db.prepare(
      'UPDATE orders SET status = ? WHERE id = ?'
    ).run(
      nextStatus,
      req.params.id
    );

    res.json({
      success: true,
      status: nextStatus
    });
  }
);

// ---------- AUTH ----------

function hashPassword(password, salt) {
  return crypto
    .scryptSync(password, salt, 64)
    .toString('hex');
}

function makeToken() {
  return crypto
    .randomBytes(32)
    .toString('hex');
}

// Signup
app.post('/api/auth/signup', (req, res) => {
  const {
    name,
    email,
    password
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error:
        'Name, email and password are required.'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error:
        'Password must be at least 6 characters.'
    });
  }

  const existing = db
    .prepare(
      'SELECT id FROM users WHERE email = ?'
    )
    .get(email.toLowerCase());

  if (existing) {
    return res.status(400).json({
      error:
        'An account with this email already exists.'
    });
  }

  const salt =
    crypto.randomBytes(16).toString('hex');

  const password_hash =
    hashPassword(password, salt);

  const result = db.prepare(`
    INSERT INTO users
    (
      name,
      email,
      password_hash,
      salt
    )
    VALUES (?, ?, ?, ?)
  `).run(
    name,
    email.toLowerCase(),
    password_hash,
    salt
  );

  const token = makeToken();

  db.prepare(`
    INSERT INTO sessions
    (
      token,
      user_id
    )
    VALUES (?, ?)
  `).run(
    token,
    result.lastInsertRowid
  );

  res.status(201).json({
    token,
    user: {
      id: result.lastInsertRowid,
      name,
      email: email.toLowerCase()
    }
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const {
    email,
    password
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error:
        'Email and password are required.'
    });
  }

  const user = db
    .prepare(
      'SELECT * FROM users WHERE email = ?'
    )
    .get(email.toLowerCase());

  if (!user) {
    return res.status(401).json({
      error:
        'Invalid email or password.'
    });
  }

  const hash =
    hashPassword(password, user.salt);

  if (hash !== user.password_hash) {
    return res.status(401).json({
      error:
        'Invalid email or password.'
    });
  }

  const token = makeToken();

  db.prepare(`
    INSERT INTO sessions
    (
      token,
      user_id
    )
    VALUES (?, ?)
  `).run(
    token,
    user.id
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

// Current logged-in user
app.get('/api/auth/me', (req, res) => {
  const token =
    (req.headers.authorization || '')
      .replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      error: 'Not logged in.'
    });
  }

  const session = db
    .prepare(
      'SELECT * FROM sessions WHERE token = ?'
    )
    .get(token);

  if (!session) {
    return res.status(401).json({
      error: 'Session expired.'
    });
  }

  const user = db
    .prepare(`
      SELECT
        id,
        name,
        email
      FROM users
      WHERE id = ?
    `)
    .get(session.user_id);

  res.json({
    user
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const token =
    (req.headers.authorization || '')
      .replace('Bearer ', '');

  if (token) {
    db.prepare(
      'DELETE FROM sessions WHERE token = ?'
    ).run(token);
  }

  res.json({
    success: true
  });
});

// ---------- CONTACT ----------

// Save contact message
app.post('/api/contact', (req, res) => {
  const {
    name,
    email,
    message
  } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      error:
        'Name, email and message are required.'
    });
  }

  db.prepare(`
    INSERT INTO messages
    (
      name,
      email,
      message
    )
    VALUES (?, ?, ?)
  `).run(
    name,
    email,
    message
  );

  res.status(201).json({
    success: true
  });
});

// Customer messages by email
app.get('/api/messages/by-email', (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      error: 'Email is required.'
    });
  }

  const messages = db
    .prepare(`
      SELECT *
      FROM messages
      WHERE email = ?
      ORDER BY id DESC
    `)
    .all(email);

  res.json(messages);
});

// ---------- START SERVER ----------

app.listen(PORT, () => {
  console.log(
    `Shopping site server running on port ${PORT}`
  );
});
