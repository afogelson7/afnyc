import express from 'express';
import { run, all, get } from '../database';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await all(`
      SELECT p.*, b.name as brand_name
      FROM products p
      JOIN brands b ON p.brand_id = b.id
      ORDER BY p.created_at DESC
    `);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await get(`
      SELECT p.*, b.name as brand_name
      FROM products p
      JOIN brands b ON p.brand_id = b.id
      WHERE p.id = ?
    `, [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { sku, name, brand_id, category, subcategory, cogs, wholesale_cost, retailer_srp } = req.body;

    const result = await run(
      'INSERT INTO products (sku, name, brand_id, category, subcategory, cogs, wholesale_cost, retailer_srp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [sku, name, brand_id, category, subcategory, cogs, wholesale_cost, retailer_srp]
    );

    const product = await get(`
      SELECT p.*, b.name as brand_name
      FROM products p
      JOIN brands b ON p.brand_id = b.id
      WHERE p.id = ?
    `, [(result as any).lastID]);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { sku, name, brand_id, category, subcategory, cogs, wholesale_cost, retailer_srp } = req.body;

    await run(
      'UPDATE products SET sku = ?, name = ?, brand_id = ?, category = ?, subcategory = ?, cogs = ?, wholesale_cost = ?, retailer_srp = ? WHERE id = ?',
      [sku, name, brand_id, category, subcategory, cogs, wholesale_cost, retailer_srp, req.params.id]
    );

    const product = await get(`
      SELECT p.*, b.name as brand_name
      FROM products p
      JOIN brands b ON p.brand_id = b.id
      WHERE p.id = ?
    `, [req.params.id]);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
