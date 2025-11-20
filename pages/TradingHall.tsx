
import React, { useState, useEffect } from 'react';
import { 
  Zap, AlertTriangle, Activity, MousePointer2, 
  Briefcase, Layers, Ban, ArrowRight, FileText,
  Wifi, WifiOff, Loader2, ChevronRight, Star, Clock, Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMarket } from '../contexts/MarketContext';

// Carousel Data
const BANNERS = [
  {
    id: 1,
    title: "AI 鹰眼策略 v3.0",
    subtitle: "深度学习捕捉主力资金流向，胜率提升至 82%",
    tag: "NEW",
    bg: "bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#D4AF37]/20",
  },
  {
    id: 2,
    title: "VIP 极速交易通道",
    subtitle: "毫秒级低延迟，机构专用席位，打板成功率翻倍",
    tag: "HOT",
    bg: "bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#3b82f6]/20",
  },
  {
    id: 3,
    title: "2025 宏观策略会",
    subtitle: "首席分析师：A股震荡筑底完成，关注科技主线",
    tag: "REPORT",
    bg: "bg-gradient-to-r from-[#2a1a1a] via-[#451a1a] to-[#ff4444]/20",
  }
];

const TradingHall: React.FC = () => {
  const { user } = useAuth();
  const { news, aiSuggestions, isConnected, dbConnected } = useMarket();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [systemTime, setSystemTime] = useState(new Date());

  // Greeting Logic
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('早上好');
    else if (hour < 18) setGreeting('下午好');
    else setGreeting('晚上好');
  }, []);

  // Real-time Clock Logic (Updates every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Carousel Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleStockClick = (code: string) => {
    navigate('/trade', { state: { code } });
  };

  // Format: YYYY-MM-DD HH:mm:ss
  const formatTime = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-32 md:pb-6">
      
      {/* 1. Header Greeting & Status */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
           <h1 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2">
             {greeting}, {user?.name || '交易员'}
           </h1>
           
           {/* Status Bar: Time & Connection */}
           <div className="flex flex-wrap items-center gap-3 mt-2">
              {/* Real-time Clock */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#000] border border-white/10 shadow-sm">
                 <Clock size={12} className="text-primary-gold" />
                 <span className="text-xs font-mono text-primary-gold font-bold tracking-wider">
                   {formatTime(systemTime)}
                 </span>
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 text-[10px] md:text-xs font-normal border border-white/5">
                 {isConnected ? <Wifi size={12} className="text-status-profit" /> : <WifiOff size={12} className="text-status-loss" />}
                 <span className={isConnected ? "text-status-profit" : "text-gray-500"}>
                   {isConnected ? '行情节点在线' : '连接中...'}
                 </span>
              </div>

              {/* Database Status */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 text-[10px] md:text-xs font-normal border border-white/5">
                 {dbConnected ? <Database size={12} className="text-status-profit" /> : <Database size={12} className="text-status-loss animate-pulse" />}
                 <span className={dbConnected ? "text-status-profit" : "text-status-loss"}>
                   {dbConnected ? '云端数据库正常' : '数据库重连中'}
                 </span>
              </div>
           </div>
        </div>
      </header>

      {/* 2. Carousel */}
      <section className="relative w-full h-40 md:h-48 rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
         {BANNERS.map((banner, index) => (
            <div 
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'} ${banner.bg}`}
            >
               <div className="relative z-20 h-full flex flex-col justify-center px-6 md:px-10">
                  <span className="inline-block w-fit px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/10 mb-2 backdrop-blur-sm">
                    {banner.tag}
                  </span>
                  <h2 className="text-xl md:text-3xl font-bold text-white mb-2 tracking-wide">{banner.title}</h2>
                  <p className="text-xs md:text-base text-gray-300 max-w-md mb-4 line-clamp-2">{banner.subtitle}</p>
                  
                  <button className="w-fit px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white border border-white/10 backdrop-blur-md flex items-center gap-2 transition-all">
                     查看详情 <ArrowRight size={12} />
                  </button>
               </div>
            </div>
         ))}
      </section>

      {/* 3. Quick Actions */}
      <section>
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">快捷入口</h3>
        <div className="grid grid-cols-4 gap-3 md:gap-6">
          {[
            { icon: MousePointer2, label: '一键打板', color: 'text-purple-400', bg: 'bg-purple-400/10', path: '/fast-lane' },
            { icon: Briefcase, label: '大宗交易', color: 'text-blue-400', bg: 'bg-blue-400/10', path: '/fast-lane' },
            { icon: Layers, label: '新股申购', color: 'text-primary-gold', bg: 'bg-primary-gold/10', path: '/fast-lane' },
            { icon: Ban, label: '快速撤单', color: 'text-gray-400', bg: 'bg-gray-400/10', path: '/trade' },
          ].map((action) => (
            <button 
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-dark-card border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all group`}
            >
              <div className={`p-3 rounded-full ${action.bg} group-hover:scale-110 transition-transform`}>
                <action.icon size={20} className={action.color} />
              </div>
              <span className="text-[10px] md:text-xs font-medium text-gray-300 group-hover:text-white">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. AI & Hot Ops */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Suggestions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
             <div className="p-1 bg-primary-gold/10 rounded">
               <Zap size={14} className="text-primary-gold" />
             </div>
             <h3 className="font-bold text-white text-sm">AI 策略信号</h3>
          </div>
          
          <div className="grid gap-3">
             {aiSuggestions.length > 0 ? aiSuggestions.slice(0, 2).map(sug => (
               <div key={sug.id} className="bg-dark-card border border-white/5 p-4 rounded-xl hover:border-primary-gold/30 transition-colors cursor-pointer group" onClick={() => sug.stockCode && handleStockClick(sug.stockCode)}>
                  <div className="flex justify-between mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${sug.type === 'RISK' ? 'bg-status-warning/10 text-status-warning' : 'bg-status-profit/10 text-status-profit'}`}>
                      {sug.type === 'RISK' ? <AlertTriangle size={12} /> : <Activity size={12} />}
                      {sug.title}
                    </span>
                    <span className="text-[10px] text-gray-500">{sug.time}</span>
                  </div>
                  <p className="text-xs text-gray-300 mb-2 line-clamp-2">{sug.description}</p>
               </div>
             )) : (
                <div className="bg-dark-card border border-white/5 p-6 rounded-xl text-center">
                   <Loader2 className="w-5 h-5 animate-spin text-primary-gold mx-auto mb-2" />
                   <p className="text-xs text-gray-500">AI正在运算中...</p>
                </div>
             )}
          </div>
        </div>

        {/* Hot Sectors */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-red-500/10 rounded">
              <Star size={14} className="text-status-profit" />
            </div>
            <h3 className="font-bold text-white text-sm">资金流向</h3>
          </div>

          <div className="bg-dark-card border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
             {[
                { name: '中特估', flow: '主力净买入', icon: 'CN' },
                { name: '半导体', flow: '震荡', icon: 'SE' },
                { name: '新能源', flow: '小幅流出', icon: 'NE' },
             ].map((sector, idx) => (
                <div key={sector.name} className="flex items-center justify-between p-3 hover:bg-white/5">
                   <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${idx===0?'bg-red-500/20 text-red-500':'bg-gray-700 text-gray-400'}`}>{idx+1}</span>
                      <span className="text-sm text-gray-300">{sector.name}</span>
                   </div>
                   <span className={`text-xs font-bold ${idx===0 ? 'text-status-profit' : 'text-gray-400'}`}>{sector.flow}</span>
                </div>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TradingHall;
