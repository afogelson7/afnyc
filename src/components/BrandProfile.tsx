import { useState, useEffect } from 'react';
import { api } from '../api';
import { Brand, Collaboration } from '../types';
import { CollaborationCard } from './CollaborationCard';

interface Props {
  brandId: number;
  onBack: () => void;
  onBrandClick: (brandId: number) => void;
}

export function BrandProfile({ brandId, onBack, onBrandClick }: Props) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrandData();
  }, [brandId]);

  const loadBrandData = async () => {
    setLoading(true);
    try {
      const [brandData, collabsData] = await Promise.all([
        api.brands.get(brandId),
        api.brands.getCollaborations(brandId)
      ]);
      setBrand(brandData);
      setCollaborations(collabsData);
    } catch (error) {
      console.error('Error loading brand:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByYear = (collabs: Collaboration[]) => {
    const grouped: { [key: string]: Collaboration[] } = {};
    collabs.forEach(c => {
      const year = new Date(c.published_date).getFullYear().toString();
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(c);
    });
    return grouped;
  };

  if (loading) {
    return <div className="loading">Loading brand profile...</div>;
  }

  if (!brand) {
    return (
      <div className="error-state">
        <h3>Brand not found</h3>
        <button onClick={onBack} className="btn btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  const groupedByYear = groupByYear(collaborations);
  const years = Object.keys(groupedByYear).sort((a, b) => parseInt(b) - parseInt(a));

  // Get unique partner brands
  const partnerBrands = new Map<number, { id: number; name: string; count: number }>();
  collaborations.forEach(c => {
    c.brands.forEach(b => {
      if (b.id !== brandId) {
        const existing = partnerBrands.get(b.id);
        if (existing) {
          existing.count++;
        } else {
          partnerBrands.set(b.id, { id: b.id, name: b.name, count: 1 });
        }
      }
    });
  });
  const topPartners = Array.from(partnerBrands.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Get collaboration type distribution
  const typeDistribution: { [key: string]: number } = {};
  collaborations.forEach(c => {
    typeDistribution[c.collaboration_type] = (typeDistribution[c.collaboration_type] || 0) + 1;
  });

  return (
    <div className="brand-profile">
      <button onClick={onBack} className="back-button">
        &larr; Back to Directory
      </button>

      <div className="profile-header">
        <div className="profile-main">
          {brand.logo_url ? (
            <img src={brand.logo_url} alt={brand.name} className="profile-logo" />
          ) : (
            <div className="profile-logo-placeholder">{brand.name[0]}</div>
          )}
          <div className="profile-info">
            <h1>{brand.name}</h1>
            {brand.industry && <span className="profile-industry">{brand.industry}</span>}
            {brand.description && <p className="profile-description">{brand.description}</p>}
            {brand.website && (
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-website"
              >
                Visit Website &rarr;
              </a>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-value">{brand.collaboration_count || collaborations.length}</span>
            <span className="stat-label">Total Partnerships</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{partnerBrands.size}</span>
            <span className="stat-label">Partner Brands</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{years.length}</span>
            <span className="stat-label">Years Active</span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-main-content">
          <h2>Partnership History</h2>

          {collaborations.length === 0 ? (
            <div className="empty-state">
              <p>No partnerships recorded yet for this brand.</p>
            </div>
          ) : (
            years.map(year => (
              <div key={year} className="year-section">
                <h3 className="year-header">
                  {year}
                  <span className="year-count">({groupedByYear[year].length})</span>
                </h3>
                <div className="collaborations-grid">
                  {groupedByYear[year].map(collab => (
                    <CollaborationCard
                      key={collab.id}
                      collaboration={collab}
                      onBrandClick={onBrandClick}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="profile-sidebar">
          {topPartners.length > 0 && (
            <div className="sidebar-section">
              <h3>Top Partners</h3>
              <div className="partner-list">
                {topPartners.map(partner => (
                  <button
                    key={partner.id}
                    className="partner-item"
                    onClick={() => onBrandClick(partner.id)}
                  >
                    <span className="partner-name">{partner.name}</span>
                    <span className="partner-count">{partner.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {Object.keys(typeDistribution).length > 0 && (
            <div className="sidebar-section">
              <h3>Partnership Types</h3>
              <div className="type-distribution">
                {Object.entries(typeDistribution)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div key={type} className="type-item">
                      <span className="type-name">{type}</span>
                      <span className="type-count">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
