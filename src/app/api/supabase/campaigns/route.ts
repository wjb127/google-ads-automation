import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase';
import { Campaign, ApiResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// GET: 모든 캠페인 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const app_id = searchParams.get('app_id');
    const status = searchParams.get('status');

    const filter: Record<string, unknown> = {};
    if (app_id) filter.app_id = app_id;
    if (status) filter.status = status;

    const { data, error } = await supabaseApi.select<Campaign>('campaigns', '*', filter);

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '캠페인 목록을 불러오는데 실패했습니다.',
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<Campaign[]>>({
      success: true,
      data: data || [],
      message: '캠페인 목록을 성공적으로 불러왔습니다.',
    });
  } catch (error) {
    console.error('Campaigns GET error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// POST: 새 캠페인 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      app_id,
      name,
      budget,
      target_countries,
      target_languages,
      start_date,
      end_date,
    } = body;

    // 필수 필드 검증
    if (!app_id || !name || !budget || !target_countries || !start_date) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '필수 필드가 누락되었습니다.',
      }, { status: 400 });
    }

    const newCampaign: Partial<Campaign> = {
      id: uuidv4(),
      app_id,
      name,
      budget,
      target_countries: Array.isArray(target_countries) ? target_countries : [target_countries],
      target_languages: Array.isArray(target_languages) ? target_languages : [target_languages || 'ko'],
      start_date,
      end_date,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseApi.insert<Campaign>('campaigns', newCampaign);

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '캠페인 생성에 실패했습니다.',
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<Campaign>>({
      success: true,
      data: Array.isArray(data) ? data[0] : data,
      message: '캠페인이 성공적으로 생성되었습니다.',
    }, { status: 201 });
  } catch (error) {
    console.error('Campaigns POST error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 