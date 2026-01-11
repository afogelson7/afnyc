import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { run, all, get } from '../database';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.get('/', async (req, res) => {
  try {
    const { start_date, end_date, retailer_id, product_id } = req.query;

    let query = `
      SELECT s.*, p.sku, p.name as product_name, p.category, p.subcategory,
             r.name as retailer_name, b.name as brand_name
      FROM sales s
      JOIN products p ON s.product_id = p.id
      JOIN retailers r ON s.retailer_id = r.id
      JOIN brands b ON p.brand_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (start_date) {
      query += ' AND s.sale_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND s.sale_date <= ?';
      params.push(end_date);
    }
    if (retailer_id) {
      query += ' AND s.retailer_id = ?';
      params.push(retailer_id);
    }
    if (product_id) {
      query += ' AND s.product_id = ?';
      params.push(product_id);
    }

    query += ' ORDER BY s.sale_date DESC LIMIT 1000';

    const sales = await all(query, params);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    let imported = 0;
    let errors: string[] = [];

    for (const row of data as any[]) {
      try {
        // Expected columns: SKU, Retailer, Date, Units, Revenue
        const sku = row.SKU || row.sku;
        const retailerName = row.Retailer || row.retailer;
        const saleDate = row.Date || row.date;
        const unitsSold = parseInt(row.Units || row.units || '0');
        const revenue = parseFloat(row.Revenue || row.revenue || '0');

        if (!sku || !retailerName || !saleDate) {
          errors.push(`Missing required fields in row: ${JSON.stringify(row)}`);
          continue;
        }

        // Find product by SKU
        const product = await get('SELECT id FROM products WHERE sku = ?', [sku]);
        if (!product) {
          errors.push(`Product not found for SKU: ${sku}`);
          continue;
        }

        // Find or create retailer
        let retailer = await get('SELECT id FROM retailers WHERE name = ?', [retailerName]);
        if (!retailer) {
          const result = await run('INSERT INTO retailers (name) VALUES (?)', [retailerName]);
          retailer = { id: (result as any).lastID };
        }

        // Parse date - handle various Excel date formats
        let parsedDate = saleDate;
        if (typeof saleDate === 'number') {
          // Excel date number
          const excelEpoch = new Date(1899, 11, 30);
          const dateObj = new Date(excelEpoch.getTime() + saleDate * 86400000);
          parsedDate = dateObj.toISOString().split('T')[0];
        } else if (typeof saleDate === 'string') {
          // Try to parse string date
          const dateObj = new Date(saleDate);
          if (!isNaN(dateObj.getTime())) {
            parsedDate = dateObj.toISOString().split('T')[0];
          }
        }

        // Insert sales record
        await run(
          'INSERT INTO sales (product_id, retailer_id, sale_date, units_sold, revenue) VALUES (?, ?, ?, ?, ?)',
          [product.id, retailer.id, parsedDate, unitsSold, revenue]
        );

        imported++;
      } catch (error) {
        errors.push(`Error processing row: ${JSON.stringify(row)} - ${error}`);
      }
    }

    // Log upload history
    await run(
      'INSERT INTO upload_history (filename, records_imported, status, error_message) VALUES (?, ?, ?, ?)',
      [req.file.originalname, imported, errors.length > 0 ? 'partial' : 'success', errors.join('; ')]
    );

    res.json({
      success: true,
      imported,
      total: data.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process upload', details: String(error) });
  }
});

router.get('/upload-history', async (req, res) => {
  try {
    const history = await all('SELECT * FROM upload_history ORDER BY upload_date DESC LIMIT 20');
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upload history' });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (start_date && end_date) {
      await run('DELETE FROM sales WHERE sale_date >= ? AND sale_date <= ?', [start_date, end_date]);
      res.json({ message: 'Sales data deleted' });
    } else {
      res.status(400).json({ error: 'Please provide start_date and end_date' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete sales data' });
  }
});

export default router;
