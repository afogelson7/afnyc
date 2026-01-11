import { useState, useEffect } from 'react'
import { api } from '../api'
import { Budget } from '../types'

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [formData, setFormData] = useState({
    category: '',
    period: '',
    allocated_amount: '',
    spent_amount: '0',
    notes: ''
  })

  useEffect(() => {
    loadBudgets()
  }, [])

  const loadBudgets = async () => {
    const data = await api.budgets.getAll()
    setBudgets(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      ...formData,
      allocated_amount: parseFloat(formData.allocated_amount),
      spent_amount: parseFloat(formData.spent_amount)
    }

    if (editingBudget) {
      await api.budgets.update(editingBudget.id, data)
    } else {
      await api.budgets.create(data)
    }

    setFormData({ category: '', period: '', allocated_amount: '', spent_amount: '0', notes: '' })
    setEditingBudget(null)
    setShowForm(false)
    loadBudgets()
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setFormData({
      category: budget.category,
      period: budget.period,
      allocated_amount: budget.allocated_amount.toString(),
      spent_amount: budget.spent_amount.toString(),
      notes: budget.notes
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      await api.budgets.delete(id)
      loadBudgets()
    }
  }

  const getUtilization = (allocated: number, spent: number) => {
    return ((spent / allocated) * 100).toFixed(1)
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2>Budget Planning</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Budget'}
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editingBudget ? 'Edit Budget' : 'New Budget'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select...</option>
                <option value="Skincare">Skincare</option>
                <option value="Makeup">Makeup</option>
                <option value="Haircare">Haircare</option>
                <option value="Fragrance">Fragrance</option>
                <option value="Tools">Tools</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div className="form-group">
              <label>Period</label>
              <select
                value={formData.period}
                onChange={e => setFormData({ ...formData, period: e.target.value })}
                required
              >
                <option value="">Select...</option>
                <option value="Q1 2026">Q1 2026</option>
                <option value="Q2 2026">Q2 2026</option>
                <option value="Q3 2026">Q3 2026</option>
                <option value="Q4 2026">Q4 2026</option>
                <option value="2026">Full Year 2026</option>
              </select>
            </div>
            <div className="form-group">
              <label>Allocated Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.allocated_amount}
                onChange={e => setFormData({ ...formData, allocated_amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Spent Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.spent_amount}
                onChange={e => setFormData({ ...formData, spent_amount: e.target.value })}
              />
            </div>
            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            {editingBudget ? 'Update Budget' : 'Create Budget'}
          </button>
        </form>
      )}

      <div className="budget-grid">
        {budgets.map(budget => {
          const utilization = parseFloat(getUtilization(budget.allocated_amount, budget.spent_amount))
          const remaining = budget.allocated_amount - budget.spent_amount

          return (
            <div key={budget.id} className="budget-card">
              <div className="budget-header">
                <div>
                  <h3>{budget.category}</h3>
                  <p className="budget-period">{budget.period}</p>
                </div>
                <div className="action-buttons">
                  <button className="btn-small" onClick={() => handleEdit(budget)}>Edit</button>
                  <button className="btn-small btn-danger" onClick={() => handleDelete(budget.id)}>Delete</button>
                </div>
              </div>

              <div className="budget-amounts">
                <div className="amount-item">
                  <span className="label">Allocated</span>
                  <span className="value">${budget.allocated_amount.toLocaleString()}</span>
                </div>
                <div className="amount-item">
                  <span className="label">Spent</span>
                  <span className="value spent">${budget.spent_amount.toLocaleString()}</span>
                </div>
                <div className="amount-item">
                  <span className="label">Remaining</span>
                  <span className={`value ${remaining < 0 ? 'over-budget' : 'profit'}`}>
                    ${remaining.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="progress-bar">
                <div
                  className={`progress-fill ${utilization > 100 ? 'over-budget' : ''}`}
                  style={{ width: `${Math.min(utilization, 100)}%` }}
                />
              </div>
              <p className="utilization">{utilization}% utilized</p>

              {budget.notes && <p className="budget-notes">{budget.notes}</p>}
            </div>
          )
        })}
      </div>

      {budgets.length === 0 && (
        <div className="empty-state">No budgets yet. Create your first budget to start planning!</div>
      )}
    </div>
  )
}
