import { useState } from 'react';
import { api } from '../services/api';
import type { AutonomousTraderResponse } from '../types';
import './AutonomousTrading.css';

export default function AutonomousTrading() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AutonomousTraderResponse | null>(null);
  const [executeTrade, setExecuteTrade] = useState(false);
  const [dryRun, setDryRun] = useState(true);

  async function runAutonomousTrader() {
    setLoading(true);
    setResponse(null);

    try {
      const result = executeTrade && !dryRun
        ? await api.executeAutonomousTrader({ execute_trade: true, dry_run: dryRun })
        : await api.getTradeRecommendation();

      setResponse(result);
    } catch (error) {
      console.error('Failed to run autonomous trader:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="autonomous-trading">
      <h1 className="page-title">Autonomous Trading</h1>
      <p className="page-description">
        AI-powered trading agent that analyzes events, markets, and executes trades automatically
      </p>

      <div className="card">
        <div className="card-header">Configuration</div>
        <div className="card-body">
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={executeTrade}
                onChange={(e) => setExecuteTrade(e.target.checked)}
                className="checkbox"
              />
              <span>Execute Trades (Default: Recommendation Only)</span>
            </label>
            <small className="text-muted">
              When unchecked, the agent will only recommend trades without executing them
            </small>
          </div>

          {executeTrade && (
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  className="checkbox"
                />
                <span>Dry Run Mode (Safe Mode)</span>
              </label>
              <small className="text-muted">
                When enabled, trades are simulated but not executed on-chain
              </small>
            </div>
          )}

          <button
            onClick={runAutonomousTrader}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Running...' : 'Run Autonomous Trader'}
          </button>
        </div>
      </div>

      {response && (
        <div className="card">
          <div className="card-header">Results</div>
          <div className="card-body">
            {response.error ? (
              <div className="alert alert-danger">{response.error}</div>
            ) : (
              <>
                <PipelineSteps steps={response.steps_completed} />

                <div className="stats-grid">
                  <StatCard label="Events Found" value={response.events_found} />
                  <StatCard label="Events Filtered" value={response.events_filtered} />
                  <StatCard label="Markets Found" value={response.markets_found} />
                  <StatCard label="Markets Filtered" value={response.markets_filtered} />
                </div>

                {response.trade_recommendation && (
                  <div className="trade-recommendation">
                    <h3>Trade Recommendation</h3>
                    <pre>{response.trade_recommendation.trade}</pre>
                  </div>
                )}

                {response.trade_executed && (
                  <div className="alert alert-success">
                    Trade Executed Successfully
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PipelineSteps({ steps }: { steps: string[] }) {
  return (
    <div className="pipeline-steps">
      <h3>Pipeline Steps</h3>
      <div className="steps-list">
        {steps.map((step, index) => (
          <div key={index} className="step-item">
            <span className="step-number">{index + 1}</span>
            <span className="step-text">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
