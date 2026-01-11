import { Collaboration } from '../types';

interface Props {
  collaboration: Collaboration;
  onBrandClick?: (brandId: number) => void;
}

export function CollaborationCard({ collaboration, onBrandClick }: Props) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="collaboration-card">
      {collaboration.image_url && (
        <div className="card-image">
          <img src={collaboration.image_url} alt={collaboration.title} />
        </div>
      )}
      <div className="card-content">
        <div className="card-header">
          <span className="collaboration-type">{collaboration.collaboration_type}</span>
          <span className="collaboration-date">{formatDate(collaboration.published_date)}</span>
        </div>
        <h3 className="card-title">{collaboration.title}</h3>
        <p className="card-summary">{collaboration.summary}</p>

        <div className="card-brands">
          {collaboration.brands.map((brand) => (
            <button
              key={brand.id}
              className="brand-tag"
              onClick={(e) => {
                e.preventDefault();
                onBrandClick?.(brand.id);
              }}
            >
              {brand.logo_url && (
                <img src={brand.logo_url} alt="" className="brand-tag-logo" />
              )}
              {brand.name}
            </button>
          ))}
        </div>

        <div className="card-footer">
          <a
            href={collaboration.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="source-link"
          >
            {collaboration.source_name || 'Read more'} &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
