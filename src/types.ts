export interface Brand {
  id: number
  name: string
  description: string
  created_at: string
}

export interface Retailer {
  id: number
  name: string
  code: string
  created_at: string
}

export interface Product {
  id: number
  sku: string
  name: string
  brand_id: number
  brand_name?: string
  category: string
  subcategory: string
  cogs: number
  wholesale_cost: number
  retailer_srp: number
  created_at: string
}

export interface Sale {
  id: number
  product_id: number
  retailer_id: number
  sale_date: string
  units_sold: number
  revenue: number
  sku?: string
  product_name?: string
  category?: string
  subcategory?: string
  retailer_name?: string
  brand_name?: string
}

export interface Forecast {
  id: number
  year: number
  period_type: string
  period_value: string
  brand_id?: number
  category?: string
  subcategory?: string
  retailer_id?: number
  forecasted_units?: number
  forecasted_revenue: number
  notes?: string
  brand_name?: string
  retailer_name?: string
  created_at: string
}

export interface UploadHistory {
  id: number
  filename: string
  records_imported: number
  upload_date: string
  status: string
  error_message?: string
}

export interface DashboardData {
  salesStats: {
    total_skus_sold: number
    total_units: number
    total_revenue: number
  }
  marginStats: {
    avg_gross_margin: number
    total_margin: number
  }
  forecastStats: {
    total_forecast: number
    forecasted_units: number
  }
  priorYearStats: {
    prior_units: number
    prior_revenue: number
  }
  salesByBrand: Array<{
    brand_name: string
    units_sold: number
    revenue: number
    sku_count: number
  }>
  salesByRetailer: Array<{
    retailer_name: string
    units_sold: number
    revenue: number
    sku_count: number
  }>
}

export interface MarginData {
  label: string
  revenue: number
  gross_margin: number
  margin_percent: number
}
