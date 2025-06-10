# Google Ads 자동화 시스템

모바일 앱에 대한 Google Ads 광고 캠페인을 자동으로 생성하고 관리하는 Next.js 기반 시스템입니다.

## 🚀 주요 기능

- **앱 대량 등록**: 여러 모바일 앱을 한 번에 등록하고 관리
- **자동 캠페인 생성**: Google Ads API를 통한 캠페인, 광고그룹, 키워드 자동 생성
- **실시간 모니터링**: 캠페인 성과 실시간 추적 및 관리
- **관리자 대시보드**: 직관적인 웹 인터페이스로 모든 기능 제어

## 🛠 기술 스택

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **API Integration**: Google Ads API
- **UI Components**: Lucide React, Headless UI

## 📋 사전 요구사항

1. Node.js 18+ 
2. Google Ads API 개발자 토큰
3. Supabase 프로젝트
4. Google Ads 계정 및 API 액세스 권한

## 🔧 설치 및 설정

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd google-ads-automation
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Ads API
GOOGLE_ADS_CLIENT_ID=your_google_ads_client_id
GOOGLE_ADS_CLIENT_SECRET=your_google_ads_client_secret
GOOGLE_ADS_REFRESH_TOKEN=your_google_ads_refresh_token
GOOGLE_ADS_DEVELOPER_TOKEN=your_google_ads_developer_token

# Next Auth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=your_supabase_database_url
```

### 4. 데이터베이스 스키마 생성

Supabase 대시보드에서 다음 테이블들을 생성하세요:

```sql
-- Apps 테이블
CREATE TABLE apps (
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

-- Campaigns 테이블
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  google_ads_campaign_id TEXT,
  name TEXT NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  target_countries TEXT[] NOT NULL,
  target_languages TEXT[] NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'ended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keywords 테이블
CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  match_type TEXT NOT NULL CHECK (match_type IN ('exact', 'phrase', 'broad')),
  max_cpc DECIMAL(8,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Groups 테이블
CREATE TABLE ad_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  google_ads_adgroup_id TEXT,
  name TEXT NOT NULL,
  default_cpc DECIMAL(8,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ads 테이블
CREATE TABLE ads (
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
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)에 접속하세요.

## 📚 API 엔드포인트

### Supabase API

- `GET /api/supabase/apps` - 앱 목록 조회
- `POST /api/supabase/apps` - 새 앱 생성
- `GET /api/supabase/campaigns` - 캠페인 목록 조회
- `POST /api/supabase/campaigns` - 새 캠페인 생성

### Google Ads API

- `POST /api/google-ads/campaign/create` - Google Ads 캠페인 생성

## 🎯 사용 방법

1. **앱 등록**: 대시보드에서 모바일 앱 정보를 등록합니다.
2. **캠페인 설정**: 앱별로 광고 캠페인 설정을 구성합니다.
3. **키워드 설정**: 타겟 키워드와 입찰가를 설정합니다.
4. **광고 생성**: 광고 문구와 랜딩 페이지를 설정합니다.
5. **자동 배포**: 설정된 내용으로 Google Ads 캠페인을 자동 생성합니다.

## 🚨 주의사항

- Google Ads API 사용 전에 반드시 개발자 토큰을 발급받아야 합니다.
- 실제 광고 비용이 발생할 수 있으므로 테스트 시 주의하세요.
- API 호출 제한을 고려하여 사용하세요.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 📞 지원

문제가 있거나 도움이 필요한 경우 이슈를 생성해 주세요.
