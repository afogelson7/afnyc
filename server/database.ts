import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database('./beauty-planner.db');

const run = promisify(db.run.bind(db));
const all = promisify(db.all.bind(db));
const get = promisify(db.get.bind(db));

export const initDatabase = async () => {
  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      cost_price REAL NOT NULL,
      retail_price REAL NOT NULL,
      supplier TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      period TEXT NOT NULL,
      allocated_amount REAL NOT NULL,
      spent_amount REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      po_number TEXT UNIQUE NOT NULL,
      supplier TEXT NOT NULL,
      order_date DATE NOT NULL,
      expected_delivery DATE,
      status TEXT DEFAULT 'pending',
      total_cost REAL NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS po_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      po_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_cost REAL NOT NULL,
      FOREIGN KEY (po_id) REFERENCES purchase_orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  console.log('Database initialized successfully');
};

export { db, run, all, get };
