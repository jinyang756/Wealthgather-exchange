import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Filter, MoreHorizontal } from 'lucide-react';
import { useMarket } from '../contexts/MarketContext';
import { Stock } from '../types';

const Market: React.FC = () => {
  const { allStocks, watchlist, marketIndices, addToWatchlist, removeFromWatchlist, isInWatchlist } = useMarket();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'watchlist'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStocks = (activeTab === 'watchlist' ? watchlist : allStocks).filter(stock => 
    stock.name.includes(searchTerm) || stock.code.includes(searchTerm)
  );

  const handleStockClick = (stockCode: string) => {
    navigate('/trade', { state: { code: stockCode } });
  };

  return (
    // Added pb-32 for safe mobile navigation clearance
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-32 md:pb-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">行情中心</h1>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-card border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:border-primary-gold focus:ring-1 focus:ring-primary-gold outline-none text-sm"
            placeholder="搜索股票代码/名称"
          />
        </div>
      </div>

      {/* Indices Overview */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        {marketIndices.map((idx) => (
          <div key={idx.name} className="bg-dark-card rounded-xl p-3 md:p-4 border border-white/5 relative overflow-hidden group hover:border-primary-gold/30 transition-colors">
             <div className={`absolute top-0 left-0 w-full h-1 ${idx.change >= 0 ? 'bg-status-profit' : 'bg-status-loss'}`}></div>
             <div className="flex justify-between items-start mb-2">
               <span className="text-xs md:text-sm text-gray-400">{idx.name}</span>
               <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${idx.change >= 0 ? 'bg-status-profit/10 text-status-profit' : 'bg-status-loss/10 text-status-loss'}`}>
                 {idx.change >= 0 ? '+' : ''}{idx.change}%
               </span>
             </div>
             <div className={`text-lg md:text-2xl font-bold font-mono ${idx.change >= 0 ? 'text-status-profit' : 'text-status-loss'}`}>
               {idx.value.toFixed(2)}
             </div>
             <div className="text-xs text-gray-500 mt-1">
                成交额: {(Math.random() * 5000).toFixed(0)}亿
             </div>
          </div>
        ))}
      </div>

      {/* Main List Section */}
      <div className="bg-dark-card rounded-2xl border border-white/5 overflow-hidden min-h-[500px]">
        {/* Tabs */}
        <div className="flex items-center border-b border-white/5 px-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-4 text-sm font-bold relative ${
              activeTab === 'all' ? 'text-primary-gold' : 'text-gray-400 hover:text-white'
            }`}
          >
            全部沪深
            {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-gold" />}
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`py-4 px-4 text-sm font-bold relative ${
              activeTab === 'watchlist' ? 'text-primary-gold' : 'text-gray-400 hover:text-white'
            }`}
          >
            自选股
            {activeTab === 'watchlist' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-gold" />}
          </button>
          
          <div className="ml-auto flex gap-2">
            <button className="p-2 text-gray-400 hover:text-white"><Filter size={18} /></button>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 px-4 py-3 text-xs text-gray-500 border-b border-white/5 bg-white/[0.02]">
          <div className="col-span-4 md:col-span-3">股票名称/代码</div>
          <div className="col-span-3 md:col-span-2 text-right">最新价</div>
          <div className="col-span-3 md:col-span-2 text-right">涨跌幅</div>
          <div className="col-span-2 md:col-span-2 text-right hidden md:block">最高/最低</div>
          <div className="col-span-2 md:col-span-2 text-right hidden md:block">成交量</div>
          <div className="col-span-2 md:col-span-1 text-right">自选</div>
        </div>

        {/* Stock List */}
        <div className="divide-y divide-white/5">
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock) => (
              <div 
                key={stock.code} 
                className="grid grid-cols-12 px-4 py-4 items-center hover:bg-white/5 transition-colors cursor-pointer group"
                onClick={() => handleStockClick(stock.code)}
              >
                <div className="col-span-4 md:col-span-3">
                  <div className="font-bold text-white text-sm md:text-base">{stock.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-1 rounded text-[10px] border ${stock.code.startsWith('6') ? 'border-blue-500/30 text-blue-400' : 'border-orange-500/30 text-orange-400'}`}>
                      {stock.code.startsWith('6') ? 'SH' : 'SZ'}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">{stock.code}</span>
                  </div>
                </div>

                <div className={`col-span-3 md:col-span-2 text-right font-mono font-bold text-sm md:text-base ${stock.change >= 0 ? 'text-status-profit' : 'text-status-loss'}`}>
                  {stock.price.toFixed(2)}
                </div>

                <div className="col-span-3 md:col-span-2 text-right">
                  <div className={`inline-block w-20 py-1 rounded text-xs md:text-sm font-bold text-center ${stock.change >= 0 ? 'bg-status-profit/10 text-status-profit' : 'bg-status-loss/10 text-status-loss'}`}>
                    {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                  </div>
                </div>

                <div className="col-span-2 md:col-span-2 text-right hidden md:block">
                  <div className="text-xs text-gray-300">{stock.high.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">{stock.low.toFixed(2)}</div>
                </div>

                <div className="col-span-2 md:col-span-2 text-right hidden md:block text-xs text-gray-400 font-mono">
                  {(stock.volume / 10000).toFixed(1)}万
                </div>

                <div className="col-span-2 md:col-span-1 text-right flex justify-end">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isInWatchlist(stock.code)) {
                        removeFromWatchlist(stock.code);
                      } else {
                        addToWatchlist(stock);
                      }
                    }}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Star 
                      size={18} 
                      className={isInWatchlist(stock.code) ? "fill-primary-gold text-primary-gold" : "text-gray-600 group-hover:text-gray-400"} 
                    />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <p className="text-gray-500 text-sm">暂无相关股票数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Market;