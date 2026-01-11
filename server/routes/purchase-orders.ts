import express from 'express';
import { run, all, get } from '../database';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const orders = await all(`
      SELECT po.*,
        GROUP_CONCAT(p.name) as product_names,
        COUNT(poi.id) as item_count
      FROM purchase_orders po
      LEFT JOIN po_items poi ON po.id = poi.po_id
      LEFT JOIN products p ON poi.product_id = p.id
      GROUP BY po.id
      ORDER BY po.created_at DESC
    `);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await get('SELECT * FROM purchase_orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    const items = await all(`
      SELECT poi.*, p.name, p.sku
      FROM po_items poi
      JOIN products p ON poi.product_id = p.id
      WHERE poi.po_id = ?
    `, [req.params.id]);

    res.json({ ...order, items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchase order' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { po_number, supplier, order_date, expected_delivery, status, total_cost, notes, items } = req.body;

    const result = await run(
      'INSERT INTO purchase_orders (po_number, supplier, order_date, expected_delivery, status, total_cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [po_number, supplier, order_date, expected_delivery, status || 'pending', total_cost, notes]
    );

    const poId = (result as any).lastID;

    if (items && items.length > 0) {
      for (const item of items) {
        await run(
          'INSERT INTO po_items (po_id, product_id, quantity, unit_cost) VALUES (?, ?, ?, ?)',
          [poId, item.product_id, item.quantity, item.unit_cost]
        );
      }
    }

    const order = await get('SELECT * FROM purchase_orders WHERE id = ?', [poId]);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { po_number, supplier, order_date, expected_delivery, status, total_cost, notes } = req.body;

    await run(
      'UPDATE purchase_orders SET po_number = ?, supplier = ?, order_date = ?, expected_delivery = ?, status = ?, total_cost = ?, notes = ? WHERE id = ?',
      [po_number, supplier, order_date, expected_delivery, status, total_cost, notes, req.params.id]
    );

    const order = await get('SELECT * FROM purchase_orders WHERE id = ?', [req.params.id]);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update purchase order' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM po_items WHERE po_id = ?', [req.params.id]);
    await run('DELETE FROM purchase_orders WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete purchase order' });
  }
});

export default router;
