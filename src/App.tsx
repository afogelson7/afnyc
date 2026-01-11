import { useState } from 'react'
import SalesDashboard from './components/SalesDashboard'
import Setup from './components/Setup'
import SalesUpload from './components/SalesUpload'
import './App.css'

type View = 'dashboard' | 'setup' | 'upload'

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')

  return (
    <div className="app">
      <nav className="navbar">
        <h1>💄 Beauty Sales Tracker</h1>
        <div className="nav-links">
          <button
            className={currentView === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={currentView === 'upload' ? 'active' : ''}
            onClick={() => setCurrentView('upload')}
          >
            Upload Sales
          </button>
          <button
            className={currentView === 'setup' ? 'active' : ''}
            onClick={() => setCurrentView('setup')}
          >
            Setup
          </button>
        </div>
      </nav>

      <main className="main-content">
        {currentView === 'dashboard' && <SalesDashboard />}
        {currentView === 'upload' && <SalesUpload />}
        {currentView === 'setup' && <Setup />}
      </main>
    </div>
  )
}

export default App
