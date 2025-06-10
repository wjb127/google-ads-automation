# 🚀 Google Ads 자동화 시스템 설치 가이드

## 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# Supabase 설정
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Ads API 설정
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret  
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token

# Next.js 설정
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

## 2. Supabase 데이터베이스 설정

### 2-1. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 URL과 API 키 복사

### 2-2. 데이터베이스 스키마 생성
1. Supabase 대시보드 → SQL Editor로 이동
2. `database/schema.sql` 파일의 내용을 복사하여 실행
3. 또는 아래 명령어로 직접 실행:

```sql
-- 전체 스키마를 복사하여 Supabase SQL Editor에서 실행하세요
```

### 2-3. RLS (Row Level Security) 설정 (선택사항)
보안이 필요한 경우 다음 명령어를 추가로 실행:

```sql
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- 기본 정책 (모든 사용자 읽기/쓰기 허용)
CREATE POLICY "Enable all access for all users" ON apps FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON campaigns FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON ad_groups FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON keywords FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON ads FOR ALL USING (true);
```

## 3. Google Ads API 설정

### 3-1. Google Ads API 계정 설정
1. [Google Ads API](https://developers.google.com/google-ads/api) 개발자 계정 생성
2. OAuth2 클라이언트 ID 생성
3. 개발자 토큰 신청 및 승인

### 3-2. OAuth2 인증 토큰 생성
```bash
# Google Ads API OAuth2 도구 사용
# 또는 Google OAuth2 Playground 활용
```

## 4. 개발 서버 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

## 5. 테스트

1. 브라우저에서 `http://localhost:3000` 접속
2. 대시보드에서 샘플 데이터 확인
3. API 엔드포인트 테스트:
   - `GET /api/supabase/apps` - 앱 목록
   - `GET /api/supabase/campaigns` - 캠페인 목록

## 6. 문제 해결

### API 500 에러 발생 시
1. 환경 변수가 올바르게 설정되었는지 확인
2. Supabase 테이블이 생성되었는지 확인
3. 네트워크 연결 상태 확인

### Google Ads API 연동 실패 시
1. 개발자 토큰 상태 확인
2. OAuth2 토큰 유효성 확인
3. API 권한 설정 확인

## 7. 배포

### Vercel 배포
```bash
npm run build
vercel --prod
```

### 환경 변수 설정
배포 시 환경 변수를 배포 플랫폼에 설정해야 합니다.

---

문제가 발생하면 GitHub Issues에 문의해주세요! 