import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database('./collabiq.db');

const run = promisify(db.run.bind(db));
const all = promisify(db.all.bind(db));
const get = promisify(db.get.bind(db));

export const initDatabase = async () => {
  // Brands - companies that participate in collaborations
  await run(`
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      logo_url TEXT,
      industry TEXT,
      description TEXT,
      website TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Industries/Categories for filtering
  await run(`
    CREATE TABLE IF NOT EXISTS industries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Collaborations - the main entity tracking brand partnerships
  await run(`
    CREATE TABLE IF NOT EXISTS collaborations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      detailed_description TEXT,
      source_url TEXT NOT NULL,
      source_name TEXT,
      image_url TEXT,
      published_date DATE NOT NULL,
      collaboration_type TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Junction table for many-to-many relationship between collaborations and brands
  await run(`
    CREATE TABLE IF NOT EXISTS collaboration_brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collaboration_id INTEGER NOT NULL,
      brand_id INTEGER NOT NULL,
      role TEXT DEFAULT 'partner',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (collaboration_id) REFERENCES collaborations(id) ON DELETE CASCADE,
      FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
      UNIQUE(collaboration_id, brand_id)
    )
  `);

  // Tags for collaborations
  await run(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Junction table for collaboration tags
  await run(`
    CREATE TABLE IF NOT EXISTS collaboration_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collaboration_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      FOREIGN KEY (collaboration_id) REFERENCES collaborations(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
      UNIQUE(collaboration_id, tag_id)
    )
  `);

  // Insert default industries
  const defaultIndustries = [
    'Beauty & Cosmetics',
    'Fashion & Apparel',
    'Food & Beverage',
    'Consumer Electronics',
    'Home & Living',
    'Health & Wellness',
    'Entertainment & Media',
    'Sports & Fitness',
    'Automotive',
    'Travel & Hospitality',
    'Retail',
    'Luxury Goods'
  ];

  for (const industry of defaultIndustries) {
    await run(`INSERT OR IGNORE INTO industries (name) VALUES (?)`, [industry]);
  }

  // Insert default collaboration types as tags
  const defaultTags = [
    'Product Launch',
    'Limited Edition',
    'Co-Branding',
    'Licensing Deal',
    'Celebrity Partnership',
    'Influencer Collaboration',
    'Sustainability Initiative',
    'Tech Integration',
    'Retail Exclusive',
    'Anniversary Collection',
    'Seasonal Collection',
    'Crossover'
  ];

  for (const tag of defaultTags) {
    await run(`INSERT OR IGNORE INTO tags (name) VALUES (?)`, [tag]);
  }

  console.log('CollabIQ database initialized successfully');
};

export { db, run, all, get };
