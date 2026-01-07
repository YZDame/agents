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

// ========================================
// EVENT TYPES
// ========================================

export interface Event {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  description: string;
  endDate: string;
  active: boolean;
  closed: boolean;
  restricted: boolean;
  marketsCount: number;
  markets: string[];
}

// ========================================
// LLM CHAT TYPES
// ========================================

export type LLMMode = 'general' | 'polymarket' | 'superforecaster';

export interface LLMChatRequest {
  message: string;
  mode: LLMMode;
  context?: {
    event_title?: string;
    market_question?: string;
    outcome?: string;
  };
}

export interface LLMChatResponse {
  response: string;
  mode: LLMMode;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: LLMMode;
  timestamp: string;
}

// ========================================
// RAG TYPES
// ========================================

export interface RAGQueryRequest {
  query: string;
  filter_type: 'events' | 'markets';
  local_directory?: string;
}

export interface RAGQueryResponse {
  results: RAGResult[];
  query: string;
  count: number;
}

export interface RAGResult {
  content: string;
  metadata: Record<string, any>;
  score: number;
}

export interface RAGCreateRequest {
  local_directory: string;
  data_type: 'markets' | 'events';
}

// ========================================
// AUTONOMOUS TRADING TYPES
// ========================================

export interface AutonomousTraderRequest {
  execute_trade: boolean;
  dry_run: boolean;
}

export interface AutonomousTraderResponse {
  steps_completed: string[];
  events_found: number;
  events_filtered: number;
  markets_found: number;
  markets_filtered: number;
  trade_recommendation?: {
    trade: string;
  };
  trade_executed: boolean;
  error?: string;
}

// ========================================
// MARKET CREATION TYPES
// ========================================

export interface MarketIdeaResponse {
  market_description: string;
  analysis: string;
  timestamp: string;
}

// ========================================
// SEMANTIC SEARCH TYPES
// ========================================

export interface SemanticSearchRequest {
  query: string;
  search_type: 'markets' | 'events';
  limit?: number;
}

export interface SemanticSearchResult {
  content: string;
  metadata: Record<string, any>;
  score: number;
}
