export interface Market {
  id: string;
  question: string;
  description: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  liquidity: number;
  endDate: string;
  slug: string;
  outcome: string;
}

export interface Trade {
  id: string;
  marketId: string;
  marketQuestion: string;
  side: 'yes' | 'no';
  size: number;
  price: number;
  timestamp: string;
  status: 'pending' | 'filled' | 'cancelled';
}

export interface Agent {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  strategy: string;
  positions: number;
  totalValue: number;
  pnl: number;
  lastActivity: string;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  relevance?: number;
}

export interface TradeRequest {
  marketId: string;
  side: 'yes' | 'no';
  size: number;
  price?: number;
}

export interface TradeResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface DashboardStats {
  totalMarkets: number;
  activeAgents: number;
  totalTrades: number;
  totalValue: number;
  todayPnl: number;
}
