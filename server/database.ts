import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database('./beauty-sales.db');

const run = promisify(db.run.bind(db));
const all = promisify(db.all.bind(db));
const get = promisify(db.get.bind(db));

export const initDatabase = async () => {
  // Brands/Licenses
  await run(`
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Retailers
  await run(`
    CREATE TABLE IF NOT EXISTS retailers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products
  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      brand_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      cogs REAL NOT NULL,
      wholesale_cost REAL NOT NULL,
      retailer_srp REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (brand_id) REFERENCES brands(id)
    )
  `);

  // Sales data (uploaded from Excel)
  await run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      retailer_id INTEGER NOT NULL,
      sale_date DATE NOT NULL,
      units_sold INTEGER NOT NULL,
      revenue REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (retailer_id) REFERENCES retailers(id)
    )
  `);

  // Forecasts/Budgets
  await run(`
    CREATE TABLE IF NOT EXISTS forecasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      period_type TEXT NOT NULL,
      period_value TEXT NOT NULL,
      brand_id INTEGER,
      category TEXT,
      subcategory TEXT,
      retailer_id INTEGER,
      forecasted_units INTEGER,
      forecasted_revenue REAL NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (brand_id) REFERENCES brands(id),
      FOREIGN KEY (retailer_id) REFERENCES retailers(id)
    )
  `);

  // Seasonal periods
  await run(`
    CREATE TABLE IF NOT EXISTS seasonal_periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      year INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Upload history
  await run(`
    CREATE TABLE IF NOT EXISTS upload_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      records_imported INTEGER,
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT,
      error_message TEXT
    )
  `);

  console.log('Database initialized successfully');
};

export { db, run, all, get };
