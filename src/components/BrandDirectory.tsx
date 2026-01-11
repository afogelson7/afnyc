import { useState, useEffect } from 'react';
import { api } from '../api';
import { Brand, Industry } from '../types';

interface Props {
  onBrandClick: (brandId: number) => void;
}

export function BrandDirectory({ onBrandClick }: Props) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');

  useEffect(() => {
    loadIndustries();
  }, []);

  useEffect(() => {
    loadBrands();
  }, [searchTerm, selectedIndustry]);

  const loadIndustries = async () => {
    try {
      const data = await api.industries.getAll();
      setIndustries(data);
    } catch (error) {
      console.error('Error loading industries:', error);
    }
  };

  const loadBrands = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedIndustry) params.industry = selectedIndustry;

      const data = await api.brands.getAll(params);
      setBrands(data);
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByLetter = (brandList: Brand[]) => {
    const grouped: { [key: string]: Brand[] } = {};
    brandList.forEach(brand => {
      const letter = brand.name[0].toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(brand);
    });
    return grouped;
  };

  const groupedBrands = groupByLetter(brands);
  const letters = Object.keys(groupedBrands).sort();

  return (
    <div className="brand-directory">
      <div className="directory-header">
        <h1>Brand Directory</h1>
        <p className="directory-subtitle">
          Explore brands and their partnership history
        </p>
      </div>

      <div className="directory-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          className="filter-select"
        >
          <option value="">All Industries</option>
          {industries.map(ind => (
            <option key={ind.id} value={ind.name}>{ind.name}</option>
          ))}
        </select>

        {(searchTerm || selectedIndustry) && (
          <button
            className="clear-filters"
            onClick={() => {
              setSearchTerm('');
              setSelectedIndustry('');
            }}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading brands...</div>
      ) : brands.length === 0 ? (
        <div className="empty-state">
          <h3>No brands found</h3>
          <p>
            {searchTerm || selectedIndustry
              ? 'Try adjusting your search'
              : 'Brands will appear here as collaborations are added'}
          </p>
        </div>
      ) : (
        <>
          <div className="letter-nav">
            {letters.map(letter => (
              <a key={letter} href={`#letter-${letter}`} className="letter-link">
                {letter}
              </a>
            ))}
          </div>

          <div className="brands-list">
            {letters.map(letter => (
              <div key={letter} id={`letter-${letter}`} className="letter-section">
                <h2 className="letter-header">{letter}</h2>
                <div className="brands-grid">
                  {groupedBrands[letter].map(brand => (
                    <div
                      key={brand.id}
                      className="brand-card"
                      onClick={() => onBrandClick(brand.id)}
                    >
                      <div className="brand-card-content">
                        {brand.logo_url ? (
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            className="brand-logo"
                          />
                        ) : (
                          <div className="brand-logo-placeholder">
                            {brand.name[0]}
                          </div>
                        )}
                        <div className="brand-info">
                          <h3 className="brand-name">{brand.name}</h3>
                          {brand.industry && (
                            <span className="brand-industry">{brand.industry}</span>
                          )}
                          {brand.description && (
                            <p className="brand-description">{brand.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
