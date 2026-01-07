import sys
from pathlib import Path
from datetime import datetime

# 自动添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

import typer
from devtools import pprint
from rich.console import Console
from rich.markdown import Markdown
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich import box

# 初始化 Rich Console
console = Console()

from agents.polymarket.polymarket import Polymarket
from agents.connectors.chroma import PolymarketRAG
from agents.connectors.news import News
from agents.application.trade import Trader
from agents.application.executor import Executor
from agents.application.creator import Creator
from agents.utils.objects import SimpleMarket, SimpleEvent

app = typer.Typer()
polymarket = Polymarket()
newsapi_client = News()
polymarket_rag = PolymarketRAG()


def format_simple_market(market: SimpleMarket, index: int = None) -> None:
    """使用 Rich 彩色格式化输出 SimpleMarket 对象"""
    # 标题行
    prefix = f"[{index}] " if index is not None else ""
    header = Text()
    header.append(prefix, style="bold cyan")
    header.append(f"Market ID: ", style="dim")
    header.append(f"{market.id}", style="bold cyan")
    console.print(header)

    # 创建表格
    table = Table(box=box.ROUNDED, show_header=False, padding=(0, 1))
    table.add_column("Field", style="bold yellow", width=15)
    table.add_column("Value", style="white")

    # 问题（最重要，高亮显示）
    table.add_row(
        "Question",
        Text(market.question, style="bold bright_white")
    )

    # 结束日期
    try:
        end_date = datetime.fromisoformat(market.end.replace('Z', '+00:00'))
        end_str = end_date.strftime("%Y-%m-%d %H:%M UTC")
        now = datetime.now(end_date.tzinfo)  # 使用 end_date 的时区
        days_left = (end_date - now).days
        days_info = f" ({days_left} days left)" if days_left >= 0 else " (ended)"
        table.add_row("End Date", Text(end_str + days_info, style="cyan"))
    except:
        table.add_row("End Date", Text(market.end, style="cyan"))

    # 价差
    spread_color = "green" if market.spread > 0.5 else "yellow" if market.spread > 0.2 else "red"
    table.add_row("Spread", Text(f"{market.spread:.3f}", style=spread_color))

    # 状态
    active_status = "[green]✓[/green] Active" if market.active else "[red]✗[/red] Inactive"
    funded_status = "[green]✓[/green] Funded" if market.funded else "[red]✗[/red] Unfunded"
    table.add_row("Status", f"{active_status} | {funded_status}")

    # 结果和价格
    import json
    try:
        outcomes = json.loads(market.outcomes)
        prices = json.loads(market.outcome_prices)
        price_text = " | ".join([f"{o}: {p}" for o, p in zip(outcomes, prices)])
        table.add_row("Outcomes", Text(price_text, style="bright_blue"))
    except:
        table.add_row("Outcomes", Text(market.outcomes, style="bright_blue"))

    # 描述（截断）
    if market.description:
        desc = market.description[:200] + "..." if len(market.description) > 200 else market.description
        table.add_row("Description", Text(desc, style="dim"))

    console.print(table)


def format_simple_event(event: SimpleEvent, index: int = None) -> None:
    """使用 Rich 彩色格式化输出 SimpleEvent 对象"""
    # 标题行
    prefix = f"[{index}] " if index is not None else ""
    header = Text()
    header.append(prefix, style="bold cyan")
    header.append(f"Event ID: ", style="dim")
    header.append(f"{event.id}", style="bold cyan")
    console.print(header)

    # 创建表格
    table = Table(box=box.ROUNDED, show_header=False, padding=(0, 1))
    table.add_column("Field", style="bold yellow", width=15)
    table.add_column("Value", style="white")

    # 标题（最重要，高亮显示）
    table.add_row(
        "Title",
        Text(event.title, style="bold bright_white")
    )

    # Ticker
    table.add_row("Ticker", Text(event.ticker, style="cyan"))

    # 结束日期
    try:
        end_date = datetime.fromisoformat(event.end.replace('Z', '+00:00'))
        end_str = end_date.strftime("%Y-%m-%d %H:%M UTC")
        now = datetime.now(end_date.tzinfo)  # 使用 end_date 的时区
        days_left = (end_date - now).days
        days_info = f" ({days_left} days left)" if days_left >= 0 else " (ended)"
        table.add_row("End Date", Text(end_str + days_info, style="cyan"))
    except:
        table.add_row("End Date", Text(event.end, style="cyan"))

    # 状态
    active_status = "[green]✓[/green] Active" if event.active else "[red]✗[/red] Inactive"
    closed_status = "[red]✗[/red] Closed" if event.closed else "[green]✓[/green] Open"
    restricted_status = "[yellow]⚠[/yellow] Restricted" if event.restricted else "[green]✓[/green] Unrestricted"
    table.add_row("Status", f"{active_status} | {closed_status} | {restricted_status}")

    # 市场数量
    market_count = len(event.markets.split(",")) if event.markets else 0
    table.add_row("Markets", Text(f"{market_count} markets", style="bright_blue"))

    # Slug
    table.add_row("Slug", Text(event.slug, style="dim"))

    # 描述（截断）
    if event.description:
        desc = event.description[:300] + "..." if len(event.description) > 300 else event.description
        table.add_row("Description", Text(desc, style="dim"))

    console.print(table)


@app.command()
def get_all_markets(limit: int = 5, sort_by: str = "spread") -> None:
    """
    Query Polymarket's markets
    """
    console.print(f"[bold]Querying markets...[/bold] limit: {limit}, sort_by: {sort_by}\n")
    markets = polymarket.get_all_markets()
    markets = polymarket.filter_markets_for_trading(markets)
    if sort_by == "spread":
        markets = sorted(markets, key=lambda x: x.spread, reverse=True)
    markets = markets[:limit]

    # 使用彩色格式化输出
    for i, market in enumerate(markets, 1):
        format_simple_market(market, index=i)

    console.print(f"\n[dim]Showing {len(markets)} markets[/dim]")


@app.command()
def get_relevant_news(keywords: str) -> None:
    """
    Use NewsAPI to query the internet
    """
    articles = newsapi_client.get_articles_for_cli_keywords(keywords)
    pprint(articles)


@app.command()
def get_all_events(limit: int = 5, sort_by: str = "number_of_markets") -> None:
    """
    Query Polymarket's events
    """
    console.print(f"[bold]Querying events...[/bold] limit: {limit}, sort_by: {sort_by}\n")
    events = polymarket.get_all_events()
    events = polymarket.filter_events_for_trading(events)
    if sort_by == "number_of_markets":
        # markets 是逗号分隔的 ID 字符串，计算市场数量
        events = sorted(events, key=lambda x: len(x.markets.split(",")) if x.markets else 0, reverse=True)
    events = events[:limit]

    # 使用彩色格式化输出
    for i, event in enumerate(events, 1):
        format_simple_event(event, index=i)

    console.print(f"\n[dim]Showing {len(events)} events[/dim]")


@app.command()
def create_local_markets_rag(local_directory: str) -> None:
    """
    Create a local markets database for RAG
    """
    polymarket_rag.create_local_markets_rag(local_directory=local_directory)


@app.command()
def query_local_markets_rag(vector_db_directory: str, query: str) -> None:
    """
    RAG over a local database of Polymarket's events
    """
    response = polymarket_rag.query_local_markets_rag(
        local_directory=vector_db_directory, query=query
    )
    pprint(response)


@app.command()
def ask_superforecaster(event_title: str, market_question: str, outcome: str) -> None:
    """
    Ask a superforecaster about a trade
    """
    console.print(
        f"[bold cyan]event:[/bold cyan] {event_title}\n"
        f"[bold cyan]question:[/bold cyan] {market_question}\n"
        f"[bold cyan]outcome:[/bold cyan] {outcome}"
    )
    executor = Executor()
    response = executor.get_superforecast(
        event_title=event_title, market_question=market_question, outcome=outcome
    )
    console.print("\n[bold green]Response:[/bold green]")
    console.print(Markdown(response))


@app.command()
def create_market() -> None:
    """
    Format a request to create a market on Polymarket
    """
    c = Creator()
    market_description = c.one_best_market()
    print(f"market_description: str = {market_description}")


@app.command()
def ask_llm(user_input: str) -> None:
    """
    Ask a question to the LLM and get a response.
    """
    console.print(f"[bold yellow]Question:[/bold yellow] {user_input}")
    executor = Executor()
    response = executor.get_llm_response(user_input)
    console.print("\n[bold green]Response:[/bold green]")
    console.print(Markdown(response))


@app.command()
def ask_polymarket_llm(user_input: str) -> None:
    """
    What types of markets do you want trade?
    """
    console.print(f"[bold yellow]Question:[/bold yellow] {user_input}")
    executor = Executor()
    response = executor.get_polymarket_llm(user_input=user_input)
    console.print("\n[bold green]Response (with market context):[/bold green]")
    console.print(Markdown(response))


@app.command()
def run_autonomous_trader() -> None:
    """
    Let an autonomous system trade for you.
    """
    trader = Trader()
    trader.one_best_trade()


if __name__ == "__main__":
    app()
