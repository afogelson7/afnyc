import express from 'express';
import { run, all, get } from '../database';

const router = express.Router();

// Get all collaborations with filters
router.get('/', async (req, res) => {
  try {
    const {
      date,
      type,
      brand_id,
      search,
      limit = 50,
      offset = 0,
      start_date,
      end_date
    } = req.query;

    let query = `
      SELECT c.*,
        GROUP_CONCAT(DISTINCT b.name) as brand_names,
        GROUP_CONCAT(DISTINCT b.id) as brand_ids,
        GROUP_CONCAT(DISTINCT b.logo_url) as brand_logos
      FROM collaborations c
      LEFT JOIN collaboration_brands cb ON c.id = cb.collaboration_id
      LEFT JOIN brands b ON cb.brand_id = b.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (date) {
      conditions.push('DATE(c.published_date) = DATE(?)');
      params.push(date);
    }

    if (start_date && end_date) {
      conditions.push('DATE(c.published_date) BETWEEN DATE(?) AND DATE(?)');
      params.push(start_date, end_date);
    }

    if (type) {
      conditions.push('c.collaboration_type = ?');
      params.push(type);
    }

    if (brand_id) {
      conditions.push('c.id IN (SELECT collaboration_id FROM collaboration_brands WHERE brand_id = ?)');
      params.push(brand_id);
    }

    if (search) {
      conditions.push('(c.title LIKE ? OR c.summary LIKE ? OR b.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` GROUP BY c.id ORDER BY c.published_date DESC, c.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const collaborations = await all(query, params);

    // Parse brand data into arrays
    const parsed = (collaborations as any[]).map(c => ({
      ...c,
      brands: c.brand_names ? c.brand_names.split(',').map((name: string, i: number) => ({
        id: parseInt(c.brand_ids.split(',')[i]),
        name,
        logo_url: c.brand_logos?.split(',')[i] || null
      })) : []
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    res.status(500).json({ error: 'Failed to fetch collaborations' });
  }
});

// Get collaboration types for filters
router.get('/types', async (req, res) => {
  try {
    const types = await all('SELECT DISTINCT collaboration_type FROM collaborations ORDER BY collaboration_type');
    res.json((types as any[]).map(t => t.collaboration_type));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch collaboration types' });
  }
});

// Get dates that have collaborations (for calendar/navigation)
router.get('/dates', async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = `
      SELECT DATE(published_date) as date, COUNT(*) as count
      FROM collaborations
    `;
    const params: any[] = [];

    if (year) {
      query += ' WHERE strftime("%Y", published_date) = ?';
      params.push(year);

      if (month) {
        query += ' AND strftime("%m", published_date) = ?';
        params.push(month.toString().padStart(2, '0'));
      }
    }

    query += ' GROUP BY DATE(published_date) ORDER BY date DESC';

    const dates = await all(query, params);
    res.json(dates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dates' });
  }
});

// Get single collaboration by ID
router.get('/:id', async (req, res) => {
  try {
    const collaboration = await get('SELECT * FROM collaborations WHERE id = ?', [req.params.id]);
    if (!collaboration) {
      return res.status(404).json({ error: 'Collaboration not found' });
    }

    // Get associated brands
    const brands = await all(`
      SELECT b.*, cb.role
      FROM brands b
      JOIN collaboration_brands cb ON b.id = cb.brand_id
      WHERE cb.collaboration_id = ?
    `, [req.params.id]);

    // Get associated tags
    const tags = await all(`
      SELECT t.*
      FROM tags t
      JOIN collaboration_tags ct ON t.id = ct.tag_id
      WHERE ct.collaboration_id = ?
    `, [req.params.id]);

    res.json({ ...collaboration, brands, tags });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch collaboration' });
  }
});

// Create collaboration
router.post('/', async (req, res) => {
  try {
    const {
      title,
      summary,
      detailed_description,
      source_url,
      source_name,
      image_url,
      published_date,
      collaboration_type,
      brand_ids = [],
      tag_ids = []
    } = req.body;

    // Insert collaboration
    const result = await run(
      `INSERT INTO collaborations
        (title, summary, detailed_description, source_url, source_name, image_url, published_date, collaboration_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, summary, detailed_description, source_url, source_name, image_url, published_date, collaboration_type]
    );

    const collaborationId = (result as any).lastID;

    // Link brands
    for (const brandId of brand_ids) {
      await run(
        'INSERT INTO collaboration_brands (collaboration_id, brand_id) VALUES (?, ?)',
        [collaborationId, brandId]
      );
    }

    // Link tags
    for (const tagId of tag_ids) {
      await run(
        'INSERT INTO collaboration_tags (collaboration_id, tag_id) VALUES (?, ?)',
        [collaborationId, tagId]
      );
    }

    // Fetch the created collaboration with brands
    const collaboration = await get('SELECT * FROM collaborations WHERE id = ?', [collaborationId]);
    const brands = await all(`
      SELECT b.* FROM brands b
      JOIN collaboration_brands cb ON b.id = cb.brand_id
      WHERE cb.collaboration_id = ?
    `, [collaborationId]);

    res.status(201).json({ ...collaboration, brands });
  } catch (error) {
    console.error('Error creating collaboration:', error);
    res.status(500).json({ error: 'Failed to create collaboration' });
  }
});

// Update collaboration
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      summary,
      detailed_description,
      source_url,
      source_name,
      image_url,
      published_date,
      collaboration_type,
      status,
      brand_ids = [],
      tag_ids = []
    } = req.body;

    await run(
      `UPDATE collaborations SET
        title = ?, summary = ?, detailed_description = ?, source_url = ?,
        source_name = ?, image_url = ?, published_date = ?, collaboration_type = ?, status = ?
        WHERE id = ?`,
      [title, summary, detailed_description, source_url, source_name, image_url,
       published_date, collaboration_type, status, req.params.id]
    );

    // Update brand links
    await run('DELETE FROM collaboration_brands WHERE collaboration_id = ?', [req.params.id]);
    for (const brandId of brand_ids) {
      await run(
        'INSERT INTO collaboration_brands (collaboration_id, brand_id) VALUES (?, ?)',
        [req.params.id, brandId]
      );
    }

    // Update tag links
    await run('DELETE FROM collaboration_tags WHERE collaboration_id = ?', [req.params.id]);
    for (const tagId of tag_ids) {
      await run(
        'INSERT INTO collaboration_tags (collaboration_id, tag_id) VALUES (?, ?)',
        [req.params.id, tagId]
      );
    }

    const collaboration = await get('SELECT * FROM collaborations WHERE id = ?', [req.params.id]);
    res.json(collaboration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update collaboration' });
  }
});

// Delete collaboration
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM collaborations WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete collaboration' });
  }
});

// Get stats/analytics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalCollaborations = await get('SELECT COUNT(*) as count FROM collaborations');
    const totalBrands = await get('SELECT COUNT(*) as count FROM brands');
    const thisMonth = await get(`
      SELECT COUNT(*) as count FROM collaborations
      WHERE strftime('%Y-%m', published_date) = strftime('%Y-%m', 'now')
    `);
    const byType = await all(`
      SELECT collaboration_type, COUNT(*) as count
      FROM collaborations
      GROUP BY collaboration_type
      ORDER BY count DESC
    `);

    res.json({
      total_collaborations: (totalCollaborations as any)?.count || 0,
      total_brands: (totalBrands as any)?.count || 0,
      this_month: (thisMonth as any)?.count || 0,
      by_type: byType
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
