import express from 'express';
import { run, all, get } from '../database';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const brands = await all('SELECT * FROM brands ORDER BY name');
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const brand = await get('SELECT * FROM brands WHERE id = ?', [req.params.id]);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    const result = await run(
      'INSERT INTO brands (name, description) VALUES (?, ?)',
      [name, description]
    );

    const brand = await get('SELECT * FROM brands WHERE id = ?', [(result as any).lastID]);
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create brand' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;

    await run(
      'UPDATE brands SET name = ?, description = ? WHERE id = ?',
      [name, description, req.params.id]
    );

    const brand = await get('SELECT * FROM brands WHERE id = ?', [req.params.id]);
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update brand' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM brands WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

export default router;
