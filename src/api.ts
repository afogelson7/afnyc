const API_BASE = '/api'

export const api = {
  brands: {
    getAll: () => fetch(`${API_BASE}/brands`).then(r => r.json()),
    get: (id: number) => fetch(`${API_BASE}/brands/${id}`).then(r => r.json()),
    create: (data: any) => fetch(`${API_BASE}/brands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    update: (id: number, data: any) => fetch(`${API_BASE}/brands/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    delete: (id: number) => fetch(`${API_BASE}/brands/${id}`, { method: 'DELETE' })
  },
  retailers: {
    getAll: () => fetch(`${API_BASE}/retailers`).then(r => r.json()),
    get: (id: number) => fetch(`${API_BASE}/retailers/${id}`).then(r => r.json()),
    create: (data: any) => fetch(`${API_BASE}/retailers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    update: (id: number, data: any) => fetch(`${API_BASE}/retailers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    delete: (id: number) => fetch(`${API_BASE}/retailers/${id}`, { method: 'DELETE' })
  },
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
  sales: {
    getAll: (params?: any) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetch(`${API_BASE}/sales${query}`).then(r => r.json());
    },
    uploadExcel: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch(`${API_BASE}/sales/upload`, {
        method: 'POST',
        body: formData
      }).then(r => r.json());
    },
    getUploadHistory: () => fetch(`${API_BASE}/sales/upload-history`).then(r => r.json()),
    deleteRange: (start: string, end: string) => fetch(`${API_BASE}/sales?start_date=${start}&end_date=${end}`, {
      method: 'DELETE'
    }).then(r => r.json())
  },
  forecasts: {
    getAll: (params?: any) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetch(`${API_BASE}/forecasts${query}`).then(r => r.json());
    },
    get: (id: number) => fetch(`${API_BASE}/forecasts/${id}`).then(r => r.json()),
    create: (data: any) => fetch(`${API_BASE}/forecasts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    update: (id: number, data: any) => fetch(`${API_BASE}/forecasts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    delete: (id: number) => fetch(`${API_BASE}/forecasts/${id}`, { method: 'DELETE' })
  },
  analytics: {
    getDashboard: (params?: any) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetch(`${API_BASE}/analytics/dashboard${query}`).then(r => r.json());
    },
    getByCategory: (params?: any) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetch(`${API_BASE}/analytics/by-category${query}`).then(r => r.json());
    },
    getMargins: (params?: any) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetch(`${API_BASE}/analytics/margins${query}`).then(r => r.json());
    },
    getPerformance: (params?: any) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetch(`${API_BASE}/analytics/performance${query}`).then(r => r.json());
    }
  }
}
