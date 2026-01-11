import express from 'express';
import { run, all, get } from '../database';

const router = express.Router();

// Get all industries
router.get('/', async (req, res) => {
  try {
    const industries = await all('SELECT * FROM industries ORDER BY name');
    res.json(industries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch industries' });
  }
});

// Create industry
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await run('INSERT INTO industries (name) VALUES (?)', [name]);
    const industry = await get('SELECT * FROM industries WHERE id = ?', [(result as any).lastID]);
    res.status(201).json(industry);
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint')) {
      res.status(400).json({ error: 'Industry already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create industry' });
    }
  }
});

// Delete industry
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM industries WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete industry' });
  }
});

export default router;
