import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Market, TradeRequest } from '../types';
import './Trading.css';

export default function Trading() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const marketId = searchParams.get('market');

  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    loadMarkets();
  }, []);

  useEffect(() => {
    if (marketId && markets.length > 0) {
      const market = markets.find((m) => m.id === marketId);
      if (market) {
        setSelectedMarket(market);
        setPrice((market.yesPrice * 100).toFixed(1));
      }
    }
  }, [marketId, markets]);

  async function loadMarkets() {
    try {
      setLoading(true);
      const data = await api.getMarkets({ limit: 100 });
      setMarkets(data);
    } catch (error) {
      console.error('Failed to load markets:', error);
    } finally {
      setLoading(false);
    }
  }

  async function executeTrade() {
    if (!selectedMarket || !size || !price) return;

    try {
      setExecuting(true);
      const trade: TradeRequest = {
        marketId: selectedMarket.id,
        side,
        size: parseFloat(size),
        price: parseFloat(price) / 100,
      };

      const result = await api.executeTrade(trade);

      if (result.success) {
        alert(`Trade executed! Transaction ID: ${result.transactionId}`);
        setSize('');
      } else {
        alert(`Trade failed: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Trade failed: ${error.message}`);
    } finally {
      setExecuting(false);
    }
  }

  const estimatedCost = selectedMarket && size ? parseFloat(size) * (parseFloat(price || '0') / 100) : 0;
  const estimatedReturns = selectedMarket && size ? parseFloat(size) * (side === 'yes' ? 1 : 1) : 0;

  return (
    <div className="trading-page">
      <h1 className="page-title">Trading</h1>

      <div className="trading-layout">
        {/* Market Selection */}
        <div className="card trading-card">
          <div className="card-header">Select Market</div>
          <div className="card-body">
            {loading ? (
              <div>Loading markets...</div>
            ) : (
              <select
                className="input"
                value={selectedMarket?.id || ''}
                onChange={(e) => {
                  const market = markets.find((m) => m.id === e.target.value);
                  if (market) {
                    setSelectedMarket(market);
                    setPrice((market.yesPrice * 100).toFixed(1));
                    navigate(`/trading?market=${market.id}`, { replace: true });
                  }
                }}
              >
                <option value="">Select a market...</option>
                {markets.map((market) => (
                  <option key={market.id} value={market.id}>
                    {market.question.slice(0, 60)}...
                  </option>
                ))}
              </select>
            )}

            {selectedMarket && (
              <div className="selected-market-info">
                <h3>{selectedMarket.question}</h3>
                <div className="market-stats">
                  <span>Yes: {(selectedMarket.yesPrice * 100).toFixed(1)}c</span>
                  <span>No: {(selectedMarket.noPrice * 100).toFixed(1)}c</span>
                  <span>Vol: ${selectedMarket.volume.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Form */}
        <div className="card trading-card">
          <div className="card-header">Place Order</div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Side</label>
              <div className="side-toggle">
                <button
                  className={`side-btn ${side === 'yes' ? 'active' : ''}`}
                  onClick={() => setSide('yes')}
                >
                  Yes
                </button>
                <button
                  className={`side-btn ${side === 'no' ? 'active' : ''}`}
                  onClick={() => setSide('no')}
                >
                  No
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Size (USD)</label>
              <input
                type="number"
                className="input"
                placeholder="Enter amount"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Limit Price (cents)</label>
              <input
                type="number"
                className="input"
                placeholder="Price in cents"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            {selectedMarket && size && price && (
              <div className="order-summary">
                <div className="summary-row">
                  <span>Estimated Cost</span>
                  <span>${estimatedCost.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Potential Return</span>
                  <span>${estimatedReturns.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              className="btn btn-primary trade-submit-btn"
              onClick={executeTrade}
              disabled={!selectedMarket || !size || !price || executing}
            >
              {executing ? 'Executing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
