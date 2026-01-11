import express from 'express';
import { run, all, get } from '../database';

const router = express.Router();

// Get all tags
router.get('/', async (req, res) => {
  try {
    const tags = await all('SELECT * FROM tags ORDER BY name');
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Create tag
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await run('INSERT INTO tags (name) VALUES (?)', [name]);
    const tag = await get('SELECT * FROM tags WHERE id = ?', [(result as any).lastID]);
    res.status(201).json(tag);
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint')) {
      res.status(400).json({ error: 'Tag already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create tag' });
    }
  }
});

// Delete tag
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM tags WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

export default router;
