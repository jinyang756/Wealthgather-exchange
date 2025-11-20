
import React, { useState, useEffect } from 'react';
import { 
  Zap, Briefcase, Layers, Activity, Signal, ShieldCheck, Lock, 
  Server, Clock, ChevronRight, AlertTriangle, CheckCircle2,
  TrendingUp, MousePointer2, Calendar
} from 'lucide-react';
import { useMarket } from '../contexts/MarketContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// --- TYPES ---
type LaneModule = 'sniper' | 'block' | 'ipo';

// --- COMPONENTS ---

const LatencyMonitor = () => {
  const [latency, setLatency] = useState(12);
  useEffect(() => {
    const interval = setInterval(() => setLatency(prev => Math.max(8, Math.min(15, prev + Math.floor(Math.random() * 5) - 2))), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-[#1A1A1A] to-[#111] border-b border-white/5 p-4 flex justify-between items-center">
       <div className="flex items-center gap-3">
          <div className="relative">
             <div className="w-3 h-3 bg-status-profit rounded-full animate-pulse"></div>
             <div className="absolute inset-0 bg-status-profit rounded-full animate-ping opacity-20"></div>
          </div>
          <div>
             <div className="text-primary-gold font-bold text-sm tracking-wider">专用极速通道 (VIP)</div>
             <div className="text-[10px] text-gray-500 font-mono flex items-center gap-2">
                <Server size={10} /> 节点: SH-Direct-A01
             </div>
          </div>
       </div>
       <div className="flex gap-4 text-xs font-mono">
          <div className="flex flex-col items-end">
             <span className="text-gray-500 text-[10px]">网络延迟</span>
             <span className="text-status-profit font-bold">{latency}ms</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-gray-500 text-[10px]">风控状态</span>
             <span className="text-status-profit font-bold flex items-center gap-1"><ShieldCheck size={10}/>PASS</span>
          </div>
       </div>
    </div>
  );
};

const FastLane: React.FC = () => {
  const { user } = useAuth();
  const { ipoData, blockTrades, allStocks } = useMarket();
  const [activeModule, setActiveModule] = useState<LaneModule>('sniper');
  const [sniperCode, setSniperCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  
  // Premium Gating
  const hasAccess = user?.role === 'org' || user?.role === 'admin' || user?.isPlatinum;

  if (!hasAccess) {
     return (
        <div className="h-[calc(100vh-60px)] flex flex-col items-center justify-center p-6 text-center bg-[#0a0a0a]">
           <Lock size={64} className="text-primary-gold mb-6 opacity-50" />
           <h2 className="text-2xl font-bold text-white mb-2">机构专用通道</h2>
           <p className="text-gray-500 mb-8 max-w-xs">此功能仅对认证机构投资者及黑金会员开放，提供毫秒级极速交易与大宗撮合服务。</p>
           <button className="px-8 py-3 bg-primary-gold text-black font-bold rounded-xl hover:brightness-110 transition-all">
              联系客户经理开通
           </button>
        </div>
     );
  }

  // Find top performers for "Ladder"
  const topStocks = [...allStocks].sort((a,b) => b.change - a.change).slice(0, 3);

  // --- ACTION: SNIPER ORDER ---
  const handleSniperOrder = async () => {
    if (!sniperCode || !user) return;
    setIsProcessing(true);
    try {
        // Simulate Sniper Logic: Insert a PENDING BUY order at market price
        // In a real app, we would fetch current price. Here we default to 0 (Market Order) or fetch from allStocks if found.
        const stock = allStocks.find(s => s.code === sniperCode);
        const price = stock ? stock.price : 0;
        const name = stock ? stock.name : '狙击标的';

        const { error } = await supabase.from('orders').insert({
            user_id: user.id,
            stock_code: sniperCode,
            stock_name: name,
            type: 'BUY',
            price: price,
            amount: 1000, // Default batch
            status: 'PENDING' // Sniper orders queue first
        });
        if (error) throw error;
        alert(`已将 ${sniperCode} 加入极速排队序列`);
        setSniperCode('');
    } catch (e) {
        alert('排队请求失败');
    } finally {
        setIsProcessing(false);
    }
  };

  // --- ACTION: IPO SUBSCRIBE ---
  const handleBatchIPO = async () => {
    if (!user || ipoData.length === 0) return;
    if (!window.confirm(`确认一键申购今日所有 ${ipoData.length} 只新股？`)) return;
    
    setIsProcessing(true);
    try {
        const orders = ipoData.filter(i => i.status === 'SUBSCRIBE').map(ipo => ({
            user_id: user.id,
            stock_code: ipo.code,
            stock_name: ipo.name,
            type: 'BUY',
            price: ipo.price,
            amount: 500, // Min subscription
            status: 'PENDING' // IPO requires balloting
        }));

        if (orders.length > 0) {
            const { error } = await supabase.from('orders').insert(orders);
            if (error) throw error;
            alert('新股申购指令已批量报送');
        } else {
            alert('今日无新股可申购');
        }
    } catch (e) {
        alert('申购失败');
    } finally {
        setIsProcessing(false);
    }
  };

  // --- ACTION: BLOCK TRADE ---
  const handleBlockIntent = async () => {
      if (!user) return;
      setIsProcessing(true);
      // Simulate inserting an intent record (using orders table for demo as PENDING)
      try {
        // Just a mock "Intent" insertion for feedback
        const { error } = await supabase.from('orders').insert({
            user_id: user.id,
            stock_code: 'BLOCK', 
            stock_name: '大宗意向申报',
            type: 'BUY',
            price: 0,
            amount: 0,
            status: 'PENDING'
        });
        if (error) throw error;
        alert('意向申报已提交，合规部将在 10 分钟内联系您。');
      } catch(e) {
          alert('申报失败');
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans pb-20 md:pb-0">
       <LatencyMonitor />
       
       {/* Main Navigation Tabs */}
       <div className="grid grid-cols-3 p-2 gap-2 sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/5">
          <button 
             onClick={() => setActiveModule('sniper')}
             className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all ${activeModule === 'sniper' ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-white/5 border-transparent text-gray-500'}`}
          >
             <Zap size={20} className="mb-1" />
             <span className="text-xs font-bold">涨停狙击</span>
          </button>
          <button 
             onClick={() => setActiveModule('block')}
             className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all ${activeModule === 'block' ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-transparent text-gray-500'}`}
          >
             <Briefcase size={20} className="mb-1" />
             <span className="text-xs font-bold">大宗交易</span>
          </button>
          <button 
             onClick={() => setActiveModule('ipo')}
             className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all ${activeModule === 'ipo' ? 'bg-primary-gold/20 border-primary-gold/50 text-primary-gold' : 'bg-white/5 border-transparent text-gray-500'}`}
          >
             <Layers size={20} className="mb-1" />
             <span className="text-xs font-bold">新股申购</span>
          </button>
       </div>

       {/* Content Area */}
       <div className="p-4 space-y-6">
          
          {/* --- MODULE 1: SNIPER (打板) --- */}
          {activeModule === 'sniper' && (
             <div className="animate-fade-in space-y-6">
                <div className="bg-[#141414] border border-red-500/20 rounded-2xl p-5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 px-2 py-1 bg-red-600 text-[10px] text-white font-bold rounded-bl-lg">极速排队模式</div>
                   
                   <div className="mb-4">
                      <label className="text-xs text-gray-500 block mb-2">狙击标的 (代码)</label>
                      <div className="flex gap-2">
                         <input 
                           type="text" 
                           value={sniperCode}
                           onChange={e => setSniperCode(e.target.value)}
                           className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-lg outline-none focus:border-red-500 transition-colors placeholder-gray-700"
                           placeholder="输入6位代码"
                         />
                         <button className="px-6 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white">
                            <Activity size={20} />
                         </button>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                         <div className="text-[10px] text-gray-500 mb-1">封单额 (预估)</div>
                         <div className="text-white font-mono font-bold">¥2.4亿</div>
                      </div>
                      <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                         <div className="text-[10px] text-gray-500 mb-1">排队概率</div>
                         <div className="text-red-500 font-mono font-bold">High</div>
                      </div>
                   </div>

                   <button 
                     onClick={handleSniperOrder}
                     disabled={!sniperCode || isProcessing}
                     className="w-full py-4 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                   >
                      {isProcessing ? '排队指令发送中...' : <><MousePointer2 size={20} /> 立即排队打板</>}
                   </button>
                   <p className="text-[10px] text-gray-600 text-center mt-3">
                      *使用独立席位通道，直接报送交易所主机
                   </p>
                </div>

                {/* Market Sentiment - Now Real Data */}
                <div>
                   <h3 className="text-gray-400 text-xs font-bold mb-3 flex items-center gap-2"><TrendingUp size={14}/> 实时领涨天梯</h3>
                   <div className="space-y-2">
                      {topStocks.length > 0 ? topStocks.map((stock, idx) => (
                         <div key={stock.code} className="flex justify-between items-center p-3 bg-[#141414] border border-white/5 rounded-xl" onClick={() => navigate('/trade', { state: { code: stock.code } })}>
                            <div>
                               <div className="text-white font-bold text-sm">{stock.name}</div>
                               <div className="text-[10px] text-gray-500 font-mono">{stock.code}</div>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold rounded">{idx+1}板</span>
                               <span className="text-red-500 font-mono font-bold">+{stock.change}%</span>
                            </div>
                         </div>
                      )) : (
                         <div className="text-center text-gray-500 text-xs py-4">加载中...</div>
                      )}
                   </div>
                </div>
             </div>
          )}

          {/* --- MODULE 2: BLOCK TRADE (大宗) --- */}
          {activeModule === 'block' && (
             <div className="animate-fade-in space-y-6">
                <div className="bg-[#141414] border border-blue-500/20 rounded-2xl p-5">
                   <h3 className="text-blue-400 font-bold text-sm mb-4 flex items-center gap-2">
                      <Briefcase size={16} /> 意向申报
                   </h3>
                   <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                         <input type="text" placeholder="股票代码" className="bg-black border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500" />
                         <select className="bg-black border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500">
                            <option>买入意向</option>
                            <option>卖出意向</option>
                         </select>
                      </div>
                      <div className="pt-2">
                         <button onClick={handleBlockIntent} disabled={isProcessing} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50">
                            {isProcessing ? '提交中...' : '发布申报'}
                         </button>
                      </div>
                   </div>
                </div>

                <div>
                   <div className="flex justify-between items-center mb-3">
                      <h3 className="text-gray-400 text-xs font-bold">市场实时机会 (基于实时行情)</h3>
                      <span className="text-[10px] text-blue-400">折价撮合中</span>
                   </div>
                   <div className="space-y-2">
                      {blockTrades.length > 0 ? blockTrades.map(item => (
                         <div key={item.id} className="flex justify-between items-center p-3 bg-[#141414] border border-white/5 rounded-xl">
                            <div>
                               <div className="text-white font-bold text-sm flex items-center gap-2">
                                  {item.stockName}
                                  <span className="text-[9px] px-1 bg-blue-900/30 text-blue-400 rounded">折价 {Math.abs(item.discount)}%</span>
                               </div>
                               <div className="text-[10px] text-gray-500 font-mono">{item.stockCode}</div>
                            </div>
                            <div className="text-right">
                               <div className={`text-sm font-bold ${item.type==='BUY'?'text-red-500':'text-green-500'}`}>{item.type==='BUY'?'买入':'卖出'} {item.volume}万股</div>
                               <div className="text-[10px] text-gray-500">成交额: {item.amount}万</div>
                            </div>
                            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs rounded-lg border border-white/10" onClick={() => navigate('/trade', { state: { code: item.stockCode } })}>
                               洽谈
                            </button>
                         </div>
                      )) : (
                         <div className="text-center text-gray-500 text-xs py-4">正在匹配大宗机会...</div>
                      )}
                   </div>
                </div>
             </div>
          )}

          {/* --- MODULE 3: IPO (新股) --- */}
          {activeModule === 'ipo' && (
             <div className="animate-fade-in space-y-6">
                <div className="bg-gradient-to-br from-primary-gold/10 to-black border border-primary-gold/30 rounded-2xl p-6 text-center">
                   <Layers size={48} className="text-primary-gold mx-auto mb-4 opacity-80" />
                   <h3 className="text-xl font-bold text-white mb-2">一键顶格申购</h3>
                   <p className="text-gray-400 text-xs mb-6">系统自动计算最大可申购额度，合并执行所有今日新股。</p>
                   
                   <div className="flex justify-between text-sm mb-6 px-4">
                      <div className="text-center">
                         <div className="text-gray-500 text-[10px] mb-1">今日可申</div>
                         <div className="text-white font-mono font-bold">{ipoData.filter(i => i.status === 'SUBSCRIBE').length} <span className="text-[10px] font-normal">只</span></div>
                      </div>
                      <div className="text-center">
                         <div className="text-gray-500 text-[10px] mb-1">预计中签</div>
                         <div className="text-primary-gold font-mono font-bold">0.04%</div>
                      </div>
                      <div className="text-center">
                         <div className="text-gray-500 text-[10px] mb-1">需冻结资金</div>
                         <div className="text-white font-mono font-bold">0.00</div>
                      </div>
                   </div>

                   <button onClick={handleBatchIPO} disabled={isProcessing} className="w-full py-3 bg-primary-gold text-black font-bold rounded-xl hover:opacity-90 shadow-lg shadow-primary-gold/10 transition-transform active:scale-[0.98] disabled:opacity-50">
                      {isProcessing ? '申购指令报送中...' : '立即一键申购'}
                   </button>
                </div>

                <div>
                   <h3 className="text-gray-400 text-xs font-bold mb-3 flex items-center gap-2"><Calendar size={14}/> 新股发行日历</h3>
                   <div className="space-y-2">
                      {ipoData.map(stock => (
                         <div key={stock.code} className="flex justify-between items-center p-3 bg-[#141414] border border-white/5 rounded-xl">
                            <div className="flex-1">
                               <div className="flex items-center gap-2">
                                  <div className="text-white font-bold text-sm">{stock.name}</div>
                                  {stock.status === 'SUBSCRIBE' && <span className="text-[9px] bg-primary-gold text-black px-1 rounded font-bold">今日</span>}
                               </div>
                               <div className="text-[10px] text-gray-500 font-mono">{stock.code}</div>
                            </div>
                            
                            <div className="flex-1 text-center">
                               <div className="text-white font-mono text-sm">{stock.price.toFixed(2)}</div>
                               <div className="text-[10px] text-gray-500">发行价 (PE {stock.peRatio})</div>
                            </div>
                            
                            <div className="flex-1 text-right">
                               {stock.status === 'SUBSCRIBE' ? (
                                  <div className="text-primary-gold text-xs flex items-center justify-end gap-1">
                                     <CheckCircle2 size={12}/> 待申购
                                  </div>
                               ) : (
                                  <div className="text-gray-500 text-xs flex items-center justify-end gap-1">
                                     <Clock size={12}/> {stock.date}
                                  </div>
                               )}
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          )}

       </div>
    </div>
  );
};

export default FastLane;
