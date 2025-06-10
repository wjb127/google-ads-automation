'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PlusIcon, PlayIcon, PauseIcon } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  total_apps: number;
  total_campaigns: number;
  active_campaigns: number;
  total_budget: number;
}

interface App {
  id: string;
  name: string;
  platform: 'ios' | 'android';
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

interface Campaign {
  id: string;
  name: string;
  budget: number;
  status: 'draft' | 'active' | 'paused' | 'ended';
  created_at: string;
  app_id: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total_apps: 0,
    total_campaigns: 0,
    active_campaigns: 0,
    total_budget: 0,
  });
  const [recentApps, setRecentApps] = useState<App[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // 앱 데이터 로드
      const appsResponse = await fetch('/api/supabase/apps');
      const appsData = await appsResponse.json();
      
      // 캠페인 데이터 로드
      const campaignsResponse = await fetch('/api/supabase/campaigns');
      const campaignsData = await campaignsResponse.json();
      
      if (appsData.success && campaignsData.success) {
        const apps = appsData.data || [];
        const campaigns = campaignsData.data || [];
        
        // 통계 계산
        const activeCampaigns = campaigns.filter((c: Campaign) => c.status === 'active');
        const totalBudget = campaigns.reduce((sum: number, c: Campaign) => sum + c.budget, 0);
        
        setStats({
          total_apps: apps.length,
          total_campaigns: campaigns.length,
          active_campaigns: activeCampaigns.length,
          total_budget: totalBudget,
        });
        
        // 최근 앱들 (최대 5개)
        setRecentApps(apps.slice(0, 5));
        
        // 최근 캠페인들 (최대 5개)
        setRecentCampaigns(campaigns.slice(0, 5));
      }
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Google Ads 자동화 대시보드
              </h1>
              <p className="text-gray-600">
                앱 광고 캠페인을 관리하고 모니터링하세요
              </p>
            </div>
            <div className="flex space-x-3">
              <Link href="/dashboard/apps/new">
                <Button>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  앱 추가
                </Button>
              </Link>
              <Link href="/dashboard/campaigns/new">
                <Button variant="secondary">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  캠페인 생성
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 앱 수</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_apps}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 캠페인 수</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_campaigns}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">활성 캠페인</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active_campaigns}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <PlayIcon className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 예산</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_budget)}</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 최근 앱과 캠페인 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 최근 앱들 */}
          <Card>
            <CardHeader 
              title="최근 앱들" 
              subtitle="최근에 추가된 앱들을 확인하세요"
              action={
                <Link href="/dashboard/apps">
                  <Button variant="outline" size="sm">
                    전체 보기
                  </Button>
                </Link>
              }
            />
            <CardContent>
              {recentApps.length > 0 ? (
                <div className="space-y-4">
                  {recentApps.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{app.name}</h4>
                        <p className="text-sm text-gray-600">
                          {app.platform === 'ios' ? 'iOS' : 'Android'} • {formatDate(app.created_at)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        app.status === 'active' ? 'bg-green-100 text-green-800' :
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {app.status === 'active' ? '활성' :
                         app.status === 'pending' ? '대기' : '비활성'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">등록된 앱이 없습니다</p>
              )}
            </CardContent>
          </Card>

          {/* 최근 캠페인들 */}
          <Card>
            <CardHeader 
              title="최근 캠페인들" 
              subtitle="최근에 생성된 캠페인들을 확인하세요"
              action={
                <Link href="/dashboard/campaigns">
                  <Button variant="outline" size="sm">
                    전체 보기
                  </Button>
                </Link>
              }
            />
            <CardContent>
              {recentCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {recentCampaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                        <p className="text-sm text-gray-600">
                          예산: {formatCurrency(campaign.budget)} • {formatDate(campaign.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {campaign.status === 'active' ? '활성' :
                           campaign.status === 'draft' ? '초안' :
                           campaign.status === 'paused' ? '일시정지' : '종료'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">생성된 캠페인이 없습니다</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 