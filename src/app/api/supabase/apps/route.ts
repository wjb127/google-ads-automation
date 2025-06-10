import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase';
import { App, ApiResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// GET: 모든 앱 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');

    const filter: Record<string, unknown> = {};
    if (platform) filter.platform = platform;
    if (status) filter.status = status;

    const { data, error } = await supabaseApi.select<App>('apps', '*', filter);

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '앱 목록을 불러오는데 실패했습니다.',
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<App[]>>({
      success: true,
      data: data || [],
      message: '앱 목록을 성공적으로 불러왔습니다.',
    });
  } catch (error) {
    console.error('Apps GET error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// POST: 새 앱 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      package_name,
      platform,
      category,
      description,
      app_store_url,
      google_play_url,
    } = body;

    // 필수 필드 검증
    if (!name || !package_name || !platform || !category) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '필수 필드가 누락되었습니다.',
      }, { status: 400 });
    }

    const newApp: Partial<App> = {
      id: uuidv4(),
      name,
      package_name,
      platform,
      category,
      description,
      app_store_url,
      google_play_url,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseApi.insert<App>('apps', newApp);

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '앱 생성에 실패했습니다.',
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<App>>({
      success: true,
      data: Array.isArray(data) ? data[0] : data,
      message: '앱이 성공적으로 생성되었습니다.',
    }, { status: 201 });
  } catch (error) {
    console.error('Apps POST error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '서버 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 