import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Agent } from '../types';
import './Agents.css';

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    try {
      setLoading(true);
      const data = await api.getAgents();
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleAgent(agent: Agent) {
    try {
      if (agent.status === 'running') {
        await api.stopAgent(agent.id);
      } else {
        await api.startAgent(agent.id);
      }
      await loadAgents();
    } catch (error: any) {
      alert(`Failed to toggle agent: ${error.message}`);
    }
  }

  return (
    <div className="agents-page">
      <h1 className="page-title">Agents</h1>

      {loading ? (
        <div className="loading-state">Loading agents...</div>
      ) : agents.length === 0 ? (
        <div className="empty-state">
          <p>No agents configured</p>
          <p className="text-muted">Agents will appear here once configured in the backend.</p>
        </div>
      ) : (
        <div className="agents-layout">
          {/* Agents List */}
          <div className="agents-list card">
            <div className="card-header">Agents</div>
            <div className="card-body">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`agent-item ${selectedAgent?.id === agent.id ? 'active' : ''}`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="agent-item-header">
                    <span className="agent-name">{agent.name}</span>
                    <span className={`badge ${agent.status === 'running' ? 'badge-success' : 'badge-warning'}`}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="text-sm">{agent.strategy}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Details */}
          {selectedAgent && (
            <div className="agent-details card">
              <div className="card-header flex-between">
                <span>{selectedAgent.name}</span>
                <button
                  className={`btn btn-sm ${selectedAgent.status === 'running' ? '' : 'btn-primary'}`}
                  onClick={() => toggleAgent(selectedAgent)}
                >
                  {selectedAgent.status === 'running' ? 'Stop' : 'Start'}
                </button>
              </div>
              <div className="card-body">
                <div className="detail-row">
                  <span className="detail-label">Strategy</span>
                  <span>{selectedAgent.strategy}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span className={`badge ${selectedAgent.status === 'running' ? 'badge-success' : 'badge-warning'}`}>
                    {selectedAgent.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total Value</span>
                  <span>${selectedAgent.totalValue.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Positions</span>
                  <span>{selectedAgent.positions}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">P&L</span>
                  <span className={selectedAgent.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>
                    {selectedAgent.pnl >= 0 ? '+' : ''}${selectedAgent.pnl.toFixed(2)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Activity</span>
                  <span className="text-sm">
                    {new Date(selectedAgent.lastActivity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
