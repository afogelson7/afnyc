import express from 'express';
import { run, all, get } from '../database';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await all('SELECT * FROM products ORDER BY created_at DESC');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await get('SELECT * FROM products WHERE id = ?', [req.params.id]);
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
    const { sku, name, category, cost_price, retail_price, supplier } = req.body;

    const result = await run(
      'INSERT INTO products (sku, name, category, cost_price, retail_price, supplier) VALUES (?, ?, ?, ?, ?, ?)',
      [sku, name, category, cost_price, retail_price, supplier]
    );

    const product = await get('SELECT * FROM products WHERE id = ?', [(result as any).lastID]);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { sku, name, category, cost_price, retail_price, supplier } = req.body;

    await run(
      'UPDATE products SET sku = ?, name = ?, category = ?, cost_price = ?, retail_price = ?, supplier = ? WHERE id = ?',
      [sku, name, category, cost_price, retail_price, supplier, req.params.id]
    );

    const product = await get('SELECT * FROM products WHERE id = ?', [req.params.id]);
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
