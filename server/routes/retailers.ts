import express from 'express';
import { run, all, get } from '../database';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const retailers = await all('SELECT * FROM retailers ORDER BY name');
    res.json(retailers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch retailers' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const retailer = await get('SELECT * FROM retailers WHERE id = ?', [req.params.id]);
    if (!retailer) {
      return res.status(404).json({ error: 'Retailer not found' });
    }
    res.json(retailer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch retailer' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, code } = req.body;

    const result = await run(
      'INSERT INTO retailers (name, code) VALUES (?, ?)',
      [name, code]
    );

    const retailer = await get('SELECT * FROM retailers WHERE id = ?', [(result as any).lastID]);
    res.status(201).json(retailer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create retailer' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, code } = req.body;

    await run(
      'UPDATE retailers SET name = ?, code = ? WHERE id = ?',
      [name, code, req.params.id]
    );

    const retailer = await get('SELECT * FROM retailers WHERE id = ?', [req.params.id]);
    res.json(retailer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update retailer' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM retailers WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete retailer' });
  }
});

export default router;
