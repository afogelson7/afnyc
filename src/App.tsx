import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Products from './components/Products'
import Budgets from './components/Budgets'
import PurchaseOrders from './components/PurchaseOrders'
import './App.css'

type View = 'dashboard' | 'products' | 'budgets' | 'purchase-orders'

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')

  return (
    <div className="app">
      <nav className="navbar">
        <h1>💄 Beauty Merchandise Planner</h1>
        <div className="nav-links">
          <button
            className={currentView === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={currentView === 'products' ? 'active' : ''}
            onClick={() => setCurrentView('products')}
          >
            Products
          </button>
          <button
            className={currentView === 'budgets' ? 'active' : ''}
            onClick={() => setCurrentView('budgets')}
          >
            Budgets
          </button>
          <button
            className={currentView === 'purchase-orders' ? 'active' : ''}
            onClick={() => setCurrentView('purchase-orders')}
          >
            Purchase Orders
          </button>
        </div>
      </nav>

      <main className="main-content">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'products' && <Products />}
        {currentView === 'budgets' && <Budgets />}
        {currentView === 'purchase-orders' && <PurchaseOrders />}
      </main>
    </div>
  )
}

export default App
