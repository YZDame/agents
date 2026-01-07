import type { Market, Trade, Agent, NewsItem, TradeRequest, TradeResponse, DashboardStats } from '../types';

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
};
