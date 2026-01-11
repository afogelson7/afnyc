import express from 'express';
import { run, all, get } from '../database';

const router = express.Router();

// Get all brands
router.get('/', async (req, res) => {
  try {
    const { industry, search } = req.query;
    let query = 'SELECT * FROM brands';
    const params: any[] = [];
    const conditions: string[] = [];

    if (industry) {
      conditions.push('industry = ?');
      params.push(industry);
    }

    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY name';

    const brands = await all(query, params);
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// Get brand by ID with collaboration count
router.get('/:id', async (req, res) => {
  try {
    const brand = await get('SELECT * FROM brands WHERE id = ?', [req.params.id]);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    // Get collaboration count
    const countResult = await get(
      'SELECT COUNT(*) as count FROM collaboration_brands WHERE brand_id = ?',
      [req.params.id]
    );

    res.json({ ...brand, collaboration_count: (countResult as any)?.count || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
});

// Get collaborations for a specific brand
router.get('/:id/collaborations', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const collaborations = await all(`
      SELECT c.*,
        GROUP_CONCAT(DISTINCT b.name) as brand_names,
        GROUP_CONCAT(DISTINCT b.id) as brand_ids
      FROM collaborations c
      JOIN collaboration_brands cb ON c.id = cb.collaboration_id
      JOIN brands b ON cb.brand_id = b.id
      WHERE c.id IN (
        SELECT collaboration_id FROM collaboration_brands WHERE brand_id = ?
      )
      GROUP BY c.id
      ORDER BY c.published_date DESC
      LIMIT ? OFFSET ?
    `, [req.params.id, limit, offset]);

    // Parse brand names and ids into arrays
    const parsed = (collaborations as any[]).map(c => ({
      ...c,
      brands: c.brand_names ? c.brand_names.split(',').map((name: string, i: number) => ({
        id: parseInt(c.brand_ids.split(',')[i]),
        name
      })) : []
    }));

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brand collaborations' });
  }
});

// Create brand
router.post('/', async (req, res) => {
  try {
    const { name, logo_url, industry, description, website } = req.body;

    const result = await run(
      'INSERT INTO brands (name, logo_url, industry, description, website) VALUES (?, ?, ?, ?, ?)',
      [name, logo_url, industry, description, website]
    );

    const brand = await get('SELECT * FROM brands WHERE id = ?', [(result as any).lastID]);
    res.status(201).json(brand);
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint')) {
      res.status(400).json({ error: 'Brand with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create brand' });
    }
  }
});

// Update brand
router.put('/:id', async (req, res) => {
  try {
    const { name, logo_url, industry, description, website } = req.body;

    await run(
      'UPDATE brands SET name = ?, logo_url = ?, industry = ?, description = ?, website = ? WHERE id = ?',
      [name, logo_url, industry, description, website, req.params.id]
    );

    const brand = await get('SELECT * FROM brands WHERE id = ?', [req.params.id]);
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update brand' });
  }
});

// Delete brand
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM brands WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

export default router;
