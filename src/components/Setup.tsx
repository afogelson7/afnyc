import { useState, useEffect } from 'react'
import { api } from '../api'
import { Brand, Retailer, Product } from '../types'

export default function Setup() {
  const [activeTab, setActiveTab] = useState<'brands' | 'retailers' | 'products'>('brands')
  const [brands, setBrands] = useState<Brand[]>([])
  const [retailers, setRetailers] = useState<Retailer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadBrands()
    loadRetailers()
    loadProducts()
  }, [])

  const loadBrands = async () => {
    const data = await api.brands.getAll()
    setBrands(data)
  }

  const loadRetailers = async () => {
    const data = await api.retailers.getAll()
    setRetailers(data)
  }

  const loadProducts = async () => {
    const data = await api.products.getAll()
    setProducts(data)
  }

  return (
    <div className="section">
      <h2>Setup & Configuration</h2>

      <div className="tabs">
        <button
          className={activeTab === 'brands' ? 'active' : ''}
          onClick={() => setActiveTab('brands')}
        >
          Brands ({brands.length})
        </button>
        <button
          className={activeTab === 'retailers' ? 'active' : ''}
          onClick={() => setActiveTab('retailers')}
        >
          Retailers ({retailers.length})
        </button>
        <button
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          Products ({products.length})
        </button>
      </div>

      {activeTab === 'brands' && (
        <BrandsTab
          brands={brands}
          onRefresh={loadBrands}
          showForm={showForm}
          setShowForm={setShowForm}
        />
      )}

      {activeTab === 'retailers' && (
        <RetailersTab
          retailers={retailers}
          onRefresh={loadRetailers}
          showForm={showForm}
          setShowForm={setShowForm}
        />
      )}

      {activeTab === 'products' && (
        <ProductsTab
          products={products}
          brands={brands}
          onRefresh={loadProducts}
          showForm={showForm}
          setShowForm={setShowForm}
        />
      )}
    </div>
  )
}

function BrandsTab({ brands, onRefresh, showForm, setShowForm }: any) {
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [editing, setEditing] = useState<Brand | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      await api.brands.update(editing.id, formData)
    } else {
      await api.brands.create(formData)
    }
    setFormData({ name: '', description: '' })
    setEditing(null)
    setShowForm(false)
    onRefresh()
  }

  const handleEdit = (brand: Brand) => {
    setEditing(brand)
    setFormData({ name: brand.name, description: brand.description })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Delete this brand?')) {
      await api.brands.delete(id)
      onRefresh()
    }
  }

  return (
    <div>
      <div className="section-header">
        <h3>Brands / Licenses</h3>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Brand'}
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Brand Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            {editing ? 'Update' : 'Create'} Brand
          </button>
        </form>
      )}

      <div className="simple-list">
        {brands.map(brand => (
          <div key={brand.id} className="list-item">
            <div>
              <strong>{brand.name}</strong>
              {brand.description && <p>{brand.description}</p>}
            </div>
            <div className="action-buttons">
              <button className="btn-small" onClick={() => handleEdit(brand)}>Edit</button>
              <button className="btn-small btn-danger" onClick={() => handleDelete(brand.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {brands.length === 0 && <div className="empty-state">No brands yet</div>}
    </div>
  )
}

function RetailersTab({ retailers, onRefresh, showForm, setShowForm }: any) {
  const [formData, setFormData] = useState({ name: '', code: '' })
  const [editing, setEditing] = useState<Retailer | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      await api.retailers.update(editing.id, formData)
    } else {
      await api.retailers.create(formData)
    }
    setFormData({ name: '', code: '' })
    setEditing(null)
    setShowForm(false)
    onRefresh()
  }

  const handleEdit = (retailer: Retailer) => {
    setEditing(retailer)
    setFormData({ name: retailer.name, code: retailer.code })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Delete this retailer?')) {
      await api.retailers.delete(id)
      onRefresh()
    }
  }

  return (
    <div>
      <div className="section-header">
        <h3>Retailers</h3>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Retailer'}
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Retailer Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Code (optional)</label>
              <input
                type="text"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            {editing ? 'Update' : 'Create'} Retailer
          </button>
        </form>
      )}

      <div className="simple-list">
        {retailers.map(retailer => (
          <div key={retailer.id} className="list-item">
            <div>
              <strong>{retailer.name}</strong>
              {retailer.code && <span className="badge">{retailer.code}</span>}
            </div>
            <div className="action-buttons">
              <button className="btn-small" onClick={() => handleEdit(retailer)}>Edit</button>
              <button className="btn-small btn-danger" onClick={() => handleDelete(retailer.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {retailers.length === 0 && <div className="empty-state">No retailers yet</div>}
    </div>
  )
}

function ProductsTab({ products, brands, onRefresh, showForm, setShowForm }: any) {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    brand_id: '',
    category: '',
    subcategory: '',
    cogs: '',
    wholesale_cost: '',
    retailer_srp: ''
  })
  const [editing, setEditing] = useState<Product | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      ...formData,
      brand_id: parseInt(formData.brand_id),
      cogs: parseFloat(formData.cogs),
      wholesale_cost: parseFloat(formData.wholesale_cost),
      retailer_srp: parseFloat(formData.retailer_srp)
    }

    if (editing) {
      await api.products.update(editing.id, data)
    } else {
      await api.products.create(data)
    }

    setFormData({
      sku: '',
      name: '',
      brand_id: '',
      category: '',
      subcategory: '',
      cogs: '',
      wholesale_cost: '',
      retailer_srp: ''
    })
    setEditing(null)
    setShowForm(false)
    onRefresh()
  }

  const handleEdit = (product: Product) => {
    setEditing(product)
    setFormData({
      sku: product.sku,
      name: product.name,
      brand_id: product.brand_id.toString(),
      category: product.category,
      subcategory: product.subcategory,
      cogs: product.cogs.toString(),
      wholesale_cost: product.wholesale_cost.toString(),
      retailer_srp: product.retailer_srp.toString()
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Delete this product?')) {
      await api.products.delete(id)
      onRefresh()
    }
  }

  return (
    <div>
      <div className="section-header">
        <h3>Products</h3>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Brand</label>
              <select
                value={formData.brand_id}
                onChange={e => setFormData({ ...formData, brand_id: e.target.value })}
                required
              >
                <option value="">Select...</option>
                {brands.map((b: Brand) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Subcategory</label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>COGS ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.cogs}
                onChange={e => setFormData({ ...formData, cogs: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Wholesale Cost ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.wholesale_cost}
                onChange={e => setFormData({ ...formData, wholesale_cost: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Retailer SRP ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.retailer_srp}
                onChange={e => setFormData({ ...formData, retailer_srp: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            {editing ? 'Update' : 'Create'} Product
          </button>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th>COGS</th>
              <th>Wholesale</th>
              <th>Retail SRP</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: Product) => (
              <tr key={product.id}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td><span className="badge">{product.brand_name}</span></td>
                <td>{product.category}</td>
                <td>{product.subcategory}</td>
                <td>${product.cogs.toFixed(2)}</td>
                <td>${product.wholesale_cost.toFixed(2)}</td>
                <td>${product.retailer_srp.toFixed(2)}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-small" onClick={() => handleEdit(product)}>Edit</button>
                    <button className="btn-small btn-danger" onClick={() => handleDelete(product.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && <div className="empty-state">No products yet</div>}
    </div>
  )
}
