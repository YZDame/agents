import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Event } from '../types';
import './Events.css';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'number_of_markets' | 'end_date'>('number_of_markets');

  useEffect(() => {
    loadEvents();
  }, [sortBy]);

  async function loadEvents() {
    try {
      setLoading(true);
      const data = await api.getEvents({ limit: 50, sort_by: sortBy });
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return 'Ended';
    if (daysLeft === 0) return 'Ends today';
    if (daysLeft === 1) return '1 day left';
    return `${daysLeft} days left`;
  }

  if (loading) {
    return <div className="loading-state">Loading events...</div>;
  }

  return (
    <div className="events-page">
      <div className="page-header">
        <h1 className="page-title">Events</h1>
        <div className="controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="select"
          >
            <option value="number_of_markets">Sort by Markets</option>
            <option value="end_date">Sort by End Date</option>
          </select>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">No events found</div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} formatDate={formatDate} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, formatDate }: { event: Event; formatDate: (date: string) => string }) {
  return (
    <div className="card event-card">
      <div className="event-header">
        <h3 className="event-title">{event.title}</h3>
        {event.ticker && <div className="event-ticker">{event.ticker}</div>}
      </div>

      {event.description && (
        <p className="event-description">{event.description.slice(0, 200)}...</p>
      )}

      <div className="event-meta">
        <span className={event.active ? 'text-success' : 'text-muted'}>
          {formatDate(event.endDate)}
        </span>
        <span>{event.marketsCount} markets</span>
      </div>

      <div className="event-badges">
        {event.active && <span className="badge badge-success">Active</span>}
        {event.closed && <span className="badge badge-warning">Closed</span>}
        {event.restricted && <span className="badge badge-danger">Restricted</span>}
      </div>

      {event.markets && event.markets.length > 0 && (
        <div className="event-markets">
          <div className="text-sm text-muted">Markets:</div>
          <div className="market-list">
            {event.markets.slice(0, 3).map((marketId) => (
              <span key={marketId} className="market-id">{marketId.slice(0, 8)}...</span>
            ))}
            {event.markets.length > 3 && <span>+{event.markets.length - 3} more</span>}
          </div>
        </div>
      )}
    </div>
  );
}
