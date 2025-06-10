import { NextRequest, NextResponse } from 'next/server';
import { createFullCampaign } from '@/lib/google-ads';
import { supabaseApi } from '@/lib/supabase';
import { Campaign, ApiResponse } from '@/types';

// POST: Google Ads 캠페인 생성 및 DB 업데이트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_id,
      campaign_id, // 로컬 DB의 캠페인 ID
      ad_group_data,
      keywords,
      ads,
    } = body;

    // 필수 필드 검증
    if (!customer_id || !campaign_id || !ad_group_data || !keywords || !ads) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '필수 필드가 누락되었습니다.',
      }, { status: 400 });
    }

    // 로컬 DB에서 캠페인 정보 조회
    const { data: campaignData, error: campaignError } = await supabaseApi.select<Campaign>(
      'campaigns',
      '*',
      { id: campaign_id }
    );

    if (campaignError || !campaignData || campaignData.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '캠페인을 찾을 수 없습니다.',
      }, { status: 404 });
    }

    const campaign = campaignData[0];

    // 앱 정보 조회 (최종 URL 등을 위해)
    const { data: appData, error: appError } = await supabaseApi.select<any>(
      'apps',
      '*',
      { id: campaign.app_id }
    );

    if (appError || !appData || appData.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '앱 정보를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    const app = appData[0];

    // Google Ads 캠페인 데이터 구성
    const googleAdsCampaignData = {
      name: campaign.name,
      budget: campaign.budget,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      targetCountries: campaign.target_countries,
      targetLanguages: campaign.target_languages,
      appId: app.id,
      finalUrl: app.app_store_url || app.google_play_url || 'https://example.com',
    };

    // Google Ads API를 통해 전체 캠페인 생성
    const googleAdsResult = await createFullCampaign(
      customer_id,
      googleAdsCampaignData,
      ad_group_data,
      keywords,
      ads
    );

    if (!googleAdsResult.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Google Ads 캠페인 생성 실패: ${googleAdsResult.error}`,
      }, { status: 500 });
    }

    // 로컬 DB의 캠페인 정보 업데이트
    const updateData = {
      google_ads_campaign_id: googleAdsResult.data.campaign_id,
      status: 'active' as const,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabaseApi.update<Campaign>(
      'campaigns',
      updateData,
      { id: campaign_id }
    );

    if (updateError) {
      console.error('Campaign update error:', updateError);
      // Google Ads에는 생성됐지만 DB 업데이트 실패
      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          google_ads_result: googleAdsResult.data,
          warning: 'Google Ads 캠페인은 생성되었지만 로컬 DB 업데이트에 실패했습니다.',
        },
        message: 'Google Ads 캠페인이 생성되었습니다.',
      });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        campaign_id: campaign.id,
        google_ads_campaign_id: googleAdsResult.data.campaign_id,
        google_ads_data: googleAdsResult.data,
      },
      message: 'Google Ads 캠페인이 성공적으로 생성되고 활성화되었습니다.',
    });

  } catch (error) {
    console.error('Google Ads campaign creation error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 