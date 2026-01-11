import { CollaborationFilters, CollaborationFormData, BrandFormData } from './types';

const API_BASE = '/api';

export const api = {
  brands: {
    getAll: (params?: { industry?: string; search?: string }) => {
      const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return fetch(`${API_BASE}/brands${query}`).then(r => r.json());
    },
    get: (id: number) => fetch(`${API_BASE}/brands/${id}`).then(r => r.json()),
    getCollaborations: (id: number, params?: { limit?: number; offset?: number }) => {
      const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return fetch(`${API_BASE}/brands/${id}/collaborations${query}`).then(r => r.json());
    },
    create: (data: BrandFormData) => fetch(`${API_BASE}/brands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    update: (id: number, data: BrandFormData) => fetch(`${API_BASE}/brands/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    delete: (id: number) => fetch(`${API_BASE}/brands/${id}`, { method: 'DELETE' })
  },

  collaborations: {
    getAll: (params?: CollaborationFilters) => {
      const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return fetch(`${API_BASE}/collaborations${query}`).then(r => r.json());
    },
    get: (id: number) => fetch(`${API_BASE}/collaborations/${id}`).then(r => r.json()),
    getTypes: () => fetch(`${API_BASE}/collaborations/types`).then(r => r.json()),
    getDates: (params?: { month?: string; year?: string }) => {
      const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return fetch(`${API_BASE}/collaborations/dates${query}`).then(r => r.json());
    },
    getStats: () => fetch(`${API_BASE}/collaborations/stats/overview`).then(r => r.json()),
    create: (data: CollaborationFormData) => fetch(`${API_BASE}/collaborations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    update: (id: number, data: Partial<CollaborationFormData> & { status?: string }) =>
      fetch(`${API_BASE}/collaborations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
    delete: (id: number) => fetch(`${API_BASE}/collaborations/${id}`, { method: 'DELETE' })
  },

  tags: {
    getAll: () => fetch(`${API_BASE}/tags`).then(r => r.json()),
    create: (name: string) => fetch(`${API_BASE}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    }).then(r => r.json()),
    delete: (id: number) => fetch(`${API_BASE}/tags/${id}`, { method: 'DELETE' })
  },

  industries: {
    getAll: () => fetch(`${API_BASE}/industries`).then(r => r.json()),
    create: (name: string) => fetch(`${API_BASE}/industries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    }).then(r => r.json()),
    delete: (id: number) => fetch(`${API_BASE}/industries/${id}`, { method: 'DELETE' })
  }
};
