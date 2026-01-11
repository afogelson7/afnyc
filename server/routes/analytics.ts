import express from 'express';
import { all } from '../database';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const [productStats] = await all('SELECT COUNT(*) as total_products, AVG(retail_price - cost_price) as avg_margin FROM products');

    const [budgetStats] = await all('SELECT SUM(allocated_amount) as total_allocated, SUM(spent_amount) as total_spent FROM budgets');

    const [poStats] = await all(`
      SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(total_cost) as total_po_value
      FROM purchase_orders
    `);

    const budgetsByCategory = await all(`
      SELECT category, SUM(allocated_amount) as allocated, SUM(spent_amount) as spent
      FROM budgets
      GROUP BY category
    `);

    const recentOrders = await all(`
      SELECT * FROM purchase_orders
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({
      productStats,
      budgetStats,
      poStats,
      budgetsByCategory,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
