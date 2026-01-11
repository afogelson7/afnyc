const API_BASE = '/api'

export const api = {
  products: {
    getAll: () => fetch(`${API_BASE}/products`).then(r => r.json()),
    get: (id: number) => fetch(`${API_BASE}/products/${id}`).then(r => r.json()),
    create: (data: any) => fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    update: (id: number, data: any) => fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    delete: (id: number) => fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' })
  },
  budgets: {
    getAll: () => fetch(`${API_BASE}/budgets`).then(r => r.json()),
    get: (id: number) => fetch(`${API_BASE}/budgets/${id}`).then(r => r.json()),
    create: (data: any) => fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    update: (id: number, data: any) => fetch(`${API_BASE}/budgets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    delete: (id: number) => fetch(`${API_BASE}/budgets/${id}`, { method: 'DELETE' })
  },
  purchaseOrders: {
    getAll: () => fetch(`${API_BASE}/purchase-orders`).then(r => r.json()),
    get: (id: number) => fetch(`${API_BASE}/purchase-orders/${id}`).then(r => r.json()),
    create: (data: any) => fetch(`${API_BASE}/purchase-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    update: (id: number, data: any) => fetch(`${API_BASE}/purchase-orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    delete: (id: number) => fetch(`${API_BASE}/purchase-orders/${id}`, { method: 'DELETE' })
  },
  analytics: {
    getDashboard: () => fetch(`${API_BASE}/analytics/dashboard`).then(r => r.json())
  }
}
