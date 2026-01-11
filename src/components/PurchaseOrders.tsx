import { useState, useEffect } from 'react'
import { api } from '../api'
import { PurchaseOrder, Product, POItem } from '../types'

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null)
  const [formData, setFormData] = useState({
    po_number: '',
    supplier: '',
    order_date: '',
    expected_delivery: '',
    status: 'pending',
    total_cost: '',
    notes: ''
  })
  const [items, setItems] = useState<Array<{ product_id: string; quantity: string; unit_cost: string }>>([])

  useEffect(() => {
    loadOrders()
    loadProducts()
  }, [])

  const loadOrders = async () => {
    const data = await api.purchaseOrders.getAll()
    setOrders(data)
  }

  const loadProducts = async () => {
    const data = await api.products.getAll()
    setProducts(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      ...formData,
      total_cost: parseFloat(formData.total_cost),
      items: items.map(item => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity),
        unit_cost: parseFloat(item.unit_cost)
      }))
    }

    if (editingOrder) {
      await api.purchaseOrders.update(editingOrder.id, data)
    } else {
      await api.purchaseOrders.create(data)
    }

    resetForm()
    loadOrders()
  }

  const resetForm = () => {
    setFormData({
      po_number: '',
      supplier: '',
      order_date: '',
      expected_delivery: '',
      status: 'pending',
      total_cost: '',
      notes: ''
    })
    setItems([])
    setEditingOrder(null)
    setShowForm(false)
  }

  const handleEdit = async (order: PurchaseOrder) => {
    const fullOrder = await api.purchaseOrders.get(order.id)
    setEditingOrder(fullOrder)
    setFormData({
      po_number: fullOrder.po_number,
      supplier: fullOrder.supplier,
      order_date: fullOrder.order_date,
      expected_delivery: fullOrder.expected_delivery,
      status: fullOrder.status,
      total_cost: fullOrder.total_cost.toString(),
      notes: fullOrder.notes
    })
    if (fullOrder.items) {
      setItems(fullOrder.items.map((item: POItem) => ({
        product_id: item.product_id.toString(),
        quantity: item.quantity.toString(),
        unit_cost: item.unit_cost.toString()
      })))
    }
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this purchase order?')) {
      await api.purchaseOrders.delete(id)
      loadOrders()
    }
  }

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: '', unit_cost: '' }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0
      const cost = parseFloat(item.unit_cost) || 0
      return sum + (qty * cost)
    }, 0)
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending'
      case 'ordered': return 'status-ordered'
      case 'received': return 'status-received'
      case 'cancelled': return 'status-cancelled'
      default: return ''
    }
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2>Purchase Orders</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Purchase Order'}
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editingOrder ? 'Edit Purchase Order' : 'New Purchase Order'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>PO Number</label>
              <input
                type="text"
                value={formData.po_number}
                onChange={e => setFormData({ ...formData, po_number: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Supplier</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Order Date</label>
              <input
                type="date"
                value={formData.order_date}
                onChange={e => setFormData({ ...formData, order_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Expected Delivery</label>
              <input
                type="date"
                value={formData.expected_delivery}
                onChange={e => setFormData({ ...formData, expected_delivery: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="ordered">Ordered</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Total Cost ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.total_cost || calculateTotal().toFixed(2)}
                onChange={e => setFormData({ ...formData, total_cost: e.target.value })}
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div className="po-items-section">
            <div className="section-header">
              <h4>Line Items</h4>
              <button type="button" className="btn-small" onClick={addItem}>+ Add Item</button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="po-item-row">
                <select
                  value={item.product_id}
                  onChange={e => updateItem(index, 'product_id', e.target.value)}
                  required
                >
                  <option value="">Select Product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={e => updateItem(index, 'quantity', e.target.value)}
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Unit Cost"
                  value={item.unit_cost}
                  onChange={e => updateItem(index, 'unit_cost', e.target.value)}
                  required
                />
                <button type="button" className="btn-small btn-danger" onClick={() => removeItem(index)}>
                  Remove
                </button>
              </div>
            ))}

            {items.length > 0 && (
              <div className="calculated-total">
                Calculated Total: ${calculateTotal().toFixed(2)}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary">
            {editingOrder ? 'Update Purchase Order' : 'Create Purchase Order'}
          </button>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Supplier</th>
              <th>Order Date</th>
              <th>Expected Delivery</th>
              <th>Status</th>
              <th>Total Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td><strong>{order.po_number}</strong></td>
                <td>{order.supplier}</td>
                <td>{new Date(order.order_date).toLocaleDateString()}</td>
                <td>{order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : '-'}</td>
                <td><span className={`badge ${getStatusClass(order.status)}`}>{order.status}</span></td>
                <td>${order.total_cost.toLocaleString()}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-small" onClick={() => handleEdit(order)}>Edit</button>
                    <button className="btn-small btn-danger" onClick={() => handleDelete(order.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="empty-state">No purchase orders yet. Create your first PO to track inventory purchases!</div>
        )}
      </div>
    </div>
  )
}
