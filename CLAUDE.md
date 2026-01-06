# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Polymarket Agents is a Python framework for building autonomous AI trading agents for Polymarket prediction markets. It combines LangChain for LLM orchestration, ChromaDB for RAG (Retrieval-Augmented Generation), and Web3 for on-chain trading.

## Common Commands

### Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Install pre-commit hooks
pre-commit install

# Set Python path (required when running outside Docker)
export PYTHONPATH="."
```

### Running the Application
```bash
# CLI interface
python scripts/python/cli.py

# Direct autonomous trading
python agents/application/trade.py

# Server mode
python scripts/python/server.py

# Docker development
./scripts/bash/build-docker.sh
./scripts/bash/run-docker-dev.sh
```

### Testing and Linting
```bash
# Run all tests
python -m unittest discover

# Run specific test file
python -m unittest tests.test

# Format code with Black
black .
```

## Architecture

The system is organized into four main modules:

### 1. `agents/connectors/` - External API Integration
- **gamma.py**: `GammaMarketClient` - fetches market/event metadata from Polymarket's Gamma API
- **polymarket.py**: `Polymarket` - main client for market data retrieval and DEX trade execution
- **chroma.py**: Vector database for RAG; stores embeddings of news and other context
- **news.py**: NewsAPI integration for current events
- **search.py**: Web search capabilities (Tavily)

### 2. `agents/application/` - Trading Logic
- **executor.py**: AI agent executor using LangChain
- **prompts.py**: LLM prompt templates for trading decisions
- **trade.py**: Main orchestrator - filters events via RAG, maps to markets, generates strategies, executes trades
- **cron.py**: Scheduled operations
- **creator.py**: Agent creation utilities

### 3. `agents/utils/` - Data Models
- **objects.py**: Pydantic models for trades, markets, events, and related entities
- **utils.py**: General utilities

### 4. `scripts/python/` - Entry Points
- **cli.py**: Typer-based CLI with commands like `get-all-markets`, news retrieval, and LLM queries
- **server.py**: FastAPI server for remote execution

### Core Trading Flow
1. **Data Acquisition**: Fetch markets from Polymarket, news from NewsAPI, web searches
2. **RAG Filtering**: Use ChromaDB to filter relevant events based on embeddings
3. **Market Mapping**: Map filtered events to relevant prediction markets
4. **Strategy Generation**: LLM generates trading strategies via LangChain
5. **Execution**: Execute trades on Polymarket DEX using Web3

## Environment Variables

The project supports multiple LLM and embedding providers. Required in `.env`:

### Core Configuration

- `POLYGON_WALLET_PRIVATE_KEY`: Wallet private key for trading
- `LLM_PROVIDER`: LLM provider choice - `openai`, `openrouter`, `gemini`, `qiniu`, or `siliconflow` (default: `openai`)
- `EMBEDDING_PROVIDER`: Embedding provider choice - can differ from LLM provider (default: `openai`)

### API Keys (configure based on selected providers)

- `OPENAI_API_KEY`: For OpenAI LLM/embedding operations
- `OPENROUTER_API_KEY`: For OpenRouter API access
- `GOOGLE_API_KEY`: For Gemini (Google) API access
- `QINIU_API_KEY`: For Qiniu API access
- `SILICONFLOW_API_KEY`: For SiliconFlow API access
- `TAVILY_API_KEY`: For web search capabilities
- `NEWSAPI_API_KEY`: For news data sourcing

Copy `.env.example` to `.env` and fill in your values.

## Important Notes

- **Python version**: 3.9 is required
- **Code style**: Black formatter is enforced via pre-commit hooks
- **Related packages**: Uses [py-clob-client](https://github.com/Polymarket/py-clob-client) for CLOB interactions and [python-order-utils](https://github.com/Polymarket/python-order-utils) for order signing
- **Jurisdiction warning**: Polymarket TOS prohibits trading by US persons and certain other jurisdictions
