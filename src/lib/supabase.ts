// Supabase API 헬퍼 함수들 (클라이언트 SDK 사용 안함)

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

export const supabaseConfig: SupabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

export interface SupabaseRequestOptions {
  table: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  select?: string;
  filter?: Record<string, any>;
  headers?: Record<string, string>;
  useServiceRole?: boolean;
}

export async function supabaseRequest<T = any>(
  options: SupabaseRequestOptions
): Promise<{ data: T | null; error: any }> {
  const { table, method, body, select, filter, useServiceRole = false } = options;
  
  const baseUrl = `${supabaseConfig.url}/rest/v1/${table}`;
  const apiKey = useServiceRole ? supabaseConfig.serviceRoleKey : supabaseConfig.anonKey;
  
  // URL 구성
  let url = baseUrl;
  const params = new URLSearchParams();
  
  if (select && method === 'GET') {
    params.append('select', select);
  }
  
  if (filter && method === 'GET') {
    Object.entries(filter).forEach(([key, value]) => {
      params.append(key, `eq.${value}`);
    });
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  // 헤더 구성
  const headers: Record<string, string> = {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...options.headers,
  };
  
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      return { data: null, error: errorData };
    }
    
    const data = method === 'DELETE' ? null : await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// 편의 함수들
export const supabaseApi = {
  // SELECT 쿼리
  select: <T>(table: string, select = '*', filter?: Record<string, any>) =>
    supabaseRequest<T[]>({ table, method: 'GET', select, filter }),
  
  // INSERT 쿼리
  insert: <T>(table: string, data: Partial<T>) =>
    supabaseRequest<T>({ table, method: 'POST', body: data }),
  
  // UPDATE 쿼리
  update: <T>(table: string, data: Partial<T>, filter: Record<string, any>) =>
    supabaseRequest<T>({ table, method: 'PATCH', body: data, filter }),
  
  // DELETE 쿼리
  delete: (table: string, filter: Record<string, any>) =>
    supabaseRequest({ table, method: 'DELETE', filter }),
}; 