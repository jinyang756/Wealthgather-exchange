
export interface Stock {
  code: string;
  symbol: string; // e.g., sh600519
  name: string;
  price: number;
  change: number; // Percentage
  changeAmount: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  chartData: { time: string; value: number; volume: number }[];
}

export interface MarketIndex {
  name: string;
  code: string;
  value: number;
  change: number;
  changeAmount: number;
}

export interface Order {
  id: string;
  stockCode: string;
  stockName: string;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
  timestamp: string; // Display formatted time
}

// DB Model for Orders
export interface DBOrder {
  id: string;
  user_id: string;
  stock_code: string;
  stock_name: string;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
  created_at: string;
}

export interface Asset {
  currency: string;
  amount: number;
  valueUsd: number;
  color: string;
}

// --- NEW IDENTITY SYSTEM ---
export type UserRole = 'personal' | 'org' | 'admin';
export type UserLevel = 'MEMBER' | 'PLATINUM' | 'BLACK_GOLD';

export interface UserProfile {
  name: string;
  id: string;
  role: UserRole;
  level: UserLevel;
  totalAsset: number;
  todayProfit: number;
  riskLevel: 'Conservative' | 'Balanced' | 'Aggressive';
  isPlatinum: boolean;
  membershipExpiry?: string;
  cash_balance?: number;
}

export enum AIAnalysisType {
  STOCK_CODE = 'STOCK_CODE',
  DOCUMENT = 'DOCUMENT',
  IDENTITY = 'IDENTITY'
}

export interface User {
  email: string;
  name: string;
  id: string;
  token: string;
  isPlatinum?: boolean;
  membershipExpiry?: string;
  // Updated fields for strict typing
  role: UserRole;
  level: UserLevel;
  riskLevel?: string;
  cash_balance?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  time: string;
  url: string;
  source?: string;
  type: 'news' | 'notice' | 'report';
}

export interface AISuggestion {
  id: string;
  type: 'RISK' | 'OPPORTUNITY' | 'INFO';
  title: string;
  description: string;
  stockCode?: string;
  time: string;
}

// --- NEW DATA TYPES FOR EXPANDED MARKET ---
export interface IPOData {
  name: string;
  code: string;
  price: number;
  peRatio: number; // 市盈率
  limitAmount: number; // 申购上限(万股)
  date: string; // 申购日期
  status: 'SUBSCRIBE' | 'PENDING' | 'LISTED';
}

export interface BlockTradeData {
  id: string;
  stockName: string;
  stockCode: string;
  price: number;
  volume: number; // 万股
  amount: number; // 总额(万)
  discount: number; // 折价率
  type: 'BUY' | 'SELL';
  time: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, type?: UserRole) => Promise<void>;
  logout: () => void;
}

export interface MarketContextType {
  watchlist: Stock[];
  allStocks: Stock[];
  marketIndices: MarketIndex[];
  news: NewsItem[];
  aiSuggestions: AISuggestion[];
  ipoData: IPOData[]; // NEW
  blockTrades: BlockTradeData[]; // NEW
  addToWatchlist: (stock: Stock) => void;
  removeFromWatchlist: (stockCode: string) => void;
  isInWatchlist: (stockCode: string) => boolean;
  isConnected: boolean;
  dbConnected: boolean; // NEW: Database connection status
  userHoldings: any[];
  userOrders: Order[];
}
