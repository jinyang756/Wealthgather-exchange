import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Bell, Search, ArrowLeftRight, BarChart3, Zap } from 'lucide-react';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary font-sans flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Top Bar - Fixed Z-Index High */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-dark-card border-b border-white/5 sticky top-0 z-50 h-[60px]">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <span className="font-bold text-primary-gold tracking-wide">聚财交易所</span>
        </div>
        <div className="flex gap-4">
          <Search className="w-5 h-5 text-gray-400" />
          <Bell className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-dark-card border-r border-white/5 h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <Logo className="w-10 h-10" />
          <div>
            <h1 className="font-bold text-lg text-primary-gold">聚财众发</h1>
            <p className="text-xs text-gray-500">专业机构交易端</p>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2">
          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/') ? 'bg-primary-gold/10 text-primary-gold border-l-2 border-primary-gold' : 'text-gray-400 hover:bg-white/5'}`}>
            <Home className="w-5 h-5" />
            <span>首页概览</span>
          </Link>
          <Link to="/market" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/market') ? 'bg-primary-gold/10 text-primary-gold border-l-2 border-primary-gold' : 'text-gray-400 hover:bg-white/5'}`}>
            <BarChart3 className="w-5 h-5" />
            <span>行情中心</span>
          </Link>
          
          <Link to="/fast-lane" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/fast-lane') ? 'bg-primary-gold/10 text-primary-gold border-l-2 border-primary-gold' : 'text-gray-400 hover:bg-white/5'}`}>
            <Zap className="w-5 h-5" />
            <span>专用通道</span>
          </Link>
          
          <Link to="/trade" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/trade') ? 'bg-primary-gold/10 text-primary-gold border-l-2 border-primary-gold' : 'text-gray-400 hover:bg-white/5'}`}>
            <ArrowLeftRight className="w-5 h-5" />
            <span>快速交易</span>
          </Link>
          <Link to="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/profile') ? 'bg-primary-gold/10 text-primary-gold border-l-2 border-primary-gold' : 'text-gray-400 hover:bg-white/5'}`}>
            <User className="w-5 h-5" />
            <span>资产中心</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="p-4 rounded-lg bg-gradient-to-r from-dark-lighter to-dark-card border border-white/5">
            <p className="text-xs text-gray-400 mb-1">当前版本</p>
            <p className="text-sm font-mono text-primary-gold">v2.6.0 VIP</p>
          </div>
        </div>
      </div>

      {/* Main Content - CRITICAL FIX: Handle padding for mobile bottom nav */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto h-[calc(100vh-60px)] md:h-screen relative bg-dark-bg">
         {/* We add padding bottom on mobile inside the page components or here */}
         {children}
      </main>

      {/* Mobile Bottom Nav - Fixed Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-white/5 px-4 py-2 flex justify-between items-center z-50 h-[80px] pb-6">
        <Link to="/" className={`flex flex-col items-center gap-1 min-w-[50px] ${isActive('/') ? 'text-primary-gold' : 'text-gray-500'}`}>
          <Home className="w-6 h-6" />
          <span className="text-[10px]">首页</span>
        </Link>
        
        <Link to="/market" className={`flex flex-col items-center gap-1 min-w-[50px] ${isActive('/market') ? 'text-primary-gold' : 'text-gray-500'}`}>
          <BarChart3 className="w-6 h-6" />
          <span className="text-[10px]">行情</span>
        </Link>
        
        {/* Center Highlight Button for Fast Lane */}
        <Link to="/fast-lane" className="relative -top-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-gold to-primary-deep flex items-center justify-center shadow-lg shadow-primary-gold/30 border-4 border-[#1A1A1A]">
            <Zap className="w-7 h-7 text-black" fill="black" />
          </div>
        </Link>
        
        <Link to="/trade" className={`flex flex-col items-center gap-1 min-w-[50px] ${isActive('/trade') ? 'text-primary-gold' : 'text-gray-500'}`}>
          <ArrowLeftRight className="w-6 h-6" />
          <span className="text-[10px]">交易</span>
        </Link>

        <Link to="/profile" className={`flex flex-col items-center gap-1 min-w-[50px] ${isActive('/profile') ? 'text-primary-gold' : 'text-gray-500'}`}>
          <User className="w-6 h-6" />
          <span className="text-[10px]">我的</span>
        </Link>
      </div>
    </div>
  );
};

export default Layout;