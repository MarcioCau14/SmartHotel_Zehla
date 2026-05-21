export interface ConnectLink {
  id: string;
  label: string;
  url: string;
  icon: string;
  type: string;
  order: number;
  clickCount: number;
  isActive: boolean;
}

export interface ConnectProfile {
  id: string;
  slug: string;
  bio: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  whatsappNumber: string | null;
  status: string;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface AnalyticsData {
  analytics: Array<{ date: string; views: number; clicks: number; ctr: number }>;
  totals: { views: number; clicks: number; ctr: number };
  profile: { totalViews: number; totalClicks: number };
}
