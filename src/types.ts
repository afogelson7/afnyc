export interface Product {
  id: number
  sku: string
  name: string
  category: string
  cost_price: number
  retail_price: number
  supplier: string
  created_at: string
}

export interface Budget {
  id: number
  category: string
  period: string
  allocated_amount: number
  spent_amount: number
  notes: string
  created_at: string
}

export interface PurchaseOrder {
  id: number
  po_number: string
  supplier: string
  order_date: string
  expected_delivery: string
  status: string
  total_cost: number
  notes: string
  created_at: string
  items?: POItem[]
}

export interface POItem {
  id: number
  po_id: number
  product_id: number
  quantity: number
  unit_cost: number
  name?: string
  sku?: string
}

export interface DashboardData {
  productStats: {
    total_products: number
    avg_margin: number
  }
  budgetStats: {
    total_allocated: number
    total_spent: number
  }
  poStats: {
    total_orders: number
    pending_orders: number
    total_po_value: number
  }
  budgetsByCategory: Array<{
    category: string
    allocated: number
    spent: number
  }>
  recentOrders: PurchaseOrder[]
}
