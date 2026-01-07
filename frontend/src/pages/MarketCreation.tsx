import { useState } from 'react';
import { api } from '../services/api';
import type { MarketIdeaResponse } from '../types';
import './MarketCreation.css';

export default function MarketCreation() {
  const [loading, setLoading] = useState(false);
  const [idea, setIdea] = useState<MarketIdeaResponse | null>(null);

  async function generateIdea() {
    setLoading(true);
    setIdea(null);

    try {
      const result = await api.generateMarketIdea();
      setIdea(result);
    } catch (error) {
      console.error('Failed to generate market idea:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="market-creation">
      <h1 className="page-title">Market Creation</h1>
      <p className="page-description">
        Generate new prediction market ideas using AI analysis of existing markets
      </p>

      <div className="card">
        <div className="card-body">
          <button
            onClick={generateIdea}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Generating...' : 'Generate Market Idea'}
          </button>
        </div>
      </div>

      {idea && (
        <div className="card">
          <div className="card-header">Generated Market Idea</div>
          <div className="card-body">
            <div className="idea-section">
              <h3>Market Description</h3>
              <p>{idea.market_description}</p>
            </div>

            <div className="idea-section">
              <h3>Analysis</h3>
              <p>{idea.analysis}</p>
            </div>

            <div className="idea-meta">
              <span className="text-muted">
                Generated at {new Date(idea.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">How It Works</div>
        <div className="card-body">
          <ol className="steps">
            <li>Analyze existing events and markets using RAG</li>
            <li>Identify gaps and opportunities in the current market landscape</li>
            <li>Generate novel market ideas based on trends and demand</li>
            <li>Provide analysis of why this market would be valuable</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
