
import React, { useState, useEffect, useMemo } from 'react';
import { useMarket } from '../contexts/MarketContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Line, Cell, ReferenceLine
} from 'recharts';
import { 
  ArrowUp, ArrowDown, ChevronDown, 
  CheckCircle2, Zap, LayoutDashboard, LineChart, Loader2, Search, AlertTriangle, X,
  CandlestickChart, List, Wallet, RefreshCw
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { INITIAL_CASH } from '../constants';
import { Order } from '../types';

type MobileTab = 'trade' | 'chart' | 'data';
type BottomTabType = 'positions' | 'orders';

// --- UTILS: MACD Calculation ---
const calculateMACD = (data: any[]) => {
  if (!data || data.length === 0) return [];

  const closePrices = data.map(d => d.value);
  
  const calcEMA = (m: number, prevEma: number, price: number) => {
    return (price - prevEma) * (2 / (m + 1)) + prevEma;
  };

  let ema12 = closePrices[0];
  let ema26 = closePrices[0];
  let dea = 0;

  return data.map((item, i) => {
    if (i > 0) {
      ema12 = calcEMA(12, ema12, item.value);
      ema26 = calcEMA(26, ema26, item.value);
    }
    
    const dif = ema12 - ema26;
    
    if (i === 0) {
      dea = dif;
    } else {
      dea = calcEMA(9, dea, dif);
    }

    const macd = (dif - dea) * 2;

    return {
      ...item,
      dif,
      dea,
      macd
    };
  });
};

const TradeToast: React.FC<{ message: string; visible: boolean }> = ({ message, visible }) => {
  if (!visible) return null;
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] animate-bounce-in pointer-events-none">
      <div className="bg-[#1A1A1A] border border-primary-gold/50 rounded-xl shadow-2xl shadow-black/50 px-8 py-6 flex flex-col items-center gap-3 backdrop-blur-md">
        <div className="p-3 bg-status-profit/20 rounded-full border border-status-profit/30">
           <CheckCircle2 size={32} className="text-status-profit" />
        </div>
        <h4 className="text-white font-bold text-lg">委托提交成功</h4>
        <p className="text-gray-300 text-sm">{message}</p>
      </div>
    </div>
  );
};

const Trade: React.FC = () => {
  const { allStocks, watchlist, userOrders, userHoldings } = useMarket();
  const { user } = useAuth();
  const location = useLocation();
  
  const [selectedStockCode, setSelectedStockCode] = useState<string>('');
  const [bottomTab, setBottomTab] = useState<BottomTabType>('positions');
  const [isStockDropdownOpen, setIsStockDropdownOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('trade');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Slippage Alert State
  const [showSlippageAlert, setShowSlippageAlert] = useState(false);
  const [slippageData, setSlippageData] = useState({ marketPrice: 0, diffPercent: 0 });

  // User real cash balance
  const [userCash, setUserCash] = useState(0);

  // Fetch latest cash
  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('cash_balance').eq('id', user.id).single()
        .then(({data}) => setUserCash(data?.cash_balance || 0));
    }
  }, [user, isSubmitting]); // Refresh after trade

  useEffect(() => {
    const state = location.state || {};
    if (state.code) {
      setSelectedStockCode(state.code);
      setMobileTab('trade');
    } else if (allStocks.length > 0 && !selectedStockCode) {
      setSelectedStockCode(allStocks[0].code);
    }
  }, [location.state, allStocks]);

  const selectedStock = useMemo(() => {
    if (allStocks.length === 0) return null;
    return allStocks.find(s => s.code === selectedStockCode) || allStocks[0];
  }, [allStocks, selectedStockCode]);

  // Calculate Chart Data with MACD
  const fullChartData = useMemo(() => {
     if (!selectedStock || !selectedStock.chartData) return [];
     return calculateMACD(selectedStock.chartData);
  }, [selectedStock]);

  useEffect(() => {
    if (selectedStock) {
      setPrice(selectedStock.price.toFixed(2));
      setQuantity('');
    }
  }, [selectedStock?.code]);

  // Calculate Buying Power
  const maxBuy = useMemo(() => {
    if (!selectedStock || !price || parseFloat(price) <= 0) return 0;
    // Use real user cash or initial if loading/offline
    const cash = userCash > 0 ? userCash : INITIAL_CASH;
    return Math.floor(cash / parseFloat(price)); 
  }, [selectedStock, price, userCash]);

  const currentHolding = userHoldings.find(h => h.stock_code === selectedStock?.symbol || h.stock_code === selectedStock?.code);
  const maxSell = currentHolding ? currentHolding.quantity : 0;
  const totalAmount = (parseFloat(price) || 0) * (parseFloat(quantity) || 0);

  const orderBook = useMemo(() => {
    if (!selectedStock) return { asks: [], bids: [] };
    const current = selectedStock.price;
    const spread = Math.max(0.01, current * 0.002); 
    return {
      asks: Array.from({ length: 5 }, (_, i) => ({
        price: current + spread * (5 - i),
        volume: Math.floor(Math.random() * 500 + (5-i)*100),
      })).reverse(), // [0] is Lowest Ask (Best Buy Price)
      bids: Array.from({ length: 5 }, (_, i) => ({
        price: current - spread * (i + 1),
        volume: Math.floor(Math.random() * 500 + (5-i)*100),
      })) // [0] is Highest Bid (Best Sell Price)
    };
  }, [selectedStock?.price, selectedStock?.code]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 2 }).format(val);

  // 1. Check Logic (Slippage Warning)
  const checkTrade = () => {
    if (!price || !quantity || parseFloat(quantity) <= 0) return;
    if (!selectedStock) return;
    
    const inputPrice = parseFloat(price);
    let marketPrice = 0;

    // If Buying, compare with Ask 1 (Lowest Sell Price)
    // If Selling, compare with Bid 1 (Highest Buy Price)
    if (direction === 'buy') {
       marketPrice = orderBook.asks[0]?.price || selectedStock.price;
    } else {
       marketPrice = orderBook.bids[0]?.price || selectedStock.price;
    }

    const diff = Math.abs(inputPrice - marketPrice);
    const diffPercent = (diff / marketPrice) * 100;

    // Threshold: 5%
    if (diffPercent > 5) {
       setSlippageData({ marketPrice, diffPercent });
       setShowSlippageAlert(true);
       return;
    }

    executeTrade();
  };

  // 2. Execute Logic - CONNECTED TO SUPABASE
  const executeTrade = async () => {
    setShowSlippageAlert(false);
    if (!selectedStock || !user) return;

    setIsSubmitting(true);
    
    try {
      // Insert Order into Supabase
      // Note: The 'orders' table insert trigger will handle balance updates automatically in the DB
      const { error } = await supabase.from('orders').insert({
        user_id: user.id,
        stock_code: selectedStock.code,
        stock_name: selectedStock.name,
        type: direction === 'buy' ? 'BUY' : 'SELL',
        price: parseFloat(price),
        amount: parseFloat(quantity),
        status: 'FILLED' // In this demo, we fill immediately.
      });

      if (error) throw error;

      setToastMsg(`${direction === 'buy' ? '买入' : '卖出'}委托已报送`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      setQuantity('');
      
    } catch (err) {
      console.error("Trade failed", err);
      alert("交易请求失败，请检查网络");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStocks = useMemo(() => {
    if (!searchTerm) return watchlist.length > 0 ? watchlist : allStocks.slice(0, 10);
    return allStocks.filter(s => s.code.includes(searchTerm) || s.name.includes(searchTerm)).slice(0, 20);
  }, [allStocks, watchlist, searchTerm]);

  if (!selectedStock) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-primary-gold"/></div>;

  // --- RENDER FORM ---
  const renderTradeForm = () => (
    <div className="flex flex-col h-full bg-[#121212] overflow-hidden relative">
       
       {/* Slippage Alert Modal Overlay */}
       {showSlippageAlert && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
             <div className="bg-[#1A1A1A] w-full border border-red-500/50 rounded-2xl shadow-2xl animate-bounce-in overflow-hidden">
                <div className="bg-red-500/10 p-4 border-b border-red-500/20 flex items-center gap-3">
                   <AlertTriangle className="text-red-500" size={24} />
                   <h3 className="text-red-500 font-bold text-lg">价格偏离预警</h3>
                </div>
                <div className="p-6 space-y-4">
                   <p className="text-gray-300 text-sm">
                      当前委托价格 <span className="text-white font-bold">{parseFloat(price).toFixed(2)}</span> 与市场最优价 <span className="text-status-profit font-bold">{slippageData.marketPrice.toFixed(2)}</span> 偏离 <span className="text-red-500 font-bold">{slippageData.diffPercent.toFixed(2)}%</span>。
                   </p>
                   <p className="text-gray-500 text-xs">继续交易可能导致立即产生浮亏，是否确认？</p>
                   <div className="flex gap-3 pt-2">
                      <button onClick={() => setShowSlippageAlert(false)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-gray-300">取消</button>
                      <button onClick={executeTrade} className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-bold text-white shadow-lg shadow-red-900/20">继续交易</button>
                   </div>
                </div>
             </div>
          </div>
       )}

       <div className="p-4 space-y-4 overflow-y-auto pb-20">
          {/* Direction Toggle */}
          <div className="flex p-1 bg-black rounded-xl border border-white/10">
             <button onClick={() => setDirection('buy')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${direction === 'buy' ? 'bg-status-profit text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>买入</button>
             <button onClick={() => setDirection('sell')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${direction === 'sell' ? 'bg-status-loss text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>卖出</button>
          </div>

          {/* Price Input */}
          <div className="space-y-1">
             <label className="text-xs text-gray-500 ml-1">委托价格</label>
             <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-primary-gold transition-colors">
                <span className="text-gray-400 text-xs mr-2">¥</span>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="bg-transparent flex-1 text-white font-mono text-lg outline-none" />
             </div>
          </div>

          {/* Quantity Input */}
          <div className="space-y-1">
             <label className="text-xs text-gray-500 ml-1">委托数量</label>
             <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-primary-gold transition-colors">
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder={`最多${direction==='buy'?'买':'卖'} ${direction==='buy'?maxBuy:maxSell}`} className="bg-transparent flex-1 text-white font-mono text-lg outline-none placeholder:text-gray-600 placeholder:text-sm" />
                <span className="text-gray-400 text-xs ml-2">股</span>
             </div>
             <div className="flex gap-2 mt-2">
                {[100, 500, 1000, '全仓'].map((q, i) => (
                   <button key={i} onClick={() => setQuantity(q === '全仓' ? (direction === 'buy' ? maxBuy.toString() : maxSell.toString()) : q.toString())} className="flex-1 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-gray-400 border border-white/5">{q}</button>
                ))}
             </div>
          </div>

          {/* Summary */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
             <div className="flex justify-between text-xs">
                <span className="text-gray-500">预估金额</span>
                <span className="text-white font-mono font-bold">{formatCurrency(totalAmount)}</span>
             </div>
             <div className="flex justify-between text-xs">
                <span className="text-gray-500">可用资金</span>
                <span className="text-white font-mono">{formatCurrency(userCash || 0)}</span> 
             </div>
          </div>

          {/* Action Button */}
          <button 
             onClick={checkTrade}
             disabled={isSubmitting}
             className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${direction === 'buy' ? 'bg-status-profit hover:bg-red-500 shadow-red-900/20' : 'bg-status-loss hover:bg-green-500 shadow-green-900/20'}`}
          >
             {isSubmitting ? <Loader2 className="animate-spin" /> : direction === 'buy' ? '立即买入' : '立即卖出'}
          </button>
       </div>
    </div>
  );

  // --- MAIN RETURN ---
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-60px)] md:h-screen bg-[#0a0a0a] max-w-7xl mx-auto relative overflow-hidden pb-20 md:pb-0">
       <TradeToast message={toastMsg} visible={showToast} />

       {/* LEFT: STOCK LIST (Desktop only) */}
       <div className="hidden md:flex flex-col w-64 bg-[#121212] border-r border-white/5">
          <div className="p-4 border-b border-white/5">
             <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4"/>
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索代码" className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-9 text-sm text-white focus:border-primary-gold outline-none"/>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto">
             {filteredStocks.map(s => (
                <div key={s.code} onClick={() => setSelectedStockCode(s.code)} className={`p-3 flex justify-between items-center cursor-pointer border-l-2 hover:bg-white/5 transition-colors ${selectedStockCode === s.code ? 'border-primary-gold bg-white/5' : 'border-transparent'}`}>
                   <div>
                      <div className="text-white text-sm font-bold">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.code}</div>
                   </div>
                   <div className={`text-sm font-mono font-bold ${s.change >= 0 ? 'text-status-profit' : 'text-status-loss'}`}>
                      {s.change >= 0 ? '+' : ''}{s.change}%
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* CENTER: CHART & ORDER BOOK */}
       <div className="flex-1 flex flex-col min-w-0 relative z-0">
          {/* Header */}
          <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 bg-[#121212] z-20 relative">
             <div className="flex items-center gap-4" onClick={() => setIsStockDropdownOpen(!isStockDropdownOpen)}>
                <div>
                   <h2 className="text-lg font-bold text-white flex items-center gap-2 cursor-pointer hover:text-primary-gold transition-colors">
                      {selectedStock.name} <ChevronDown size={16}/>
                   </h2>
                   <div className="flex gap-3 text-xs">
                      <span className="text-gray-400 font-mono">{selectedStock.code}</span>
                      <span className={`font-mono font-bold ${selectedStock.change >= 0 ? 'text-status-profit' : 'text-status-loss'}`}>
                         {selectedStock.price.toFixed(2)} ({selectedStock.change >= 0 ? '+' : ''}{selectedStock.change}%)
                      </span>
                   </div>
                </div>
             </div>
             {/* Desktop Tabs */}
             <div className="hidden md:flex gap-1 bg-black/30 p-1 rounded-lg">
                 <button className="px-3 py-1 bg-white/10 rounded text-xs text-primary-gold font-bold">分时</button>
                 <button className="px-3 py-1 hover:bg-white/5 rounded text-xs text-gray-400">日K</button>
                 <button className="px-3 py-1 hover:bg-white/5 rounded text-xs text-gray-400">周K</button>
             </div>
          </div>

          {/* Mobile Stock Selector Overlay */}
          {isStockDropdownOpen && (
             <div className="absolute top-16 left-0 w-full bg-[#1A1A1A] border-b border-white/10 shadow-2xl z-50 max-h-[60vh] overflow-y-auto animate-fade-in">
                {filteredStocks.map(s => (
                   <div key={s.code} onClick={() => { setSelectedStockCode(s.code); setIsStockDropdownOpen(false); }} className="p-4 border-b border-white/5 flex justify-between">
                      <span className="text-white">{s.name} <span className="text-gray-500 text-xs ml-2">{s.code}</span></span>
                      <span className={s.change >= 0 ? 'text-status-profit' : 'text-status-loss'}>{s.change}%</span>
                   </div>
                ))}
             </div>
          )}

          {/* Mobile Content Switcher */}
          <div className="md:hidden flex-1 overflow-hidden relative">
             {mobileTab === 'trade' && renderTradeForm()}
             
             {mobileTab === 'chart' && (
                <div className="h-full overflow-y-auto bg-[#121212]">
                   <div className="h-[60%] p-2">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={fullChartData}>
                            <defs>
                               <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false}/>
                            <XAxis dataKey="time" hide />
                            <YAxis domain={['auto', 'auto']} orientation="right" tick={{fill:'#666', fontSize:10}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{backgroundColor:'#1A1A1A', border:'1px solid #333'}} />
                            <Area type="monotone" dataKey="value" stroke="#D4AF37" fillOpacity={1} fill="url(#colorVal)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                   {/* MACD */}
                   <div className="h-[30%] p-2 border-t border-white/5">
                      <ResponsiveContainer width="100%" height="100%">
                         <ComposedChart data={fullChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false}/>
                            <YAxis orientation="right" tick={{fill:'#666', fontSize:10}} axisLine={false} tickLine={false}/>
                            <ReferenceLine y={0} stroke="#666"/>
                            <Bar dataKey="macd" fill="#FF4444">
                               {fullChartData.map((entry:any, index:number) => (
                                  <Cell key={`cell-${index}`} fill={entry.macd >= 0 ? '#FF4444' : '#00C851'} />
                               ))}
                            </Bar>
                            <Line type="monotone" dataKey="dif" stroke="#D4AF37" dot={false} strokeWidth={1}/>
                            <Line type="monotone" dataKey="dea" stroke="#33B5E5" dot={false} strokeWidth={1}/>
                         </ComposedChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             )}

             {mobileTab === 'data' && (
                <div className="h-full overflow-y-auto bg-[#121212]">
                   {/* Reusing Bottom Panel logic for mobile data view */}
                   <div className="flex border-b border-white/5 sticky top-0 bg-[#121212] z-10">
                      <button onClick={() => setBottomTab('positions')} className={`flex-1 py-3 text-sm font-bold ${bottomTab==='positions'?'text-primary-gold border-b-2 border-primary-gold':'text-gray-500'}`}>持仓</button>
                      <button onClick={() => setBottomTab('orders')} className={`flex-1 py-3 text-sm font-bold ${bottomTab==='orders'?'text-primary-gold border-b-2 border-primary-gold':'text-gray-500'}`}>委托</button>
                   </div>
                   <div className="p-4">
                      {bottomTab === 'positions' ? (
                         <div className="space-y-3">
                            {userHoldings.length > 0 ? userHoldings.map(pos => (
                               <div key={pos.stock_code} className="p-3 bg-white/5 rounded-lg border border-white/5">
                                  <div className="flex justify-between mb-1">
                                     <span className="text-white font-bold">{pos.stock_name}</span>
                                     <span className="text-white font-mono">{pos.quantity}股</span>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-400">
                                     <span>成本: {pos.average_cost?.toFixed(2)}</span>
                                     <span>市值: {(pos.quantity * (allStocks.find(s=>s.code===pos.stock_code)?.price||0)).toFixed(0)}</span>
                                  </div>
                               </div>
                            )) : <div className="text-center text-gray-500 py-10">暂无持仓</div>}
                         </div>
                      ) : (
                         <div className="space-y-3">
                            {userOrders.length > 0 ? userOrders.map(order => (
                               <div key={order.id} className="p-3 bg-white/5 rounded-lg border border-white/5">
                                  <div className="flex justify-between mb-1">
                                     <span className="text-white font-bold">{order.stockName}</span>
                                     <span className={`text-xs font-bold px-1.5 rounded ${order.type==='BUY'?'bg-status-profit/20 text-status-profit':'bg-status-loss/20 text-status-loss'}`}>{order.type==='BUY'?'买入':'卖出'}</span>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-400">
                                     <span>{order.price.toFixed(2)} | {order.amount}股</span>
                                     <span className={order.status==='FILLED'?'text-primary-gold':'text-gray-500'}>{order.status==='FILLED'?'已成交':order.status}</span>
                                  </div>
                                  <div className="text-[10px] text-gray-600 mt-1 text-right">{order.timestamp}</div>
                               </div>
                            )) : <div className="text-center text-gray-500 py-10">暂无委托</div>}
                         </div>
                      )}
                   </div>
                </div>
             )}
          </div>

          {/* Desktop Layout: Chart + Bottom Panel */}
          <div className="hidden md:flex flex-1 flex-col overflow-hidden">
             {/* Chart Area */}
             <div className="flex-[3] bg-[#0f0f0f] relative border-b border-white/5">
                {/* Main Price Chart */}
                <div className="absolute inset-0 top-0 bottom-[30%] p-4">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={fullChartData}>
                         <defs>
                            <linearGradient id="colorValDesktop" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                         <XAxis dataKey="time" tick={{fill:'#666', fontSize:10}} axisLine={false} tickLine={false}/>
                         <YAxis domain={['auto', 'auto']} orientation="right" tick={{fill:'#666', fontSize:10}} axisLine={false} tickLine={false} />
                         <Tooltip contentStyle={{backgroundColor:'#1A1A1A', border:'1px solid #333', color:'#fff'}} />
                         <Area type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorValDesktop)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
                {/* MACD Chart */}
                <div className="absolute inset-0 top-[70%] bottom-0 p-4 border-t border-white/5 bg-[#0a0a0a]">
                    <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={fullChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false}/>
                          <YAxis orientation="right" tick={{fill:'#666', fontSize:10}} axisLine={false} tickLine={false}/>
                          <ReferenceLine y={0} stroke="#666"/>
                          <Bar dataKey="macd" fill="#FF4444" barSize={4}>
                             {fullChartData.map((entry:any, index:number) => (
                                <Cell key={`cell-${index}`} fill={entry.macd >= 0 ? '#FF4444' : '#00C851'} />
                             ))}
                          </Bar>
                          <Line type="monotone" dataKey="dif" stroke="#D4AF37" dot={false} strokeWidth={1}/>
                          <Line type="monotone" dataKey="dea" stroke="#33B5E5" dot={false} strokeWidth={1}/>
                       </ComposedChart>
                    </ResponsiveContainer>
                </div>
             </div>
             
             {/* Bottom Panel (Positions/Orders) */}
             <div className="flex-[2] bg-[#121212] flex flex-col">
                <div className="flex border-b border-white/5 bg-[#1A1A1A]">
                   <button onClick={() => setBottomTab('positions')} className={`px-6 py-3 text-sm font-bold transition-colors ${bottomTab==='positions'?'text-primary-gold border-b-2 border-primary-gold bg-white/5':'text-gray-500 hover:text-white'}`}>我的持仓</button>
                   <button onClick={() => setBottomTab('orders')} className={`px-6 py-3 text-sm font-bold transition-colors ${bottomTab==='orders'?'text-primary-gold border-b-2 border-primary-gold bg-white/5':'text-gray-500 hover:text-white'}`}>当日委托</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                   <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-[#121212] z-10 text-xs text-gray-500">
                         <tr>
                            <th className="p-4 font-medium">名称/代码</th>
                            <th className="p-4 font-medium text-right">{bottomTab === 'positions' ? '持仓数量' : '委托价格'}</th>
                            <th className="p-4 font-medium text-right">{bottomTab === 'positions' ? '成本/现价' : '委托数量'}</th>
                            <th className="p-4 font-medium text-right">{bottomTab === 'positions' ? '市值/盈亏' : '状态/时间'}</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                         {bottomTab === 'positions' ? (
                            userHoldings.map(pos => {
                               const currPrice = allStocks.find(s => s.code === pos.stock_code)?.price || 0;
                               const mktValue = currPrice * pos.quantity;
                               const pnl = (currPrice - pos.average_cost) * pos.quantity;
                               return (
                                  <tr key={pos.stock_code} className="hover:bg-white/5 transition-colors">
                                     <td className="p-4">
                                        <div className="text-white font-bold">{pos.stock_name}</div>
                                        <div className="text-xs text-gray-500">{pos.stock_code}</div>
                                     </td>
                                     <td className="p-4 text-right font-mono">{pos.quantity}</td>
                                     <td className="p-4 text-right">
                                        <div className="text-gray-400">{pos.average_cost.toFixed(2)}</div>
                                        <div className="text-white">{currPrice.toFixed(2)}</div>
                                     </td>
                                     <td className="p-4 text-right">
                                        <div className="text-white font-bold">{mktValue.toFixed(0)}</div>
                                        <div className={`text-xs ${pnl>=0?'text-status-profit':'text-status-loss'}`}>{pnl>0?'+':''}{pnl.toFixed(0)}</div>
                                     </td>
                                  </tr>
                               );
                            })
                         ) : (
                            userOrders.map(order => (
                               <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                  <td className="p-4">
                                     <div className="text-white font-bold">{order.stockName}</div>
                                     <div className="text-xs text-gray-500">{order.stockCode}</div>
                                  </td>
                                  <td className="p-4 text-right font-mono">{order.price.toFixed(2)}</td>
                                  <td className="p-4 text-right font-mono">
                                     <span className={order.type==='BUY'?'text-status-profit':'text-status-loss'}>{order.type==='BUY'?'买':'卖'}</span> {order.amount}
                                  </td>
                                  <td className="p-4 text-right">
                                     <div className={`font-bold ${order.status==='FILLED'?'text-primary-gold':'text-white'}`}>{order.status==='FILLED'?'已成交':order.status}</div>
                                     <div className="text-xs text-gray-500">{order.timestamp}</div>
                                  </td>
                               </tr>
                            ))
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>

          {/* Right Panel: Trade Form (Desktop) */}
          <div className="hidden md:block w-80 border-l border-white/5">
             {renderTradeForm()}
          </div>
       </div>

       {/* Mobile Bottom Tab Switcher (Overrides global nav when in Trade) */}
       <div className="md:hidden fixed bottom-[80px] left-0 right-0 bg-[#1A1A1A] border-t border-white/5 flex justify-around py-2 z-30">
          <button onClick={() => setMobileTab('trade')} className={`flex flex-col items-center gap-1 ${mobileTab==='trade'?'text-primary-gold':'text-gray-500'}`}>
             <Zap size={20}/> <span className="text-[10px]">交易</span>
          </button>
          <button onClick={() => setMobileTab('chart')} className={`flex flex-col items-center gap-1 ${mobileTab==='chart'?'text-primary-gold':'text-gray-500'}`}>
             <LineChart size={20}/> <span className="text-[10px]">图表</span>
          </button>
          <button onClick={() => setMobileTab('data')} className={`flex flex-col items-center gap-1 ${mobileTab==='data'?'text-primary-gold':'text-gray-500'}`}>
             <List size={20}/> <span className="text-[10px]">持仓</span>
          </button>
       </div>
    </div>
  );
};

export default Trade;
