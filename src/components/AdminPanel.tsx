import { useState, useEffect } from 'react';
import { api } from '../api';
import { Brand, Tag, Industry, Collaboration, COLLABORATION_TYPES } from '../types';

type AdminTab = 'collaborations' | 'brands';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('collaborations');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states for new collaboration
  const [collabForm, setCollabForm] = useState({
    title: '',
    summary: '',
    detailed_description: '',
    source_url: '',
    source_name: '',
    image_url: '',
    published_date: new Date().toISOString().split('T')[0],
    collaboration_type: 'Product Launch',
    brand_ids: [] as number[],
    tag_ids: [] as number[]
  });

  // Form states for new brand
  const [brandForm, setBrandForm] = useState({
    name: '',
    logo_url: '',
    industry: '',
    description: '',
    website: ''
  });

  const [editingCollab, setEditingCollab] = useState<Collaboration | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [brandsData, tagsData, industriesData, collabsData] = await Promise.all([
        api.brands.getAll(),
        api.tags.getAll(),
        api.industries.getAll(),
        api.collaborations.getAll({ limit: 100 })
      ]);
      setBrands(brandsData);
      setTags(tagsData);
      setIndustries(industriesData);
      setCollaborations(collabsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreateCollaboration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (collabForm.brand_ids.length < 2) {
      showMessage('error', 'Please select at least 2 brands for a collaboration');
      return;
    }

    setLoading(true);
    try {
      await api.collaborations.create(collabForm);
      showMessage('success', 'Collaboration added successfully');
      setCollabForm({
        title: '',
        summary: '',
        detailed_description: '',
        source_url: '',
        source_name: '',
        image_url: '',
        published_date: new Date().toISOString().split('T')[0],
        collaboration_type: 'Product Launch',
        brand_ids: [],
        tag_ids: []
      });
      loadData();
    } catch (error) {
      showMessage('error', 'Failed to create collaboration');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.brands.create(brandForm);
      showMessage('success', 'Brand added successfully');
      setBrandForm({ name: '', logo_url: '', industry: '', description: '', website: '' });
      loadData();
    } catch (error) {
      showMessage('error', 'Failed to create brand');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollaboration = async (id: number) => {
    if (!confirm('Are you sure you want to delete this collaboration?')) return;
    try {
      await api.collaborations.delete(id);
      showMessage('success', 'Collaboration deleted');
      loadData();
    } catch (error) {
      showMessage('error', 'Failed to delete collaboration');
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await api.brands.delete(id);
      showMessage('success', 'Brand deleted');
      loadData();
    } catch (error) {
      showMessage('error', 'Failed to delete brand');
    }
  };

  const toggleBrandSelection = (brandId: number) => {
    setCollabForm(prev => ({
      ...prev,
      brand_ids: prev.brand_ids.includes(brandId)
        ? prev.brand_ids.filter(id => id !== brandId)
        : [...prev.brand_ids, brandId]
    }));
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage collaborations and brands in your database</p>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'collaborations' ? 'active' : ''}`}
          onClick={() => setActiveTab('collaborations')}
        >
          Collaborations
        </button>
        <button
          className={`tab ${activeTab === 'brands' ? 'active' : ''}`}
          onClick={() => setActiveTab('brands')}
        >
          Brands
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'collaborations' && (
          <div className="admin-section">
            <div className="form-section">
              <h2>Add New Collaboration</h2>
              <form onSubmit={handleCreateCollaboration} className="admin-form">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={collabForm.title}
                    onChange={(e) => setCollabForm({ ...collabForm, title: e.target.value })}
                    placeholder="e.g., Nike x Off-White The Ten Collection"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Summary *</label>
                  <textarea
                    value={collabForm.summary}
                    onChange={(e) => setCollabForm({ ...collabForm, summary: e.target.value })}
                    placeholder="Brief description of the partnership..."
                    rows={3}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Published Date *</label>
                    <input
                      type="date"
                      value={collabForm.published_date}
                      onChange={(e) => setCollabForm({ ...collabForm, published_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Type *</label>
                    <select
                      value={collabForm.collaboration_type}
                      onChange={(e) => setCollabForm({ ...collabForm, collaboration_type: e.target.value })}
                      required
                    >
                      {COLLABORATION_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Source URL *</label>
                    <input
                      type="url"
                      value={collabForm.source_url}
                      onChange={(e) => setCollabForm({ ...collabForm, source_url: e.target.value })}
                      placeholder="https://..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Source Name</label>
                    <input
                      type="text"
                      value={collabForm.source_name}
                      onChange={(e) => setCollabForm({ ...collabForm, source_name: e.target.value })}
                      placeholder="e.g., WWD, Business of Fashion"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={collabForm.image_url}
                    onChange={(e) => setCollabForm({ ...collabForm, image_url: e.target.value })}
                    placeholder="https://... (optional)"
                  />
                </div>

                <div className="form-group">
                  <label>Select Brands * (at least 2)</label>
                  <div className="brand-selector">
                    {brands.map(brand => (
                      <button
                        key={brand.id}
                        type="button"
                        className={`brand-option ${collabForm.brand_ids.includes(brand.id) ? 'selected' : ''}`}
                        onClick={() => toggleBrandSelection(brand.id)}
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                  {brands.length === 0 && (
                    <p className="helper-text">Add brands first in the Brands tab</p>
                  )}
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Collaboration'}
                </button>
              </form>
            </div>

            <div className="list-section">
              <h2>Recent Collaborations ({collaborations.length})</h2>
              <div className="admin-list">
                {collaborations.map(collab => (
                  <div key={collab.id} className="admin-list-item">
                    <div className="item-content">
                      <h4>{collab.title}</h4>
                      <p className="item-meta">
                        {collab.brands.map(b => b.name).join(' x ')} &bull; {collab.collaboration_type}
                      </p>
                      <p className="item-date">{new Date(collab.published_date).toLocaleDateString()}</p>
                    </div>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDeleteCollaboration(collab.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'brands' && (
          <div className="admin-section">
            <div className="form-section">
              <h2>Add New Brand</h2>
              <form onSubmit={handleCreateBrand} className="admin-form">
                <div className="form-group">
                  <label>Brand Name *</label>
                  <input
                    type="text"
                    value={brandForm.name}
                    onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                    placeholder="e.g., Nike, Apple, L'Oreal"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Industry</label>
                    <select
                      value={brandForm.industry}
                      onChange={(e) => setBrandForm({ ...brandForm, industry: e.target.value })}
                    >
                      <option value="">Select Industry</option>
                      {industries.map(ind => (
                        <option key={ind.id} value={ind.name}>{ind.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      value={brandForm.website}
                      onChange={(e) => setBrandForm({ ...brandForm, website: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Logo URL</label>
                  <input
                    type="url"
                    value={brandForm.logo_url}
                    onChange={(e) => setBrandForm({ ...brandForm, logo_url: e.target.value })}
                    placeholder="https://... (optional)"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={brandForm.description}
                    onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                    placeholder="Brief description of the brand..."
                    rows={2}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Brand'}
                </button>
              </form>
            </div>

            <div className="list-section">
              <h2>All Brands ({brands.length})</h2>
              <div className="admin-list">
                {brands.map(brand => (
                  <div key={brand.id} className="admin-list-item">
                    <div className="item-content">
                      <h4>{brand.name}</h4>
                      {brand.industry && <p className="item-meta">{brand.industry}</p>}
                    </div>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDeleteBrand(brand.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
