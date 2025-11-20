import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://nckohppnjcabxqfzyvyh.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'SUPABASE_CLIENT_API_KEY';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variables (SUPABASE_URL or SUPABASE_KEY).');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  }
});

// 辅助函数：检查数据库连接
// 返回 true 表示网络连通（即使是 401/403 错误，也说明连上了服务器）
// 返回 false 表示网络不通或配置错误
export const checkConnection = async () => {
  try {
    // 尝试读取一个公开的或存在的表，只请求 1 行，减少开销
    // 即使被 RLS 拒绝，只要返回了 response，就说明连接成功
    const { error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      // 如果是网络错误，通常 message 会包含 fetch failed
      if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('Network request failed'))) {
        console.error("Supabase Network Error:", error);
        return false;
      }
    }
    return true;
  } catch (e) {
    console.error("Supabase connection exception:", e);
    return false;
  }
};