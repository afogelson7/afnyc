import { useState, useEffect } from 'react'
import { api } from '../api'
import { DashboardData } from '../types'

export default function SalesDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadDashboard()
  }, [year])

  const loadDashboard = async () => {
    try {
      const dashboardData = await api.analytics.getDashboard({ year })
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

  const { salesStats, marginStats, forecastStats, priorYearStats, salesByBrand, salesByRetailer } = data

  const vsForcast = forecastStats.total_forecast > 0
    ? ((salesStats.total_revenue / forecastStats.total_forecast - 1) * 100).toFixed(1)
    : '0'

  const vsPriorYear = priorYearStats.prior_revenue > 0
    ? ((salesStats.total_revenue / priorYearStats.prior_revenue - 1) * 100).toFixed(1)
    : '0'

  const marginPercent = salesStats.total_revenue > 0
    ? ((marginStats.total_margin / salesStats.total_revenue) * 100).toFixed(1)
    : '0'

  return (
    <div className="section">
      <div className="section-header">
        <h2>Sales Performance Dashboard</h2>
        <div className="year-selector">
          <label>Year: </label>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {[2026, 2025, 2024, 2023].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">${(salesStats.total_revenue || 0).toLocaleString()}</p>
            <p className="stat-label">
              {salesStats.total_units?.toLocaleString()} units | {salesStats.total_skus_sold} SKUs
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Gross Margin</h3>
            <p className="stat-value">${(marginStats.total_margin || 0).toLocaleString()}</p>
            <p className="stat-label">
              {marginPercent}% margin rate
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>vs Forecast</h3>
            <p className={`stat-value ${parseFloat(vsForcast) >= 0 ? 'profit' : 'over-budget'}`}>
              {parseFloat(vsForcast) >= 0 ? '+' : ''}{vsForcast}%
            </p>
            <p className="stat-label">
              Forecast: ${(forecastStats.total_forecast || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>vs Prior Year</h3>
            <p className={`stat-value ${parseFloat(vsPriorYear) >= 0 ? 'profit' : 'over-budget'}`}>
              {parseFloat(vsPriorYear) >= 0 ? '+' : ''}{vsPriorYear}%
            </p>
            <p className="stat-label">
              {year - 1}: ${(priorYearStats.prior_revenue || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-card">
          <h3>Sales by Brand</h3>
          <div className="sales-breakdown">
            {salesByBrand.map(brand => (
              <div key={brand.brand_name} className="breakdown-item">
                <div className="breakdown-header">
                  <strong>{brand.brand_name}</strong>
                  <span className="breakdown-revenue">${brand.revenue.toLocaleString()}</span>
                </div>
                <div className="breakdown-details">
                  <span>{brand.units_sold.toLocaleString()} units</span>
                  <span>{brand.sku_count} SKUs</span>
                </div>
              </div>
            ))}
          </div>
          {salesByBrand.length === 0 && (
            <p className="empty-state-small">No sales data yet</p>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Sales by Retailer</h3>
          <div className="sales-breakdown">
            {salesByRetailer.map(retailer => (
              <div key={retailer.retailer_name} className="breakdown-item">
                <div className="breakdown-header">
                  <strong>{retailer.retailer_name}</strong>
                  <span className="breakdown-revenue">${retailer.revenue.toLocaleString()}</span>
                </div>
                <div className="breakdown-details">
                  <span>{retailer.units_sold.toLocaleString()} units</span>
                  <span>{retailer.sku_count} SKUs</span>
                </div>
              </div>
            ))}
          </div>
          {salesByRetailer.length === 0 && (
            <p className="empty-state-small">No sales data yet</p>
          )}
        </div>
      </div>

      <div className="quick-actions">
        <h3>Getting Started</h3>
        <p className="help-text">
          <ul>
            <li><strong>Setup:</strong> Add your brands, retailers, and product catalog</li>
            <li><strong>Upload Sales:</strong> Import Excel files with sales data</li>
            <li><strong>Forecasts:</strong> Create budgets and forecasts to track against</li>
            <li><strong>Analytics:</strong> View detailed performance breakdowns and margin analysis</li>
          </ul>
        </p>
      </div>
    </div>
  )
}
