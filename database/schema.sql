-- Google Ads 자동화 시스템 데이터베이스 스키마
-- Supabase에서 실행할 SQL 스크립트

-- Apps 테이블: 모바일 앱 정보
CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  package_name TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  category TEXT NOT NULL,
  description TEXT,
  app_store_url TEXT,
  google_play_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns 테이블: 광고 캠페인 정보
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  google_ads_campaign_id TEXT,
  name TEXT NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  target_countries TEXT[] NOT NULL DEFAULT ARRAY['KR'],
  target_languages TEXT[] NOT NULL DEFAULT ARRAY['ko'],
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'ended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Groups 테이블: 광고 그룹 정보
CREATE TABLE IF NOT EXISTS ad_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  google_ads_adgroup_id TEXT,
  name TEXT NOT NULL,
  default_cpc DECIMAL(8,2) NOT NULL DEFAULT 100.00,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keywords 테이블: 키워드 정보
CREATE TABLE IF NOT EXISTS keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  ad_group_id UUID REFERENCES ad_groups(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  match_type TEXT NOT NULL CHECK (match_type IN ('exact', 'phrase', 'broad')),
  max_cpc DECIMAL(8,2) NOT NULL DEFAULT 100.00,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ads 테이블: 광고 정보
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_group_id UUID NOT NULL REFERENCES ad_groups(id) ON DELETE CASCADE,
  google_ads_ad_id TEXT,
  headline1 TEXT NOT NULL,
  headline2 TEXT NOT NULL,
  headline3 TEXT,
  description1 TEXT NOT NULL,
  description2 TEXT,
  final_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_campaigns_app_id ON campaigns(app_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_groups_campaign_id ON ad_groups(campaign_id);
CREATE INDEX IF NOT EXISTS idx_keywords_campaign_id ON keywords(campaign_id);
CREATE INDEX IF NOT EXISTS idx_keywords_ad_group_id ON keywords(ad_group_id);
CREATE INDEX IF NOT EXISTS idx_ads_ad_group_id ON ads(ad_group_id);
CREATE INDEX IF NOT EXISTS idx_apps_platform ON apps(platform);
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);

-- RLS (Row Level Security) 정책 설정 (필요시)
-- ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ad_groups ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- 샘플 데이터 삽입 (개발용)
INSERT INTO apps (name, package_name, platform, category, description, status) VALUES
('샘플 게임 앱', 'com.example.game', 'android', 'Game', '재미있는 모바일 게임입니다.', 'active'),
('피트니스 앱', 'com.example.fitness', 'ios', 'Health', '건강한 라이프스타일을 위한 앱입니다.', 'active'),
('요리 레시피 앱', 'com.example.recipe', 'android', 'Food', '다양한 요리 레시피를 제공합니다.', 'pending')
ON CONFLICT (package_name) DO NOTHING;

-- 샘플 캠페인 데이터
INSERT INTO campaigns (app_id, name, budget, target_countries, target_languages, start_date, status)
SELECT 
  a.id,
  a.name || ' 광고 캠페인',
  50000.00,
  ARRAY['KR', 'US'],
  ARRAY['ko', 'en'],
  CURRENT_DATE,
  'draft'
FROM apps a
WHERE a.name = '샘플 게임 앱'
ON CONFLICT DO NOTHING;

-- 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거: apps 테이블 updated_at 자동 업데이트
CREATE TRIGGER update_apps_updated_at 
    BEFORE UPDATE ON apps 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 트리거: campaigns 테이블 updated_at 자동 업데이트
CREATE TRIGGER update_campaigns_updated_at 
    BEFORE UPDATE ON campaigns 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE 'Google Ads 자동화 시스템 데이터베이스 스키마가 성공적으로 생성되었습니다!';
    RAISE NOTICE '샘플 데이터도 함께 삽입되었습니다.';
END $$; 