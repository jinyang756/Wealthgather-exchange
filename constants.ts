
import { Asset, UserProfile } from './types';

// --- GLOBAL MARKET CONFIGURATION (Yahoo Finance Format) ---
// A-Shares: .SS (Shanghai), .SZ (Shenzhen)

export const REAL_STOCK_CODES = [
  // === 沪市主板 (Shanghai Main) ===
  '600519.SS', // 贵州茅台
  '601318.SS', // 中国平安
  '600036.SS', // 招商银行
  '601857.SS', // 中国石油
  '601012.SS', // 隆基绿能
  '603259.SS', // 药明康德
  '600030.SS', // 中信证券
  '600900.SS', // 长江电力

  // === 科创板 (STAR Market) ===
  '688981.SS', // 中芯国际
  '688008.SS', // 澜起科技

  // === 深市主板/创业板 (Shenzhen/ChiNext) ===
  '300750.SZ', // 宁德时代
  '002594.SZ', // 比亚迪
  '000858.SZ', // 五粮液
  '300059.SZ', // 东方财富
  '002230.SZ', // 科大讯飞
  '002415.SZ', // 海康威视
  '000333.SZ', // 美的集团
  '300760.SZ', // 迈瑞医疗
];

export const REAL_INDEX_CODES = [
  '000001.SS', // 上证指数 (SSE Composite)
  '399001.SZ', // 深证成指 (SZSE Component)
  '399006.SZ', // 创业板指 (ChiNext)
  '000300.SS', // 沪深300 (CSI 300)
];

// Yahoo API returns English names (e.g., "Kweichow Moutai"). 
// We use this map to force display Chinese names in the UI.
export const STOCK_NAME_MAP: Record<string, string> = {
  '600519.SS': '贵州茅台',
  '601318.SS': '中国平安',
  '600036.SS': '招商银行',
  '601857.SS': '中国石油',
  '601012.SS': '隆基绿能',
  '603259.SS': '药明康德',
  '600030.SS': '中信证券',
  '600900.SS': '长江电力',
  '688981.SS': '中芯国际',
  '688008.SS': '澜起科技',
  '300750.SZ': '宁德时代',
  '002594.SZ': '比亚迪',
  '000858.SZ': '五粮液',
  '300059.SZ': '东方财富',
  '002230.SZ': '科大讯飞',
  '002415.SZ': '海康威视',
  '000333.SZ': '美的集团',
  '300760.SZ': '迈瑞医疗',
  '000001.SS': '上证指数',
  '399001.SZ': '深证成指',
  '399006.SZ': '创业板指',
  '000300.SS': '沪深300'
};

export const INITIAL_CASH = 500000; // 500k Cash available
