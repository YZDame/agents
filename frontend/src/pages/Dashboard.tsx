import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { DashboardStats, Trade, Agent } from '../types';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [statsData, tradesData, agentsData] = await Promise.all([
        api.getStats().catch(() => null),
        api.getTrades(10).catch(() => []),
        api.getAgents().catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      setRecentTrades(tradesData);
      setAgents(agentsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading-state">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-4 mb-3">
        <StatCard label="Total Markets" value={stats?.totalMarkets ?? 0} />
        <StatCard label="Active Agents" value={stats?.activeAgents ?? 0} />
        <StatCard label="Total Trades" value={stats?.totalTrades ?? 0} />
        <StatCard
          label="Today P&L"
          value={stats?.todayPnl ?? 0}
          prefix="$"
          format={true}
        />
      </div>

      <div className="grid grid-2">
        {/* Recent Trades */}
        <div className="card">
          <div className="card-header">Recent Trades</div>
          <div className="card-body">
            {recentTrades.length === 0 ? (
              <p className="text-muted">No recent trades</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Market</th>
                    <th>Side</th>
                    <th>Size</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map((trade) => (
                    <tr key={trade.id}>
                      <td className="text-sm">{trade.marketQuestion.slice(0, 30)}...</td>
                      <td>
                        <span className={`badge ${trade.side === 'yes' ? 'badge-success' : 'badge-warning'}`}>
                          {trade.side.toUpperCase()}
                        </span>
                      </td>
                      <td>${trade.size}</td>
                      <td>{trade.price}c</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Agents Status */}
        <div className="card">
          <div className="card-header">Agents</div>
          <div className="card-body">
            {agents.length === 0 ? (
              <p className="text-muted">No agents configured</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>P&L</th>
                    <th>Positions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id}>
                      <td>{agent.name}</td>
                      <td>
                        <span className={`badge ${agent.status === 'running' ? 'badge-success' : 'badge-warning'}`}>
                          {agent.status}
                        </span>
                      </td>
                      <td className={agent.pnl >= 0 ? 'text-success' : 'text-danger'}>
                        {agent.pnl >= 0 ? '+' : ''}${agent.pnl.toFixed(2)}
                      </td>
                      <td>{agent.positions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  prefix = '',
  format = false,
}: {
  label: string;
  value: number;
  prefix?: string;
  format?: boolean;
}) {
  const displayValue = format ? value.toLocaleString('en-US') : value.toString();

  return (
    <div className="card stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{prefix}{displayValue}</div>
    </div>
  );
}
