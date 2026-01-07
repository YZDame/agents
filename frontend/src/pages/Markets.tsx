import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Market } from '../types';
import './Markets.css';

export default function Markets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadMarkets();
  }, []);

  async function loadMarkets() {
    try {
      setLoading(true);
      const data = await api.getMarkets({ limit: 50 });
      setMarkets(data);
    } catch (error) {
      console.error('Failed to load markets:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMarkets = markets.filter((m) => {
    if (filter === 'all') return true;
    if (filter === 'open') return new Date(m.endDate) > new Date();
    return new Date(m.endDate) <= new Date();
  });

  return (
    <div className="markets-page">
      <div className="flex-between mb-3">
        <h1 className="page-title">Markets</h1>
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-tab ${filter === 'open' ? 'active' : ''}`}
            onClick={() => setFilter('open')}
          >
            Open
          </button>
          <button
            className={`filter-tab ${filter === 'closed' ? 'active' : ''}`}
            onClick={() => setFilter('closed')}
          >
            Closed
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading markets...</div>
      ) : filteredMarkets.length === 0 ? (
        <div className="empty-state">No markets found</div>
      ) : (
        <div className="markets-grid">
          {filteredMarkets.map((market) => (
            <div key={market.id} className="market-card card">
              <div className="market-card-body">
                <h3 className="market-question">{market.question}</h3>
                {market.description && (
                  <p className="market-description">{market.description}</p>
                )}

                <div className="market-prices">
                  <div className="price-row">
                    <span className="price-label">Yes</span>
                    <span className="price-value yes">{(market.yesPrice * 100).toFixed(1)}c</span>
                  </div>
                  <div className="price-bar">
                    <div
                      className="price-fill yes-fill"
                      style={{ width: `${market.yesPrice * 100}%` }}
                    />
                  </div>
                  <div className="price-row">
                    <span className="price-label">No</span>
                    <span className="price-value no">{(market.noPrice * 100).toFixed(1)}c</span>
                  </div>
                </div>

                <div className="market-meta">
                  <span className="meta-item">Vol: ${market.volume.toLocaleString()}</span>
                  <span className="meta-item">Ends: {new Date(market.endDate).toLocaleDateString()}</span>
                </div>

                <button
                  className="btn btn-primary trade-btn"
                  onClick={() => navigate(`/trading?market=${market.id}`)}
                >
                  Trade
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
