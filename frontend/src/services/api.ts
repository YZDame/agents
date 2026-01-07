import type {
  Market, Trade, Agent, NewsItem, TradeRequest, TradeResponse, DashboardStats,
  Event, LLMChatRequest, LLMChatResponse, RAGQueryRequest, RAGQueryResponse,
  RAGResult, RAGCreateRequest, AutonomousTraderRequest, AutonomousTraderResponse,
  MarketIdeaResponse
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Dashboard
  getStats: () => request<DashboardStats>('/stats'),

  // Markets
  getMarkets: (params?: { limit?: number; offset?: number }) =>
    request<Market[]>('/markets', {
      method: 'POST',
      body: JSON.stringify(params || {}),
    }),

  getMarket: (id: string) => request<Market>(`/markets/${id}`),

  // Trading
  executeTrade: (trade: TradeRequest) =>
    request<TradeResponse>('/trade', {
      method: 'POST',
      body: JSON.stringify(trade),
    }),

  getTrades: (limit = 50) =>
    request<Trade[]>(`/trades?limit=${limit}`),

  // Agents
  getAgents: () => request<Agent[]>('/agents'),

  getAgent: (id: string) => request<Agent>(`/agents/${id}`),

  startAgent: (id: string) =>
    request<{ success: boolean }>(`/agents/${id}/start`, { method: 'POST' }),

  stopAgent: (id: string) =>
    request<{ success: boolean }>(`/agents/${id}/stop`, { method: 'POST' }),

  // News
  getNews: (limit = 20) =>
    request<NewsItem[]>(`/news?limit=${limit}`),

  searchNews: (query: string) =>
    request<NewsItem[]>(`/news/search`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  // ========================================
  // EVENTS
  // ========================================

  getEvents: (params?: { limit?: number; sort_by?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
    const queryString = searchParams.toString();
    return request<Event[]>(`/events${queryString ? `?${queryString}` : ''}`);
  },

  getEvent: (id: string) => request<Event>(`/events/${id}`),

  // ========================================
  // LLM CHAT
  // ========================================

  chatLLM: (chatRequest: LLMChatRequest) =>
    request<LLMChatResponse>('/llm/chat', {
      method: 'POST',
      body: JSON.stringify(chatRequest),
    }),

  // ========================================
  // RAG
  // ========================================

  createRAGDatabase: (ragRequest: RAGCreateRequest) =>
    request<{ success: boolean; message: string }>('/rag/create', {
      method: 'POST',
      body: JSON.stringify(ragRequest),
    }),

  queryRAGDatabase: (ragRequest: RAGQueryRequest) =>
    request<RAGQueryResponse>('/rag/query', {
      method: 'POST',
      body: JSON.stringify(ragRequest),
    }),

  filterEventsRAG: (query: string) =>
    request<RAGResult[]>('/rag/filter-events', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  // ========================================
  // AUTONOMOUS TRADING
  // ========================================

  getTradeRecommendation: () =>
    request<AutonomousTraderResponse>('/trading/recommendation', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  executeAutonomousTrader: (traderRequest: AutonomousTraderRequest) =>
    request<AutonomousTraderResponse>('/trading/execute-autonomous', {
      method: 'POST',
      body: JSON.stringify(traderRequest),
    }),

  // ========================================
  // MARKET CREATION
  // ========================================

  generateMarketIdea: () =>
    request<MarketIdeaResponse>('/markets/generate-idea', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
};
