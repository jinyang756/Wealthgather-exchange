
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { MarketContextType, Stock, MarketIndex, NewsItem, AISuggestion, IPOData, BlockTradeData, Order } from '../types';
import { REAL_STOCK_CODES, REAL_INDEX_CODES, STOCK_NAME_MAP } from '../constants';
import { supabase, checkConnection } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const MarketContext = createContext<MarketContextType | undefined>(undefined);

// --- YAHOO FINANCE API CONFIG ---
// We use a CORS proxy because Yahoo API is not CORS-enabled for direct browser calls.
// In a real production app, this would be a backend endpoint.
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols=';

// Helper: Chunk Array for batch requests
const chunkArray = (arr: string[], size: number) => {
  const res = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
};

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // --- STATE ---
  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [ipoData, setIpoData] = useState<IPOData[]>([]);
  const [blockTrades, setBlockTrades] = useState<BlockTradeData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);

  // User Data
  const [userHoldings, setUserHoldings] = useState<any[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [watchlistCodes, setWatchlistCodes] = useState<string[]>([]);

  // --- DB CHECK ---
  useEffect(() => {
    const initDbCheck = async () => {
      const isOk = await checkConnection();
      setDbConnected(isOk);
    };
    initDbCheck();
    const interval = setInterval(initDbCheck, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- SUPABASE SYNC ---
  useEffect(() => {
    if (!user) {
      setWatchlistCodes([]);
      setUserHoldings([]);
      setUserOrders([]);
      return;
    }

    const fetchUserData = async () => {
      try {
        const { data: wlData } = await supabase.from('watchlists').select('stock_code').eq('user_id', user.id);
        if (wlData) setWatchlistCodes(wlData.map(w => w.stock_code));

        const { data: posData } = await supabase.from('positions').select('*').eq('user_id', user.id);
        if (posData) setUserHoldings(posData);

        const { data: ordData } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (ordData) {
          const formattedOrders: Order[] = ordData.map(o => ({
            id: o.id,
            stockCode: o.stock_code,
            stockName: o.stock_name,
            type: o.type,
            price: o.price,
            amount: o.amount,
            status: o.status,
            timestamp: new Date(o.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
          }));
          setUserOrders(formattedOrders);
        }
        setDbConnected(true);
      } catch (e) {
        console.error("Fetch User Data Failed", e);
        setDbConnected(false);
      }
    };

    fetchUserData();

    const channel = supabase.channel('user_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, () => fetchUserData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'positions', filter: `user_id=eq.${user.id}` }, () => fetchUserData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'watchlists', filter: `user_id=eq.${user.id}` }, () => fetchUserData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // --- DATA FETCHING ENGINE (YAHOO FINANCE) ---
  const fetchYahooData = async () => {
    try {
      const symbols = [...REAL_INDEX_CODES, ...REAL_STOCK_CODES].join(',');
      // Use CORS Proxy to call Yahoo
      const targetUrl = `${YAHOO_BASE_URL}${symbols}`;
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(targetUrl)}`);
      const raw = await response.json();
      
      if (!raw || !raw.quoteResponse || !raw.quoteResponse.result) {
        throw new Error('Invalid Yahoo Response');
      }

      const results = raw.quoteResponse.result;
      const newStocks: Stock[] = [];
      const newIndices: MarketIndex[] = [];

      results.forEach((q: any) => {
        const isIndex = REAL_INDEX_CODES.includes(q.symbol);
        const chineseName = STOCK_NAME_MAP[q.symbol] || q.shortName || q.symbol;
        
        if (isIndex) {
          newIndices.push({
            code: q.symbol,
            name: chineseName,
            value: q.regularMarketPrice,
            change: q.regularMarketChangePercent,
            changeAmount: q.regularMarketChange
          });
        } else {
          // Generate chart data (Simulated for Yahoo Quote endpoint as it doesn't provide intraday series in this call)
          // In a full impl, we would call the 'chart' endpoint separately.
          const now = new Date();
          const chartData = Array.from({ length: 20 }, (_, i) => ({
            time: new Date(now.getTime() - (20-i)*60000).toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}),
            value: q.regularMarketPrice + (Math.random() - 0.5) * (q.regularMarketPrice * 0.01),
            volume: Math.floor(q.regularMarketVolume / 200 * Math.random())
          }));

          newStocks.push({
            code: q.symbol,
            symbol: q.symbol, // Yahoo symbol format is clean
            name: chineseName,
            price: q.regularMarketPrice,
            change: parseFloat((q.regularMarketChangePercent || 0).toFixed(2)),
            changeAmount: parseFloat((q.regularMarketChange || 0).toFixed(2)),
            volume: q.regularMarketVolume,
            high: q.regularMarketDayHigh,
            low: q.regularMarketDayLow,
            open: q.regularMarketOpen,
            prevClose: q.regularMarketPreviousClose,
            chartData: chartData
          });
        }
      });

      setAllStocks(newStocks);
      setMarketIndices(newIndices);
      
      // Generate Derived Data based on Real Prices
      generateDerivedData(newStocks);
      setIsConnected(true);

    } catch (err) {
      console.error("Market Data Fetch Error (Yahoo):", err);
      // Don't set connected=false immediately to avoid flickering, allow retries
    }
  };

  const generateDerivedData = (stocks: Stock[]) => {
    if (stocks.length === 0) return;

    // 1. Block Trades (Based on real stocks)
    const trade = stocks[Math.floor(Math.random() * stocks.length)];
    const discountRate = parseFloat((Math.random() * 5 + 2).toFixed(1)); // 2.0 to 7.0
    const discount = -discountRate; // -2.0 to -7.0
    const volume = Math.floor(Math.random() * 50 + 10); // 10-60万股
    
    setBlockTrades([{
      id: Date.now().toString(),
      stockName: trade.name,
      stockCode: trade.code,
      price: trade.price * (1 + discount/100),
      volume: volume,
      amount: (trade.price * volume * 10000) / 10000, 
      discount: discount,
      type: Math.random() > 0.5 ? 'BUY' : 'SELL',
      time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'})
    }]);

    // 2. IPO Data (Real stocks but simulated as "New")
    const ipoCandidates = stocks.slice(0, 3);
    setIpoData(ipoCandidates.map((s, i) => ({
      name: s.name,
      code: s.code,
      price: s.price * 0.8, // Issue price is usually lower
      peRatio: 20 + i * 5,
      limitAmount: 1 + i * 0.5,
      date: new Date().toLocaleDateString('zh-CN'),
      status: 'SUBSCRIBE'
    })));
  };

  // --- FETCH LOOP ---
  useEffect(() => {
    fetchYahooData(); // Initial
    const interval = setInterval(fetchYahooData, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  // --- NEWS FETCHING (Using Supabase database) ---
  useEffect(() => {
    const fetchNews = async () => {
      try {
        // 从 Supabase 数据库获取新闻数据
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) {
          console.error('Failed to fetch news:', error);
          // 出错时使用模拟数据
          setNews([
            { id: '1', title: '外资机构：A股估值处于历史低位，建议超配', time: '10:23', url: '#', type: 'report' },
            { id: '2', title: '央行：将继续保持货币政策稳健，支持实体经济', time: '09:45', url: '#', type: 'news' },
            { id: '3', title: '新能源板块早盘走强，宁德时代涨超3%', time: '09:30', url: '#', type: 'notice' }
          ]);
        } else {
          // 转换数据格式
          const formattedNews = data.map(item => ({
            id: item.id,
            title: item.title,
            time: new Date(item.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            url: item.url || '#',
            source: item.source,
            type: item.type || 'news'
          }));
          setNews(formattedNews);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        // 出错时使用模拟数据
        setNews([
          { id: '1', title: '外资机构：A股估值处于历史低位，建议超配', time: '10:23', url: '#', type: 'report' },
          { id: '2', title: '央行：将继续保持货币政策稳健，支持实体经济', time: '09:45', url: '#', type: 'news' },
          { id: '3', title: '新能源板块早盘走强，宁德时代涨超3%', time: '09:30', url: '#', type: 'notice' }
        ]);
      }
    };

    fetchNews();
    
    // 每30秒刷新一次新闻数据
    const interval = setInterval(fetchNews, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- WATCHLIST ACTIONS ---
  const addToWatchlist = async (stock: Stock) => {
    if (!user) return;
    try {
      await supabase.from('watchlists').insert({ user_id: user.id, stock_code: stock.code });
      // Optimistic update
      setWatchlistCodes(prev => [...prev, stock.code]);
    } catch (e) { console.error(e); }
  };

  const removeFromWatchlist = async (stockCode: string) => {
    if (!user) return;
    try {
      await supabase.from('watchlists').delete().match({ user_id: user.id, stock_code: stockCode });
      setWatchlistCodes(prev => prev.filter(c => c !== stockCode));
    } catch (e) { console.error(e); }
  };

  const isInWatchlist = (code: string) => watchlistCodes.includes(code);

  const watchlist = allStocks.filter(s => watchlistCodes.includes(s.code));

  return (
    <MarketContext.Provider value={{
      allStocks,
      marketIndices,
      watchlist,
      news,
      aiSuggestions,
      ipoData,
      blockTrades,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      isConnected,
      dbConnected,
      userHoldings,
      userOrders
    }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
