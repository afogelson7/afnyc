import express from 'express';
import { run, all, get } from '../database';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const budgets = await all('SELECT * FROM budgets ORDER BY created_at DESC');
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const budget = await get('SELECT * FROM budgets WHERE id = ?', [req.params.id]);
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { category, period, allocated_amount, notes } = req.body;

    const result = await run(
      'INSERT INTO budgets (category, period, allocated_amount, notes) VALUES (?, ?, ?, ?)',
      [category, period, allocated_amount, notes]
    );

    const budget = await get('SELECT * FROM budgets WHERE id = ?', [(result as any).lastID]);
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { category, period, allocated_amount, spent_amount, notes } = req.body;

    await run(
      'UPDATE budgets SET category = ?, period = ?, allocated_amount = ?, spent_amount = ?, notes = ? WHERE id = ?',
      [category, period, allocated_amount, spent_amount, notes, req.params.id]
    );

    const budget = await get('SELECT * FROM budgets WHERE id = ?', [req.params.id]);
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM budgets WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

export default router;
