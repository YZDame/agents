import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import type { ChatMessage, LLMMode } from '../types';
import './AIChat.css';

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<LLMMode>('general');
  const [loading, setLoading] = useState(false);
  const [superforecasterContext, setSuperforecasterContext] = useState({
    event_title: '',
    market_question: '',
    outcome: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      mode,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let response;

      if (mode === 'superforecaster') {
        response = await api.chatLLM({
          message: input,
          mode,
          context: superforecasterContext,
        });
      } else {
        response = await api.chatLLM({
          message: input,
          mode,
        });
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        mode: response.mode,
        timestamp: response.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function setSuggestion(text: string) {
    setInput(text);
  }

  return (
    <div className="ai-chat">
      <div className="chat-header">
        <h1 className="page-title">AI Market Analyst</h1>
        <div className="chat-controls">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as LLMMode)}
            className="select"
          >
            <option value="general">General Analyst</option>
            <option value="polymarket">Polymarket Assistant</option>
            <option value="superforecaster">Superforecaster</option>
          </select>
        </div>
      </div>

      {mode === 'superforecaster' && (
        <div className="superforecaster-context card">
          <div className="card-body">
            <h3>Superforecaster Context</h3>
            <div className="form-group">
              <label>Event Title</label>
              <input
                type="text"
                value={superforecasterContext.event_title}
                onChange={(e) => setSuperforecasterContext({ ...superforecasterContext, event_title: e.target.value })}
                placeholder="e.g., US Presidential Election 2024"
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Market Question</label>
              <input
                type="text"
                value={superforecasterContext.market_question}
                onChange={(e) => setSuperforecasterContext({ ...superforecasterContext, market_question: e.target.value })}
                placeholder="e.g., Will the Democratic candidate win?"
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Outcome</label>
              <input
                type="text"
                value={superforecasterContext.outcome}
                onChange={(e) => setSuperforecasterContext({ ...superforecasterContext, outcome: e.target.value })}
                placeholder="e.g., Yes"
                className="input"
              />
            </div>
          </div>
        </div>
      )}

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <h2>Welcome to AI Market Analyst</h2>
              <p>Ask me anything about markets, trading strategies, or get predictions for specific outcomes.</p>
              <div className="suggestions">
                <button onClick={() => setSuggestion('What are the current market trends?')} className="btn">
                  What are the current market trends?
                </button>
                <button onClick={() => setSuggestion('Analyze the crypto markets for trading opportunities')} className="btn">
                  Analyze crypto markets
                </button>
                {mode === 'polymarket' && (
                  <button onClick={() => setSuggestion('What types of markets should I trade?')} className="btn">
                    What markets should I trade?
                  </button>
                )}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`chat-message ${message.role}`}>
              <div className="message-header">
                <span className="message-role">{message.role}</span>
                <span className="message-mode">{message.mode}</span>
                <span className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{message.content}</div>
            </div>
          ))}

          {loading && (
            <div className="chat-message assistant">
              <div className="message-header">
                <span className="message-role">assistant</span>
              </div>
              <div className="message-content">Thinking...</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about markets, trading, or predictions..."
            className="chat-input"
            rows={3}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            className="btn btn-primary"
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
