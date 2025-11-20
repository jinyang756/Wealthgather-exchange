
import { createClient } from '@supabase/supabase-js';

// ⚠️ 真实项目中请务必将这些放入 .env 文件
const SUPABASE_URL = 'https://nckohppnjcabxqfzyvyh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ja29ocHBuamNhYnhxZnp5dnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MTEyNTksImV4cCI6MjA3ODM4NzI1OX0.3ANZon2LK44Wfj8kAZmkLFYKj39wDXxtADmqV5QqsHg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
