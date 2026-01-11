import { useState, useEffect } from 'react'
import { api } from '../api'
import { Product } from '../types'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    cost_price: '',
    retail_price: '',
    supplier: ''
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const data = await api.products.getAll()
    setProducts(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      ...formData,
      cost_price: parseFloat(formData.cost_price),
      retail_price: parseFloat(formData.retail_price)
    }

    if (editingProduct) {
      await api.products.update(editingProduct.id, data)
    } else {
      await api.products.create(data)
    }

    setFormData({ sku: '', name: '', category: '', cost_price: '', retail_price: '', supplier: '' })
    setEditingProduct(null)
    setShowForm(false)
    loadProducts()
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      sku: product.sku,
      name: product.name,
      category: product.category,
      cost_price: product.cost_price.toString(),
      retail_price: product.retail_price.toString(),
      supplier: product.supplier
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await api.products.delete(id)
      loadProducts()
    }
  }

  const calculateMargin = (cost: number, retail: number) => {
    return ((retail - cost) / retail * 100).toFixed(1)
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2>Product Catalog</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editingProduct ? 'Edit Product' : 'New Product'}</h3>
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
              </select>
            </div>
            <div className="form-group">
              <label>Cost Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={e => setFormData({ ...formData, cost_price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Retail Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.retail_price}
                onChange={e => setFormData({ ...formData, retail_price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Supplier</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            {editingProduct ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Cost Price</th>
              <th>Retail Price</th>
              <th>Margin %</th>
              <th>Supplier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td><span className="badge">{product.category}</span></td>
                <td>${product.cost_price.toFixed(2)}</td>
                <td>${product.retail_price.toFixed(2)}</td>
                <td className="profit">{calculateMargin(product.cost_price, product.retail_price)}%</td>
                <td>{product.supplier}</td>
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
        {products.length === 0 && (
          <div className="empty-state">No products yet. Add your first product to get started!</div>
        )}
      </div>
    </div>
  )
}
