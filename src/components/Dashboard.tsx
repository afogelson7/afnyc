import { useState, useEffect } from 'react'
import { api } from '../api'
import { DashboardData } from '../types'

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const dashboardData = await api.analytics.getDashboard()
      setData(dashboardData)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  if (!data) {
    return <div className="error">Failed to load dashboard data</div>
  }

  const budgetUtilization = data.budgetStats.total_allocated > 0
    ? ((data.budgetStats.total_spent / data.budgetStats.total_allocated) * 100).toFixed(1)
    : '0'

  return (
    <div className="section">
      <h2>Financial Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Products</h3>
            <p className="stat-value">{data.productStats.total_products || 0}</p>
            <p className="stat-label">
              Avg Margin: ${(data.productStats.avg_margin || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Budget Overview</h3>
            <p className="stat-value">${(data.budgetStats.total_allocated || 0).toLocaleString()}</p>
            <p className="stat-label">
              Spent: ${(data.budgetStats.total_spent || 0).toLocaleString()} ({budgetUtilization}%)
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Purchase Orders</h3>
            <p className="stat-value">{data.poStats.total_orders || 0}</p>
            <p className="stat-label">
              Pending: {data.poStats.pending_orders || 0} | Value: ${(data.poStats.total_po_value || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Budget Remaining</h3>
            <p className="stat-value profit">
              ${((data.budgetStats.total_allocated || 0) - (data.budgetStats.total_spent || 0)).toLocaleString()}
            </p>
            <p className="stat-label">Available for planning</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-card">
          <h3>Budget by Category</h3>
          <div className="category-budgets">
            {data.budgetsByCategory.map(cat => {
              const utilization = cat.allocated > 0 ? ((cat.spent / cat.allocated) * 100).toFixed(1) : '0'
              return (
                <div key={cat.category} className="category-budget-item">
                  <div className="category-header">
                    <span className="category-name">{cat.category}</span>
                    <span className="category-amount">${cat.allocated.toLocaleString()}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${parseFloat(utilization) > 100 ? 'over-budget' : ''}`}
                      style={{ width: `${Math.min(parseFloat(utilization), 100)}%` }}
                    />
                  </div>
                  <div className="category-stats">
                    <span>Spent: ${cat.spent.toLocaleString()}</span>
                    <span>{utilization}% used</span>
                  </div>
                </div>
              )
            })}
          </div>
          {data.budgetsByCategory.length === 0 && (
            <p className="empty-state-small">No budgets created yet</p>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Recent Purchase Orders</h3>
          <div className="recent-orders">
            {data.recentOrders.map(order => (
              <div key={order.id} className="recent-order-item">
                <div className="order-header">
                  <strong>{order.po_number}</strong>
                  <span className={`badge status-${order.status}`}>{order.status}</span>
                </div>
                <div className="order-details">
                  <span>{order.supplier}</span>
                  <span className="order-cost">${order.total_cost.toLocaleString()}</span>
                </div>
                <div className="order-date">
                  {new Date(order.order_date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
          {data.recentOrders.length === 0 && (
            <p className="empty-state-small">No purchase orders yet</p>
          )}
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <p className="help-text">
          Use the navigation above to:
          <ul>
            <li><strong>Products:</strong> Manage your product catalog with SKUs, pricing, and margins</li>
            <li><strong>Budgets:</strong> Plan and track spending by category and period</li>
            <li><strong>Purchase Orders:</strong> Create and manage inventory orders with suppliers</li>
          </ul>
        </p>
      </div>
    </div>
  )
}
