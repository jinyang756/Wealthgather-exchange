import { supabase, checkConnection } from './lib/supabaseClient';

async function testDatabaseConnection() {
  console.log('Testing Supabase database connection...');
  
  // 使用现有的检查连接函数
  const isConnected = await checkConnection();
  
  if (isConnected) {
    console.log('✅ Database connection successful');
    
    // 进一步测试：尝试获取用户表的一些信息
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .limit(1);
      
      if (error) {
        console.log('⚠️  Connection OK but query failed:', error.message);
      } else {
        console.log('✅ Query test successful, sample data:', data);
      }
    } catch (queryError) {
      console.log('⚠️  Query test failed:', queryError);
    }
  } else {
    console.log('❌ Database connection failed');
  }
  
  // 显示配置信息（隐藏敏感信息）
  console.log('\nConfiguration Info:');
  console.log('- Supabase client initialized');
}

testDatabaseConnection();