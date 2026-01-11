import { useState, useEffect } from 'react';
import { api } from '../api';
import { Collaboration, CollaborationStats, DateCount } from '../types';
import { CollaborationCard } from './CollaborationCard';

interface Props {
  onBrandClick: (brandId: number) => void;
}

export function NewsFeed({ onBrandClick }: Props) {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [stats, setStats] = useState<CollaborationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<DateCount[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadCollaborations();
  }, [searchTerm, selectedType, selectedDate]);

  const loadData = async () => {
    try {
      const [statsData, typesData, datesData] = await Promise.all([
        api.collaborations.getStats(),
        api.collaborations.getTypes(),
        api.collaborations.getDates()
      ]);
      setStats(statsData);
      setAvailableTypes(typesData);
      setAvailableDates(datesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadCollaborations = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (searchTerm) params.search = searchTerm;
      if (selectedType) params.type = selectedType;
      if (selectedDate) params.date = selectedDate;

      const data = await api.collaborations.getAll(params);
      setCollaborations(data);
    } catch (error) {
      console.error('Error loading collaborations:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByDate = (collabs: Collaboration[]) => {
    const grouped: { [key: string]: Collaboration[] } = {};
    collabs.forEach(c => {
      const date = c.published_date.split('T')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(c);
    });
    return grouped;
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const groupedCollaborations = groupByDate(collaborations);
  const sortedDates = Object.keys(groupedCollaborations).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="news-feed">
      <div className="feed-header">
        <div className="feed-intro">
          <h1>Brand Partnership Feed</h1>
          <p className="feed-subtitle">
            Track the latest collaborations and partnerships in consumer products
          </p>
        </div>

        {stats && (
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-value">{stats.total_collaborations}</span>
              <span className="stat-label">Partnerships</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.total_brands}</span>
              <span className="stat-label">Brands</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.this_month}</span>
              <span className="stat-label">This Month</span>
            </div>
          </div>
        )}
      </div>

      <div className="feed-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search partnerships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="filter-select"
        >
          <option value="">All Types</option>
          {availableTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="filter-select"
        >
          <option value="">All Dates</option>
          {availableDates.slice(0, 30).map(d => (
            <option key={d.date} value={d.date}>
              {new Date(d.date).toLocaleDateString()} ({d.count})
            </option>
          ))}
        </select>

        {(searchTerm || selectedType || selectedDate) && (
          <button
            className="clear-filters"
            onClick={() => {
              setSearchTerm('');
              setSelectedType('');
              setSelectedDate('');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading partnerships...</div>
      ) : collaborations.length === 0 ? (
        <div className="empty-state">
          <h3>No partnerships found</h3>
          <p>
            {searchTerm || selectedType || selectedDate
              ? 'Try adjusting your filters'
              : 'Add your first collaboration to get started'}
          </p>
        </div>
      ) : (
        <div className="feed-content">
          {sortedDates.map(date => (
            <div key={date} className="date-group">
              <h2 className="date-header">{formatDateHeader(date)}</h2>
              <div className="collaborations-grid">
                {groupedCollaborations[date].map(collab => (
                  <CollaborationCard
                    key={collab.id}
                    collaboration={collab}
                    onBrandClick={onBrandClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
