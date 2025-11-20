// 模拟 Vercel 部署环境检查
const fs = require('fs');
const path = require('path');

console.log('🔍 检查 Vercel 部署所需文件...');

// 检查必要文件
const requiredFiles = [
  'package.json',
  'index.html',
  'vite.config.ts',
  'vercel.json'
];

const missingFiles = [];

requiredFiles.forEach(file => {
  if (!fs.existsSync(path.join(__dirname, file))) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log('❌ 缺少必要文件:', missingFiles);
  process.exit(1);
}

console.log('✅ 所有必需文件都已存在');

// 检查 package.json 中的构建脚本
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

const requiredScripts = ['build'];
const missingScripts = [];

requiredScripts.forEach(script => {
  if (!packageJson.scripts[script]) {
    missingScripts.push(script);
  }
});

if (missingScripts.length > 0) {
  console.log('❌ package.json 中缺少必要脚本:', missingScripts);
  process.exit(1);
}

console.log('✅ package.json 中包含必要的构建脚本');

// 检查 vercel.json 配置
try {
  const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8'));
  if (!vercelConfig.routes && !vercelConfig.rewrites) {
    console.log('⚠️  vercel.json 中没有配置路由，这可能导致路由问题');
  } else {
    console.log('✅ vercel.json 配置正确');
  }
} catch (err) {
  console.log('❌ vercel.json 格式错误:', err.message);
  process.exit(1);
}

console.log('\n🎉 项目已准备好部署到 Vercel！');
console.log('\n部署步骤:');
console.log('1. 确保已安装 Vercel CLI: npm install -g vercel');
console.log('2. 登录 Vercel: vercel login');
console.log('3. 部署项目: vercel --prod');