export interface Brand {
  id: number;
  name: string;
  logo_url?: string;
  industry?: string;
  description?: string;
  website?: string;
  collaboration_count?: number;
  created_at: string;
}

export interface BrandSummary {
  id: number;
  name: string;
  logo_url?: string;
}

export interface Industry {
  id: number;
  name: string;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export interface Collaboration {
  id: number;
  title: string;
  summary: string;
  detailed_description?: string;
  source_url: string;
  source_name?: string;
  image_url?: string;
  published_date: string;
  collaboration_type: string;
  status: string;
  brands: BrandSummary[];
  tags?: Tag[];
  created_at: string;
}

export interface CollaborationFilters {
  date?: string;
  start_date?: string;
  end_date?: string;
  type?: string;
  brand_id?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CollaborationFormData {
  title: string;
  summary: string;
  detailed_description?: string;
  source_url: string;
  source_name?: string;
  image_url?: string;
  published_date: string;
  collaboration_type: string;
  brand_ids: number[];
  tag_ids?: number[];
}

export interface BrandFormData {
  name: string;
  logo_url?: string;
  industry?: string;
  description?: string;
  website?: string;
}

export interface CollaborationStats {
  total_collaborations: number;
  total_brands: number;
  this_month: number;
  by_type: Array<{
    collaboration_type: string;
    count: number;
  }>;
}

export interface DateCount {
  date: string;
  count: number;
}

export type View = 'feed' | 'brands' | 'brand-profile' | 'admin';

export const COLLABORATION_TYPES = [
  'Product Launch',
  'Co-Branding',
  'Limited Edition',
  'Licensing Deal',
  'Celebrity Partnership',
  'Influencer Collaboration',
  'Retail Exclusive',
  'Sustainability Initiative',
  'Tech Integration',
  'Crossover',
  'Other'
] as const;

export type CollaborationType = typeof COLLABORATION_TYPES[number];
