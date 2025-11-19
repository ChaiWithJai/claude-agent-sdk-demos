"""
Daloopa MCP Client - Interface for Daloopa Model Context Protocol server.

This module provides a Python interface to communicate with the Daloopa MCP server
for fetching financial KPI data, peer comparisons, and source verification.
"""

import json
from typing import Any, Optional
from datetime import datetime, timedelta


class DaloopaMCPClient:
    """Client for interacting with Daloopa MCP server."""

    def __init__(self, mcp_connection=None):
        """
        Initialize the Daloopa MCP client.

        Args:
            mcp_connection: The MCP connection object (provided by Claude agent runtime)
        """
        self.connection = mcp_connection
        self._cache = {}

    def call_tool(self, tool_name: str, **kwargs) -> dict:
        """
        Call a Daloopa MCP tool.

        Args:
            tool_name: Name of the MCP tool to call
            **kwargs: Arguments to pass to the tool

        Returns:
            dict: Response from the MCP tool
        """
        if self.connection is None:
            return self._mock_response(tool_name, kwargs)

        try:
            response = self.connection.call(tool_name, kwargs)
            return response
        except Exception as e:
            return {"error": str(e)}

    def get_kpi_time_series(
        self,
        ticker: str,
        kpi_name: str,
        start_date: str,
        end_date: str,
        period_type: str = "quarterly"
    ) -> dict:
        """
        Retrieve historical KPI time series data.

        Args:
            ticker: Stock ticker symbol
            kpi_name: Name of the KPI to fetch
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
            period_type: "quarterly" or "annual"

        Returns:
            dict: Time series data with periods and values
        """
        return self.call_tool(
            "daloopa_get_kpi_time_series",
            ticker=ticker,
            kpi_name=kpi_name,
            start_date=start_date,
            end_date=end_date,
            period_type=period_type
        )

    def get_peers(self, ticker: str, peer_type: str = "direct") -> dict:
        """
        Get comparable peer companies.

        Args:
            ticker: Stock ticker symbol
            peer_type: "direct", "sector", or "all"

        Returns:
            dict: List of peer companies with match scores
        """
        return self.call_tool(
            "daloopa_get_peers",
            ticker=ticker,
            peer_type=peer_type
        )

    def normalize_fiscal_periods(
        self,
        data_array: list,
        target_calendar: str = "CQ"
    ) -> dict:
        """
        Normalize different fiscal year-ends to calendar quarters.

        Args:
            data_array: Array of period data from multiple tickers
            target_calendar: "CQ" for calendar quarter

        Returns:
            dict: Normalized period mappings
        """
        return self.call_tool(
            "daloopa_normalize_fiscal_periods",
            data_array=data_array,
            target_calendar=target_calendar
        )

    def get_source_context(self, data_point_id: str) -> dict:
        """
        Get audit trail and source context for a data point.

        Args:
            data_point_id: Unique identifier for the data point

        Returns:
            dict: Source type, PDF URL, page number, text snippet
        """
        return self.call_tool(
            "daloopa_get_source_context",
            data_point_id=data_point_id
        )

    def screen_kpi(
        self,
        sector: str,
        kpi_name: str,
        condition: dict
    ) -> dict:
        """
        Screen companies by KPI criteria.

        Args:
            sector: Daloopa sector name
            kpi_name: KPI to screen
            condition: Screening condition object

        Returns:
            dict: Matching companies with KPI values and stock performance
        """
        return self.call_tool(
            "daloopa_screen_kpi",
            sector=sector,
            kpi_name=kpi_name,
            condition=condition
        )

    def _mock_response(self, tool_name: str, kwargs: dict) -> dict:
        """
        Generate mock responses for development/testing.

        This allows the skill to be developed without a live MCP connection.
        """
        if tool_name == "daloopa_get_kpi_time_series":
            return self._mock_kpi_time_series(kwargs)
        elif tool_name == "daloopa_get_peers":
            return self._mock_peers(kwargs)
        elif tool_name == "daloopa_normalize_fiscal_periods":
            return self._mock_normalize(kwargs)
        elif tool_name == "daloopa_get_source_context":
            return self._mock_source_context(kwargs)
        elif tool_name == "daloopa_screen_kpi":
            return self._mock_screen(kwargs)
        return {"error": f"Unknown tool: {tool_name}"}

    def _mock_kpi_time_series(self, kwargs: dict) -> dict:
        """Generate mock KPI time series data."""
        import random

        ticker = kwargs.get("ticker", "UNKNOWN")
        kpi_name = kwargs.get("kpi_name", "Revenue")

        periods = []
        base_value = random.uniform(100, 1000)

        for i in range(4):
            quarter = f"Q{4-i} 2024"
            value = base_value * (1 + random.uniform(-0.1, 0.15))
            periods.append({
                "period": quarter,
                "fiscal_end": f"2024-{12-i*3:02d}-30",
                "value": round(value, 2),
                "unit": "millions",
                "data_point_id": f"dp_{ticker}_{kpi_name}_{quarter}".replace(" ", "_")
            })
            base_value = value

        return {
            "ticker": ticker,
            "kpi_name": kpi_name,
            "periods": periods
        }

    def _mock_peers(self, kwargs: dict) -> dict:
        """Generate mock peer data."""
        ticker = kwargs.get("ticker", "UNKNOWN")

        mock_peers = {
            "CRWD": [
                {"ticker": "S", "name": "SentinelOne", "match_score": 0.95},
                {"ticker": "PANW", "name": "Palo Alto Networks", "match_score": 0.88},
                {"ticker": "FTNT", "name": "Fortinet", "match_score": 0.82}
            ],
            "DASH": [
                {"ticker": "UBER", "name": "Uber Technologies", "match_score": 0.92},
                {"ticker": "LYFT", "name": "Lyft", "match_score": 0.85},
                {"ticker": "GRUB", "name": "Grubhub", "match_score": 0.80}
            ]
        }

        return {
            "ticker": ticker,
            "sector": "Technology",
            "peers": mock_peers.get(ticker, [
                {"ticker": "PEER1", "name": "Peer Company 1", "match_score": 0.85}
            ])
        }

    def _mock_normalize(self, kwargs: dict) -> dict:
        """Generate mock normalized period data."""
        data_array = kwargs.get("data_array", [])

        normalized = []
        quarters = ["CQ1 2024", "CQ2 2024", "CQ3 2024", "CQ4 2024"]

        for quarter in quarters:
            ticker_data = {}
            for item in data_array:
                ticker = item.get("ticker")
                if ticker:
                    ticker_data[ticker] = {
                        "value": item.get("value", 0),
                        "original_period": item.get("period", quarter)
                    }

            if ticker_data:
                normalized.append({
                    "calendar_period": quarter,
                    "tickers": ticker_data
                })

        return {"normalized_periods": normalized}

    def _mock_source_context(self, kwargs: dict) -> dict:
        """Generate mock source context data."""
        data_point_id = kwargs.get("data_point_id", "dp_unknown")

        return {
            "data_point_id": data_point_id,
            "source_type": "10-Q",
            "filing_date": "2024-11-05",
            "page_number": 23,
            "coordinates": {"x": 145, "y": 320, "width": 200, "height": 15},
            "text_snippet": "The Company reported strong quarterly results...",
            "pdf_url": f"https://daloopa.com/source/mock/{data_point_id}#page=23",
            "sec_url": "https://www.sec.gov/Archives/edgar/data/mock"
        }

    def _mock_screen(self, kwargs: dict) -> dict:
        """Generate mock screening results."""
        import random

        matches = []
        sample_companies = [
            ("SNOW", "Snowflake"),
            ("DDOG", "Datadog"),
            ("NET", "Cloudflare"),
            ("ZS", "Zscaler"),
            ("OKTA", "Okta")
        ]

        for ticker, name in sample_companies:
            if random.random() > 0.3:
                matches.append({
                    "ticker": ticker,
                    "company_name": name,
                    "kpi_values": [
                        {"period": "Q2 2024", "value": random.uniform(100, 150)},
                        {"period": "Q3 2024", "value": random.uniform(110, 160)}
                    ],
                    "stock_performance_ytd": random.uniform(-30, 20)
                })

        return {"matches": matches}


# Utility functions

def get_quarter_dates(quarter: str) -> tuple[str, str]:
    """
    Convert quarter string to start and end dates.

    Args:
        quarter: Quarter string like "Q3 2024"

    Returns:
        tuple: (start_date, end_date) in YYYY-MM-DD format
    """
    q, year = quarter.split()
    year = int(year)

    quarter_ranges = {
        "Q1": ("01-01", "03-31"),
        "Q2": ("04-01", "06-30"),
        "Q3": ("07-01", "09-30"),
        "Q4": ("10-01", "12-31")
    }

    start_mmdd, end_mmdd = quarter_ranges[q]
    return f"{year}-{start_mmdd}", f"{year}-{end_mmdd}"


def calculate_date_range(num_quarters: int) -> tuple[str, str]:
    """
    Calculate start and end dates for N quarters back from today.

    Args:
        num_quarters: Number of quarters to look back

    Returns:
        tuple: (start_date, end_date) in YYYY-MM-DD format
    """
    end_date = datetime.now()
    start_date = end_date - timedelta(days=num_quarters * 92)

    return start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")


def format_currency(value: float, unit: str = "millions") -> str:
    """
    Format a currency value with appropriate suffix.

    Args:
        value: Numeric value
        unit: "millions", "thousands", or "billions"

    Returns:
        str: Formatted currency string
    """
    if unit == "billions":
        return f"${value/1000:.1f}B"
    elif unit == "millions":
        return f"${value:.1f}M"
    else:
        return f"${value:.0f}K"
