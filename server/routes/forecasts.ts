import express from 'express';
import { run, all, get } from '../database';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { year, period_type, brand_id, category, retailer_id } = req.query;

    let query = `
      SELECT f.*, b.name as brand_name, r.name as retailer_name
      FROM forecasts f
      LEFT JOIN brands b ON f.brand_id = b.id
      LEFT JOIN retailers r ON f.retailer_id = r.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (year) {
      query += ' AND f.year = ?';
      params.push(year);
    }
    if (period_type) {
      query += ' AND f.period_type = ?';
      params.push(period_type);
    }
    if (brand_id) {
      query += ' AND f.brand_id = ?';
      params.push(brand_id);
    }
    if (category) {
      query += ' AND f.category = ?';
      params.push(category);
    }
    if (retailer_id) {
      query += ' AND f.retailer_id = ?';
      params.push(retailer_id);
    }

    query += ' ORDER BY f.year DESC, f.period_value';

    const forecasts = await all(query, params);
    res.json(forecasts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecasts' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const forecast = await get(`
      SELECT f.*, b.name as brand_name, r.name as retailer_name
      FROM forecasts f
      LEFT JOIN brands b ON f.brand_id = b.id
      LEFT JOIN retailers r ON f.retailer_id = r.id
      WHERE f.id = ?
    `, [req.params.id]);

    if (!forecast) {
      return res.status(404).json({ error: 'Forecast not found' });
    }
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      year,
      period_type,
      period_value,
      brand_id,
      category,
      subcategory,
      retailer_id,
      forecasted_units,
      forecasted_revenue,
      notes
    } = req.body;

    const result = await run(
      `INSERT INTO forecasts
       (year, period_type, period_value, brand_id, category, subcategory, retailer_id, forecasted_units, forecasted_revenue, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [year, period_type, period_value, brand_id, category, subcategory, retailer_id, forecasted_units, forecasted_revenue, notes]
    );

    const forecast = await get(`
      SELECT f.*, b.name as brand_name, r.name as retailer_name
      FROM forecasts f
      LEFT JOIN brands b ON f.brand_id = b.id
      LEFT JOIN retailers r ON f.retailer_id = r.id
      WHERE f.id = ?
    `, [(result as any).lastID]);

    res.status(201).json(forecast);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create forecast' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const {
      year,
      period_type,
      period_value,
      brand_id,
      category,
      subcategory,
      retailer_id,
      forecasted_units,
      forecasted_revenue,
      notes
    } = req.body;

    await run(
      `UPDATE forecasts
       SET year = ?, period_type = ?, period_value = ?, brand_id = ?, category = ?, subcategory = ?,
           retailer_id = ?, forecasted_units = ?, forecasted_revenue = ?, notes = ?
       WHERE id = ?`,
      [year, period_type, period_value, brand_id, category, subcategory, retailer_id, forecasted_units, forecasted_revenue, notes, req.params.id]
    );

    const forecast = await get(`
      SELECT f.*, b.name as brand_name, r.name as retailer_name
      FROM forecasts f
      LEFT JOIN brands b ON f.brand_id = b.id
      LEFT JOIN retailers r ON f.retailer_id = r.id
      WHERE f.id = ?
    `, [req.params.id]);

    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update forecast' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM forecasts WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete forecast' });
  }
});

export default router;
