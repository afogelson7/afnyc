import express from 'express';
import { all } from '../database';

const router = express.Router();

// Main dashboard with overview stats
router.get('/dashboard', async (req, res) => {
  try {
    const { year, period_type } = req.query;
    const currentYear = year || new Date().getFullYear();

    // Total revenue and units
    const [salesStats] = await all(`
      SELECT
        COUNT(DISTINCT s.product_id) as total_skus_sold,
        SUM(s.units_sold) as total_units,
        SUM(s.revenue) as total_revenue
      FROM sales s
      WHERE strftime('%Y', s.sale_date) = ?
    `, [currentYear.toString()]);

    // Margin analysis
    const [marginStats] = await all(`
      SELECT
        AVG(s.revenue - (p.cogs * s.units_sold)) as avg_gross_margin,
        SUM(s.revenue - (p.cogs * s.units_sold)) as total_margin
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE strftime('%Y', s.sale_date) = ?
    `, [currentYear.toString()]);

    // Forecast comparison
    const [forecastStats] = await all(`
      SELECT
        SUM(forecasted_revenue) as total_forecast,
        SUM(forecasted_units) as forecasted_units
      FROM forecasts
      WHERE year = ?
    `, [currentYear]);

    // Prior year comparison
    const [priorYearStats] = await all(`
      SELECT
        SUM(s.units_sold) as prior_units,
        SUM(s.revenue) as prior_revenue
      FROM sales s
      WHERE strftime('%Y', s.sale_date) = ?
    `, [(parseInt(currentYear.toString()) - 1).toString()]);

    // Sales by brand
    const salesByBrand = await all(`
      SELECT
        b.name as brand_name,
        SUM(s.units_sold) as units_sold,
        SUM(s.revenue) as revenue,
        COUNT(DISTINCT s.product_id) as sku_count
      FROM sales s
      JOIN products p ON s.product_id = p.id
      JOIN brands b ON p.brand_id = b.id
      WHERE strftime('%Y', s.sale_date) = ?
      GROUP BY b.id, b.name
      ORDER BY revenue DESC
    `, [currentYear.toString()]);

    // Sales by retailer
    const salesByRetailer = await all(`
      SELECT
        r.name as retailer_name,
        SUM(s.units_sold) as units_sold,
        SUM(s.revenue) as revenue,
        COUNT(DISTINCT s.product_id) as sku_count
      FROM sales s
      JOIN retailers r ON s.retailer_id = r.id
      WHERE strftime('%Y', s.sale_date) = ?
      GROUP BY r.id, r.name
      ORDER BY revenue DESC
    `, [currentYear.toString()]);

    res.json({
      salesStats: salesStats || {},
      marginStats: marginStats || {},
      forecastStats: forecastStats || {},
      priorYearStats: priorYearStats || {},
      salesByBrand,
      salesByRetailer
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Sales by category and subcategory
router.get('/by-category', async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    const categoryData = await all(`
      SELECT
        p.category,
        p.subcategory,
        SUM(s.units_sold) as units_sold,
        SUM(s.revenue) as revenue,
        SUM(s.revenue - (p.cogs * s.units_sold)) as margin,
        COUNT(DISTINCT s.product_id) as sku_count
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE strftime('%Y', s.sale_date) = ?
      GROUP BY p.category, p.subcategory
      ORDER BY revenue DESC
    `, [currentYear.toString()]);

    res.json(categoryData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category analytics' });
  }
});

// Margin analysis by various dimensions
router.get('/margins', async (req, res) => {
  try {
    const { year, dimension } = req.query;
    const currentYear = year || new Date().getFullYear();

    let query = '';
    let groupBy = '';

    switch (dimension) {
      case 'brand':
        groupBy = 'b.id, b.name';
        query = `
          SELECT
            b.name as label,
            SUM(s.revenue) as revenue,
            SUM(s.revenue - (p.cogs * s.units_sold)) as gross_margin,
            (SUM(s.revenue - (p.cogs * s.units_sold)) / SUM(s.revenue) * 100) as margin_percent
          FROM sales s
          JOIN products p ON s.product_id = p.id
          JOIN brands b ON p.brand_id = b.id
          WHERE strftime('%Y', s.sale_date) = ?
          GROUP BY ${groupBy}
          ORDER BY revenue DESC
        `;
        break;
      case 'retailer':
        groupBy = 'r.id, r.name';
        query = `
          SELECT
            r.name as label,
            SUM(s.revenue) as revenue,
            SUM(s.revenue - (p.cogs * s.units_sold)) as gross_margin,
            (SUM(s.revenue - (p.cogs * s.units_sold)) / SUM(s.revenue) * 100) as margin_percent
          FROM sales s
          JOIN products p ON s.product_id = p.id
          JOIN retailers r ON s.retailer_id = r.id
          WHERE strftime('%Y', s.sale_date) = ?
          GROUP BY ${groupBy}
          ORDER BY revenue DESC
        `;
        break;
      case 'category':
        groupBy = 'p.category';
        query = `
          SELECT
            p.category as label,
            SUM(s.revenue) as revenue,
            SUM(s.revenue - (p.cogs * s.units_sold)) as gross_margin,
            (SUM(s.revenue - (p.cogs * s.units_sold)) / SUM(s.revenue) * 100) as margin_percent
          FROM sales s
          JOIN products p ON s.product_id = p.id
          WHERE strftime('%Y', s.sale_date) = ?
          GROUP BY ${groupBy}
          ORDER BY revenue DESC
        `;
        break;
      case 'subcategory':
        groupBy = 'p.category, p.subcategory';
        query = `
          SELECT
            p.category || ' - ' || p.subcategory as label,
            SUM(s.revenue) as revenue,
            SUM(s.revenue - (p.cogs * s.units_sold)) as gross_margin,
            (SUM(s.revenue - (p.cogs * s.units_sold)) / SUM(s.revenue) * 100) as margin_percent
          FROM sales s
          JOIN products p ON s.product_id = p.id
          WHERE strftime('%Y', s.sale_date) = ?
          GROUP BY ${groupBy}
          ORDER BY revenue DESC
        `;
        break;
      default:
        return res.status(400).json({ error: 'Invalid dimension' });
    }

    const margins = await all(query, [currentYear.toString()]);
    res.json(margins);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch margin analytics' });
  }
});

// Actual vs Forecast vs Prior Year
router.get('/performance', async (req, res) => {
  try {
    const { year, period_type, group_by } = req.query;
    const currentYear = parseInt(year as string) || new Date().getFullYear();
    const priorYear = currentYear - 1;

    // Monthly performance
    if (period_type === 'monthly') {
      const months = [];
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');

        const [currentSales] = await all(`
          SELECT SUM(revenue) as revenue, SUM(units_sold) as units
          FROM sales
          WHERE strftime('%Y', sale_date) = ? AND strftime('%m', sale_date) = ?
        `, [currentYear.toString(), monthStr]);

        const [priorSales] = await all(`
          SELECT SUM(revenue) as revenue, SUM(units_sold) as units
          FROM sales
          WHERE strftime('%Y', sale_date) = ? AND strftime('%m', sale_date) = ?
        `, [priorYear.toString(), monthStr]);

        const [forecast] = await all(`
          SELECT SUM(forecasted_revenue) as revenue, SUM(forecasted_units) as units
          FROM forecasts
          WHERE year = ? AND period_type = 'monthly' AND period_value = ?
        `, [currentYear, monthStr]);

        months.push({
          month: monthStr,
          actual: currentSales || { revenue: 0, units: 0 },
          prior_year: priorSales || { revenue: 0, units: 0 },
          forecast: forecast || { revenue: 0, units: 0 }
        });
      }

      res.json(months);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Performance error:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

export default router;
