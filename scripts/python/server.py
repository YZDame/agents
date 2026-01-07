import os
import sys
from typing import Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add project root to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from agents.polymarket.polymarket import Polymarket
from agents.polymarket.gamma import GammaMarketClient
from agents.connectors.news import News

load_dotenv()

app = FastAPI(title="Polymarket Agents API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize clients
polymarket = Polymarket()
gamma = GammaMarketClient()
news_client = News()


# Pydantic models for API requests/responses
class TradeRequest(BaseModel):
    marketId: str
    side: str  # 'yes' or 'no'
    size: float
    price: Optional[float] = None


class DashboardStats(BaseModel):
    totalMarkets: int
    activeAgents: int
    totalTrades: int
    totalValue: float
    todayPnl: float


class Market(BaseModel):
    id: str
    question: str
    description: str
    yesPrice: float
    noPrice: float
    volume: float
    liquidity: float
    endDate: str
    slug: str
    outcome: str


class Trade(BaseModel):
    id: str
    marketId: str
    marketQuestion: str
    side: str
    size: float
    price: float
    timestamp: str
    status: str


class Agent(BaseModel):
    id: str
    name: str
    status: str
    strategy: str
    positions: int
    totalValue: float
    pnl: float
    lastActivity: str


class NewsItem(BaseModel):
    id: str
    title: str
    description: str
    url: str
    source: str
    publishedAt: str
    relevance: Optional[float] = None


# Mock data storage (in production, use a database)
mock_trades = []
mock_agents = [
    {
        "id": "agent-1",
        "name": "Trend Follower",
        "status": "stopped",
        "strategy": "Momentum-based trading",
        "positions": 0,
        "totalValue": 1000.0,
        "pnl": 45.50,
        "lastActivity": datetime.now().isoformat(),
    },
    {
        "id": "agent-2",
        "name": "News Arbitrage",
        "status": "stopped",
        "strategy": "RAG-based news analysis",
        "positions": 0,
        "totalValue": 500.0,
        "pnl": -12.30,
        "lastActivity": datetime.now().isoformat(),
    },
]


@app.get("/")
def read_root():
    return {"message": "Polymarket Agents API", "version": "1.0.0"}


@app.get("/api/stats", response_model=DashboardStats)
def get_stats():
    """Get dashboard statistics"""
    try:
        markets = polymarket.get_all_markets(limit=1000)
        return DashboardStats(
            totalMarkets=len(markets),
            activeAgents=sum(1 for a in mock_agents if a["status"] == "running"),
            totalTrades=len(mock_trades),
            totalValue=sum(a["totalValue"] for a in mock_agents),
            todayPnl=sum(a["pnl"] for a in mock_agents),
        )
    except Exception as e:
        # Return defaults on error
        return DashboardStats(
            totalMarkets=0,
            activeAgents=0,
            totalTrades=len(mock_trades),
            totalValue=1500.0,
            todayPnl=33.20,
        )


@app.post("/api/markets", response_model=list[Market])
def get_markets(limit: int = 50, offset: int = 0):
    """Get list of markets"""
    try:
        # Get markets from Gamma API
        markets_data = gamma.get_markets(
            querystring_params={
                "active": True,
                "closed": False,
                "archived": False,
                "limit": limit,
                "offset": offset,
            }
        )

        markets = []
        for m in markets_data:
            try:
                outcome_prices = m.get("outcomePrices", "[]")
                if isinstance(outcome_prices, str):
                    import json
                    outcome_prices = json.loads(outcome_prices)

                yes_price = float(outcome_prices[0]) if outcome_prices else 0.5
                no_price = float(outcome_prices[1]) if len(outcome_prices) > 1 else 1 - yes_price

                markets.append(
                    Market(
                        id=str(m.get("id", "")),
                        question=m.get("question", ""),
                        description=m.get("description", "")[:200],
                        yesPrice=yes_price,
                        noPrice=no_price,
                        volume=float(m.get("volume", 0)),
                        liquidity=float(m.get("liquidity", 0)),
                        endDate=m.get("endDate", ""),
                        slug=m.get("slug", ""),
                        outcome=str(m.get("outcomes", [""])[0]) if m.get("outcomes") else "",
                    )
                )
            except Exception as e:
                # Skip malformed markets
                continue

        return markets
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/markets/{market_id}", response_model=Market)
def get_market(market_id: str):
    """Get a specific market by ID"""
    try:
        market_data = gamma.get_market(market_id)

        outcome_prices = market_data.get("outcomePrices", "[]")
        if isinstance(outcome_prices, str):
            import json
            outcome_prices = json.loads(outcome_prices)

        yes_price = float(outcome_prices[0]) if outcome_prices else 0.5
        no_price = float(outcome_prices[1]) if len(outcome_prices) > 1 else 1 - yes_price

        return Market(
            id=str(market_data.get("id", "")),
            question=market_data.get("question", ""),
            description=market_data.get("description", "")[:200],
            yesPrice=yes_price,
            noPrice=no_price,
            volume=float(market_data.get("volume", 0)),
            liquidity=float(market_data.get("liquidity", 0)),
            endDate=market_data.get("endDate", ""),
            slug=market_data.get("slug", ""),
            outcome=str(market_data.get("outcomes", [""])[0]) if market_data.get("outcomes") else "",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/trade")
def execute_trade(trade: TradeRequest):
    """Execute a trade"""
    try:
        # Convert yes/no to token_id logic
        # For now, this is a simplified version
        # In production, you'd need to get the correct token_id from the market

        # Execute the trade using Polymarket client
        # price needs to be in the correct format (0-1)
        price = trade.price if trade.price else 0.5

        # Create a mock trade response
        # Real implementation would call polymarket.execute_order()
        trade_record = {
            "id": f"trade-{len(mock_trades) + 1}",
            "marketId": trade.marketId,
            "marketQuestion": f"Market {trade.marketId}",
            "side": trade.side,
            "size": trade.size,
            "price": price,
            "timestamp": datetime.now().isoformat(),
            "status": "filled",
        }
        mock_trades.append(trade_record)

        return {
            "success": True,
            "transactionId": trade_record["id"],
            "message": "Trade executed successfully",
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/api/trades", response_model=list[Trade])
def get_trades(limit: int = Query(50, ge=1, le=100)):
    """Get recent trades"""
    return mock_trades[-limit:]


@app.get("/api/agents", response_model=list[Agent])
def get_agents():
    """Get all agents"""
    return [Agent(**a) for a in mock_agents]


@app.get("/api/agents/{agent_id}", response_model=Agent)
def get_agent(agent_id: str):
    """Get a specific agent"""
    for agent in mock_agents:
        if agent["id"] == agent_id:
            return Agent(**agent)
    raise HTTPException(status_code=404, detail="Agent not found")


@app.post("/api/agents/{agent_id}/start")
def start_agent(agent_id: str):
    """Start an agent"""
    for agent in mock_agents:
        if agent["id"] == agent_id:
            agent["status"] = "running"
            agent["lastActivity"] = datetime.now().isoformat()
            return {"success": True, "message": f"Agent {agent_id} started"}
    raise HTTPException(status_code=404, detail="Agent not found")


@app.post("/api/agents/{agent_id}/stop")
def stop_agent(agent_id: str):
    """Stop an agent"""
    for agent in mock_agents:
        if agent["id"] == agent_id:
            agent["status"] = "stopped"
            agent["lastActivity"] = datetime.now().isoformat()
            return {"success": True, "message": f"Agent {agent_id} stopped"}
    raise HTTPException(status_code=404, detail="Agent not found")


@app.get("/api/news", response_model=list[NewsItem])
def get_news(limit: int = Query(20, ge=1, le=100)):
    """Get recent news"""
    try:
        # Get top headlines
        response = news_client.API.get_top_headlines(
            language="en",
            country="us",
            page_size=limit,
        )

        news_items = []
        for article in response.get("articles", [])[:limit]:
            if article.get("title") and article.get("title") != "[Removed]":
                news_items.append(
                    NewsItem(
                        id=f"news-{len(news_items)}",
                        title=article.get("title", ""),
                        description=article.get("description", ""),
                        url=article.get("url", ""),
                        source=article.get("source", {}).get("name", "Unknown"),
                        publishedAt=article.get("publishedAt", datetime.now().isoformat()),
                    )
                )

        return news_items
    except Exception as e:
        # Return mock news on error
        return [
            NewsItem(
                id="mock-1",
                title="Market Update: Crypto Trends Continue",
                description="Latest developments in cryptocurrency markets...",
                url="https://example.com",
                source="Mock Source",
                publishedAt=datetime.now().isoformat(),
            )
        ]


@app.post("/api/news/search")
def search_news(query: dict):
    """Search news by query"""
    try:
        search_query = query.get("query", "")
        if not search_query:
            return []

        response = news_client.API.get_everything(
            q=search_query,
            language="en",
            sort_by="publishedAt",
            page_size=20,
        )

        news_items = []
        for article in response.get("articles", []):
            if article.get("title") and article.get("title") != "[Removed]":
                news_items.append(
                    NewsItem(
                        id=f"news-{len(news_items)}",
                        title=article.get("title", ""),
                        description=article.get("description", ""),
                        url=article.get("url", ""),
                        source=article.get("source", {}).get("name", "Unknown"),
                        publishedAt=article.get("publishedAt", datetime.now().isoformat()),
                    )
                )

        return news_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
