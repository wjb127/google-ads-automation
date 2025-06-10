// 앱 관련 타입
export interface App {
  id: string;
  name: string;
  package_name: string;
  platform: 'ios' | 'android';
  category: string;
  description: string;
  app_store_url?: string;
  google_play_url?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'pending';
}

// 광고 캠페인 관련 타입
export interface Campaign {
  id: string;
  app_id: string;
  google_ads_campaign_id?: string;
  name: string;
  budget: number;
  target_countries: string[];
  target_languages: string[];
  start_date: string;
  end_date?: string;
  status: 'draft' | 'active' | 'paused' | 'ended';
  created_at: string;
  updated_at: string;
}

// 키워드 관련 타입
export interface Keyword {
  id: string;
  campaign_id: string;
  text: string;
  match_type: 'exact' | 'phrase' | 'broad';
  max_cpc: number;
  status: 'active' | 'paused';
  created_at: string;
}

// 광고 그룹 관련 타입
export interface AdGroup {
  id: string;
  campaign_id: string;
  google_ads_adgroup_id?: string;
  name: string;
  default_cpc: number;
  status: 'active' | 'paused';
  created_at: string;
}

// 광고 관련 타입
export interface Ad {
  id: string;
  ad_group_id: string;
  google_ads_ad_id?: string;
  headline1: string;
  headline2: string;
  headline3?: string;
  description1: string;
  description2?: string;
  final_url: string;
  status: 'active' | 'paused';
  created_at: string;
}

// Google Ads API 응답 타입
export interface GoogleAdsApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

// 대시보드 통계 타입
export interface DashboardStats {
  total_apps: number;
  total_campaigns: number;
  active_campaigns: number;
  total_budget: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
}

// API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 