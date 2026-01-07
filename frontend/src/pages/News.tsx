import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { NewsItem } from '../types';
import './News.css';

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadNews();
  }, []);

  async function loadNews() {
    try {
      setLoading(true);
      const data = await api.getNews(50);
      setNews(data);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const data = await api.searchNews(searchQuery);
      setNews(data);
    } catch (error) {
      console.error('Failed to search news:', error);
    } finally {
      setSearching(false);
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  }

  return (
    <div className="news-page">
      <div className="flex-between mb-3">
        <h1 className="page-title">News</h1>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="input"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn" disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading-state">Loading news...</div>
      ) : news.length === 0 ? (
        <div className="empty-state">No news found</div>
      ) : (
        <div className="news-list">
          {news.map((item) => (
            <div key={item.id} className="news-item card">
              <div className="card-body">
                <div className="news-header">
                  <span className="news-source">{item.source}</span>
                  <span className="news-date">{formatDate(item.publishedAt)}</span>
                </div>
                <h3 className="news-title">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </h3>
                {item.description && (
                  <p className="news-description">{item.description}</p>
                )}
                {item.relevance !== undefined && (
                  <div className="news-relevance">
                    Relevance: {Math.round(item.relevance * 100)}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
