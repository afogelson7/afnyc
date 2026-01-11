import { useState } from 'react'
import { NewsFeed } from './components/NewsFeed'
import { BrandDirectory } from './components/BrandDirectory'
import { BrandProfile } from './components/BrandProfile'
import { AdminPanel } from './components/AdminPanel'
import { View } from './types'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState<View>('feed')
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null)

  const handleBrandClick = (brandId: number) => {
    setSelectedBrandId(brandId)
    setCurrentView('brand-profile')
  }

  const handleBackToDirectory = () => {
    setSelectedBrandId(null)
    setCurrentView('brands')
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand" onClick={() => setCurrentView('feed')}>
          <span className="logo">CollabIQ</span>
          <span className="tagline">Brand Partnership Intelligence</span>
        </div>
        <div className="nav-links">
          <button
            className={currentView === 'feed' ? 'active' : ''}
            onClick={() => setCurrentView('feed')}
          >
            Feed
          </button>
          <button
            className={currentView === 'brands' || currentView === 'brand-profile' ? 'active' : ''}
            onClick={() => setCurrentView('brands')}
          >
            Brands
          </button>
          <button
            className={currentView === 'admin' ? 'active' : ''}
            onClick={() => setCurrentView('admin')}
          >
            Admin
          </button>
        </div>
      </nav>

      <main className="main-content">
        {currentView === 'feed' && (
          <NewsFeed onBrandClick={handleBrandClick} />
        )}
        {currentView === 'brands' && (
          <BrandDirectory onBrandClick={handleBrandClick} />
        )}
        {currentView === 'brand-profile' && selectedBrandId && (
          <BrandProfile
            brandId={selectedBrandId}
            onBack={handleBackToDirectory}
            onBrandClick={handleBrandClick}
          />
        )}
        {currentView === 'admin' && <AdminPanel />}
      </main>

      <footer className="footer">
        <p>CollabIQ - Tracking brand partnerships in consumer products</p>
      </footer>
    </div>
  )
}

export default App
