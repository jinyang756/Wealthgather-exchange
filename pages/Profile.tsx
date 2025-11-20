
import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { 
  ShieldCheck, Settings, LogOut, ChevronRight, 
  User, Building2, Eye, Headset, Minimize2, BrainCircuit, RefreshCw, Send
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMarket } from '../contexts/MarketContext';
import { useNavigate } from 'react-router-dom';
import { UserRole, UserLevel } from '../types';
import { supabase } from '../lib/supabaseClient';

type ToastType = 'success' | 'error';
type DiagnosisStatus = 'idle' | 'analyzing' | 'done';
type Message = { id: string; text: string; sender: 'user' | 'agent' };

const UserAvatar: React.FC<{ role: UserRole; level: UserLevel }> = ({ role, level }) => {
  let Icon = User;
  if (role === 'org') Icon = Building2;
  const isGold = level === 'BLACK_GOLD';
  return (
    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center ${isGold ? 'bg-gradient-to-b from-gray-900 to-black border-2 border-[#D4AF37]' : 'bg-dark-card border border-white/10'}`}>
      <Icon size={24} className={`md:w-8 md:h-8 ${isGold ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
    </div>
  );
};

const ServiceChat: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([{ id: '1', text: '尊敬的会员，您好！我是您的专属财务顾问。', sender: 'agent' }]);
  const [inputText, setInputText] = useState('');
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), text: inputText, sender: 'user' }]);
    setInputText('');
    setTimeout(() => {
      setMessages(p => [...p, { id: Date.now().toString(), text: "收到，已为您接入人工。", sender: 'agent' }]);
    }, 1000);
  };
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
       <div className="bg-[#1A1A1A] w-full max-w-md h-[500px] rounded-2xl border border-white/10 flex flex-col shadow-2xl animate-bounce-in">
          <div className="p-4 border-b border-white/10 flex justify-between"><h3 className="text-white font-bold">专属客服</h3><button onClick={onClose}><Minimize2 className="text-gray-400 hover:text-white"/></button></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
             {messages.map(msg => (<div key={msg.id} className={`flex ${msg.sender==='user'?'justify-end':'justify-start'}`}><div className={`p-3 rounded-xl text-sm max-w-[80%] ${msg.sender==='user'?'bg-primary-gold text-black font-medium':'bg-white/10 text-white'}`}>{msg.text}</div></div>))}
          </div>
          <div className="p-3 flex gap-2 bg-[#141414] rounded-b-2xl border-t border-white/5"><input value={inputText} onChange={e=>setInputText(e.target.value)} placeholder="输入问题..." className="flex-1 bg-black border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-primary-gold"/><button onClick={handleSendMessage} className="p-2 bg-primary-gold rounded-xl text-black hover:brightness-110"><Send size={18}/></button></div>
       </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { allStocks, userHoldings } = useMarket();
  const navigate = useNavigate();
  
  const [isAssetVisible, setIsAssetVisible] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [diagStatus, setDiagStatus] = useState<DiagnosisStatus>('idle');
  const [diagResult, setDiagResult] = useState<any>(null);
  const [cashBalance, setCashBalance] = useState(0);

  useEffect(() => {
    if(user) {
      supabase.from('profiles').select('cash_balance').eq('id', user.id).single().then(({data}) => {
        if(data) setCashBalance(data.cash_balance || 0);
      });
    }
  }, [user]);

  // Calculate Real-time Asset Value
  const realTimeData = useMemo(() => {
    let stockValue = 0;
    let todayPnL = 0;
    
    userHoldings.forEach(h => {
      const stock = allStocks.find(s => s.symbol === h.symbol || s.code === h.symbol.replace(/^(sh|sz)/, ''));
      const price = stock ? stock.price : h.cost;
      stockValue += price * h.quantity;
      
      if (stock) {
        // Approximation: Today's PnL = ChangeAmount * Quantity
        todayPnL += stock.changeAmount * h.quantity;
      }
    });
    
    const totalAssets = cashBalance + stockValue;
    return { totalAssets, todayPnL, stockValue, cash: cashBalance };
  }, [allStocks, userHoldings, cashBalance]);

  const handleStartDiagnosis = () => {
    setDiagStatus('analyzing');
    setTimeout(() => {
      setDiagStatus('done');
      const score = realTimeData.todayPnL >= 0 ? 92 : 75;
      const summary = realTimeData.todayPnL >= 0 ? "持仓表现优异，建议继续持有。" : "近期市场波动较大，建议关注风险。";
      setDiagResult({ score, summary, risk: "低" });
    }, 2000);
  };

  const pieData = [
    { name: '股票', value: realTimeData.stockValue || 1, color: '#D4AF37' },
    { name: '现金', value: realTimeData.cash || 1, color: '#00C851' }
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-28 md:pb-8 font-sans">
      
      {/* ASSET CARD */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#121212] border border-white/10 p-6">
         <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-gold/10 blur-[80px] pointer-events-none"></div>
         <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                   <UserAvatar role={user?.role || 'personal'} level={user?.level || 'MEMBER'} />
                   <div>
                      <h1 className="text-lg font-bold text-white">{user?.name}</h1>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-mono text-gray-400 border border-white/5">ID: {user?.id?.slice(0,8)}</span>
                         {user?.role === 'org' && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-bold border border-blue-500/20">机构认证</span>}
                      </div>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => setIsAssetVisible(!isAssetVisible)} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"><Eye size={18}/></button>
                   <button onClick={() => setShowChat(true)} className="p-2 bg-primary-gold text-black rounded-full hover:brightness-110 animate-pulse shadow-lg shadow-primary-gold/20"><Headset size={18}/></button>
                </div>
            </div>
            <div>
                <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wider">总资产估值 (CNY)</p>
                <div className="flex items-baseline gap-3">
                   <span className="text-3xl md:text-5xl font-bold text-white font-mono tracking-tight">
                      {isAssetVisible ? `¥${realTimeData.totalAssets.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '****'}
                   </span>
                   {isAssetVisible && (
                      <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${realTimeData.todayPnL>=0?'bg-status-profit/10 text-status-profit border border-status-profit/20':'bg-status-loss/10 text-status-loss border border-status-loss/20'}`}>
                         {realTimeData.todayPnL>=0?'+':''}{realTimeData.todayPnL.toLocaleString()}
                      </span>
                   )}
                </div>
            </div>
         </div>
      </div>

      {/* AI HUD */}
      <div className="bg-dark-card rounded-xl border border-white/5 overflow-hidden relative shadow-lg">
          {diagStatus === 'idle' && (
             <div className="p-3 flex items-center justify-between bg-gradient-to-r from-dark-card to-[#1a1a1a]">
                <div className="flex items-center gap-3">
                   <div className="p-1.5 bg-primary-gold/10 rounded-lg"><BrainCircuit size={18} className="text-primary-gold" /></div>
                   <h3 className="font-bold text-white text-sm">AI 账户诊断</h3>
                </div>
                <button onClick={handleStartDiagnosis} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white flex items-center gap-1 border border-white/5 transition-all">开始扫描 <ChevronRight size={12} /></button>
             </div>
          )}
          {diagStatus === 'analyzing' && (
             <div className="p-4 flex items-center justify-center gap-3 bg-[#141414]">
                <RefreshCw size={20} className="text-primary-gold animate-spin" />
                <span className="text-sm text-gray-400 font-mono">正在分析持仓结构...</span>
             </div>
          )}
          {diagStatus === 'done' && (
             <div className="p-4 flex gap-4 items-center bg-[#141414]">
                <div className="flex-1">
                   <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold">诊断完成</h3>
                      <span className="text-primary-gold font-bold text-lg">{diagResult.score}分</span>
                   </div>
                   <p className="text-xs text-gray-400 leading-relaxed">{diagResult.summary}</p>
                </div>
                <div className="w-20 h-20">
                   <ResponsiveContainer>
                      <PieChart>
                         <Pie data={pieData} innerRadius={15} outerRadius={35} dataKey="value" stroke="none">
                            <Cell fill="#D4AF37"/><Cell fill="#00C851"/>
                         </Pie>
                      </PieChart>
                   </ResponsiveContainer>
                </div>
             </div>
          )}
      </div>

      {/* MENU */}
      <div className="bg-dark-card rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5 shadow-lg">
         <MenuItem icon={User} label="个人信息" onClick={() => {}} />
         <MenuItem icon={ShieldCheck} label="安全中心" onClick={() => {}} />
         <MenuItem icon={Settings} label="系统设置" onClick={() => {}} />
         <button onClick={() => { if(window.confirm('确认退出登录?')) { logout(); navigate('/login'); }}} className="w-full p-4 flex gap-3 hover:bg-red-500/5 text-left items-center group transition-colors">
            <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors"><LogOut size={16} className="text-red-500" /></div>
            <span className="text-sm font-medium text-red-500">退出登录</span>
         </button>
      </div>

      {showChat && <ServiceChat onClose={() => setShowChat(false)} />}
    </div>
  );
};

const MenuItem: React.FC<{ icon: any; label: string; onClick: () => void }> = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors group text-left">
     <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary-gold/20 transition-colors">
           <Icon size={16} className="text-gray-400 group-hover:text-primary-gold transition-colors" />
        </div>
        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{label}</span>
     </div>
     <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400" />
  </button>
);

export default Profile;
