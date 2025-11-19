---
name: daloopa-mcp
description: "Advanced financial analysis agent with Daloopa MCP integration for institutional finance workflows. Use when the user needs: (1) Earnings sprint - updating models with new actuals and variance analysis, (2) Deep benchmarking - normalized KPI comparisons across peers, (3) Operational screening - finding divergences between KPIs and stock performance, (4) Audit trail validation - sourcing and verifying data points, or (5) Proxy model building - applying public company cost structures to private targets."
license: Proprietary
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Daloopa MCP Financial Analysis Skills

## Overview

This skill integrates Daloopa's structured granular data with Excel modeling capabilities for institutional finance professionals. It bridges LLM reasoning with Daloopa's comprehensive historical KPI database for hedge funds, investment bankers, and private equity professionals.

**Core Value Proposition:**
- **Granularity**: Access exact KPIs (NRR, ARR, ARM) that generic providers miss
- **Auditability**: Every data point links to source PDF with page and coordinates
- **Normalization**: Programmatic alignment of different fiscal years

## Prerequisites

- Daloopa MCP server must be configured and running
- Python 3.8+ with dependencies: openpyxl, pandas, requests
- LibreOffice for formula recalculation (use recalc.py from xlsx skill)

## MCP Tool Definitions

The Daloopa MCP server exposes these core tools that power all financial analysis workflows:

### 1. `daloopa_get_kpi_time_series`

Retrieves clean historical KPI data for a specific ticker.

**Parameters:**
- `ticker` (string, required): Stock ticker symbol (e.g., "DASH", "NFLX")
- `kpi_name` (string, required): Exact KPI name from Daloopa taxonomy
- `start_date` (string, required): ISO date format "YYYY-MM-DD"
- `end_date` (string, required): ISO date format "YYYY-MM-DD"
- `period_type` (string, optional): "quarterly" or "annual" (default: "quarterly")

**Returns:**
```json
{
  "ticker": "DASH",
  "kpi_name": "Total Orders",
  "periods": [
    {
      "period": "Q3 2024",
      "fiscal_end": "2024-09-30",
      "value": 643000000,
      "unit": "orders",
      "data_point_id": "dp_12345"
    }
  ]
}
```

### 2. `daloopa_get_peers`

Returns comparable companies using Daloopa's sector taxonomy.

**Parameters:**
- `ticker` (string, required): Stock ticker symbol
- `peer_type` (string, optional): "direct", "sector", or "all" (default: "direct")

**Returns:**
```json
{
  "ticker": "CRWD",
  "sector": "Cybersecurity",
  "peers": [
    {"ticker": "S", "name": "SentinelOne", "match_score": 0.95},
    {"ticker": "PANW", "name": "Palo Alto Networks", "match_score": 0.88},
    {"ticker": "FTNT", "name": "Fortinet", "match_score": 0.82}
  ]
}
```

### 3. `daloopa_normalize_fiscal_periods`

Aligns different fiscal year-ends to calendar quarters.

**Parameters:**
- `data_array` (array, required): Array of period data from multiple tickers
- `target_calendar` (string, required): "CQ" for calendar quarter or specific month end

**Returns:**
```json
{
  "normalized_periods": [
    {
      "calendar_period": "CQ3 2024",
      "tickers": {
        "CRWD": {"value": 15.2, "original_period": "FQ2 2025"},
        "PANW": {"value": 14.8, "original_period": "FQ1 2025"}
      }
    }
  ]
}
```

### 4. `daloopa_get_source_context`

Returns audit trail with PDF source link and text snippet.

**Parameters:**
- `data_point_id` (string, required): Unique identifier from KPI data

**Returns:**
```json
{
  "data_point_id": "dp_12345",
  "source_type": "10-Q",
  "filing_date": "2024-11-05",
  "page_number": 23,
  "coordinates": {"x": 145, "y": 320, "width": 200, "height": 15},
  "text_snippet": "Total Orders reached 643 million in Q3 2024...",
  "pdf_url": "https://daloopa.com/source/SEC/DASH/10Q-2024Q3#page=23",
  "sec_url": "https://www.sec.gov/Archives/edgar/data/..."
}
```

### 5. `daloopa_screen_kpi`

Screens companies by KPI criteria across a sector.

**Parameters:**
- `sector` (string, required): Daloopa sector name (e.g., "Tier 1 SaaS")
- `kpi_name` (string, required): KPI to screen
- `condition` (object, required): Screening criteria

**Returns:**
```json
{
  "matches": [
    {
      "ticker": "SNOW",
      "company_name": "Snowflake",
      "kpi_values": [{"period": "Q2 2024", "value": 127}, {"period": "Q3 2024", "value": 131}],
      "stock_performance_ytd": -15.3
    }
  ]
}
```

---

## Niche Skill Workflows

### Skill 1: Earnings Sprint Agent (`update_model_variance_analysis`)

**Target Users:** L/S Hedge Funds during earnings season

**Purpose:** Instantly update models with new quarterly actuals and calculate variance against estimates.

**Workflow:**
1. Detect new quarter availability in Daloopa
2. Pull latest actuals for specified KPIs
3. Insert new column in user's Excel model
4. Calculate variance (delta) against previous estimates
5. Highlight significant variances
6. Source all data points for audit trail

**Example Prompt:**
> "Update my DASH (DoorDash) model with the Q3 actuals from Daloopa. Create a new column showing the delta between my projected 'Total Orders' and the actuals."

**Python Implementation:**

```python
import json
from openpyxl import load_workbook
from openpyxl.styles import Font, PatternFill
from openpyxl.comments import Comment

def update_model_variance_analysis(
    model_path: str,
    ticker: str,
    kpis: list[str],
    quarter: str,
    estimate_column: str,
    mcp_client
) -> dict:
    """
    Update Excel model with Daloopa actuals and calculate variance.

    Args:
        model_path: Path to the Excel model file
        ticker: Stock ticker symbol
        kpis: List of KPI names to update
        quarter: Quarter to fetch (e.g., "Q3 2024")
        estimate_column: Column letter containing estimates
        mcp_client: Daloopa MCP client instance

    Returns:
        dict with update summary and variances
    """
    wb = load_workbook(model_path)
    sheet = wb.active

    results = {"ticker": ticker, "quarter": quarter, "updates": []}

    # Find the column for actuals (next to estimates)
    actual_col = chr(ord(estimate_column) + 1)
    variance_col = chr(ord(estimate_column) + 2)

    # Add headers
    header_row = 1
    sheet[f'{actual_col}{header_row}'] = f'{quarter} Actual'
    sheet[f'{variance_col}{header_row}'] = f'{quarter} Variance'

    for kpi in kpis:
        # Fetch actual from Daloopa MCP
        response = mcp_client.call_tool(
            "daloopa_get_kpi_time_series",
            ticker=ticker,
            kpi_name=kpi,
            start_date=get_quarter_start(quarter),
            end_date=get_quarter_end(quarter)
        )

        if not response.get("periods"):
            continue

        actual_data = response["periods"][0]
        actual_value = actual_data["value"]
        data_point_id = actual_data["data_point_id"]

        # Find KPI row in model
        kpi_row = find_kpi_row(sheet, kpi)
        if not kpi_row:
            continue

        # Get estimate value
        estimate_cell = sheet[f'{estimate_column}{kpi_row}']
        estimate_value = estimate_cell.value or 0

        # Insert actual value
        actual_cell = sheet[f'{actual_col}{kpi_row}']
        actual_cell.value = actual_value
        actual_cell.font = Font(color="0000FF")  # Blue for inputs

        # Calculate variance formula
        variance_cell = sheet[f'{variance_col}{kpi_row}']
        variance_cell.value = f'={actual_col}{kpi_row}-{estimate_column}{kpi_row}'
        variance_cell.font = Font(color="000000")  # Black for formulas

        # Get source context and add comment
        source = mcp_client.call_tool(
            "daloopa_get_source_context",
            data_point_id=data_point_id
        )

        comment_text = f"Source: {source['source_type']}, {source['filing_date']}, Page {source['page_number']}\n{source['pdf_url']}"
        actual_cell.comment = Comment(comment_text, "Daloopa MCP")

        # Calculate variance for summary
        variance = actual_value - estimate_value
        variance_pct = (variance / estimate_value * 100) if estimate_value else 0

        # Highlight significant variances (>5%)
        if abs(variance_pct) > 5:
            variance_cell.fill = PatternFill('solid', start_color='FFFF00')

        results["updates"].append({
            "kpi": kpi,
            "estimate": estimate_value,
            "actual": actual_value,
            "variance": variance,
            "variance_pct": round(variance_pct, 2),
            "source_url": source['pdf_url']
        })

    wb.save(model_path)
    return results


def find_kpi_row(sheet, kpi_name: str) -> int:
    """Find row number containing KPI name in column A."""
    for row in range(1, sheet.max_row + 1):
        cell_value = sheet[f'A{row}'].value
        if cell_value and kpi_name.lower() in str(cell_value).lower():
            return row
    return None


def get_quarter_start(quarter: str) -> str:
    """Convert quarter string to start date."""
    q, year = quarter.split()
    quarter_starts = {"Q1": "01-01", "Q2": "04-01", "Q3": "07-01", "Q4": "10-01"}
    return f"{year}-{quarter_starts[q]}"


def get_quarter_end(quarter: str) -> str:
    """Convert quarter string to end date."""
    q, year = quarter.split()
    quarter_ends = {"Q1": "03-31", "Q2": "06-30", "Q3": "09-30", "Q4": "12-31"}
    return f"{year}-{quarter_ends[q]}"
```

---

### Skill 2: Deep Benchmarker (`generate_normalized_kpi_comps`)

**Target Users:** Private Equity & Strategy Consultants

**Purpose:** Build normalized KPI comparison sheets across peers with different fiscal years.

**Workflow:**
1. Accept list of tickers and target KPI
2. Pull 12 quarters of historical data for each
3. Normalize to calendar quarters
4. Generate comparison table with charts
5. Calculate statistical measures (mean, median, percentiles)

**Example Prompt:**
> "Build a sheet comparing 'Sales and Marketing % of Revenue' for CRWD, S, PANW, and FTNT over the last 12 quarters. Normalize to calendar quarters."

**Python Implementation:**

```python
import pandas as pd
from openpyxl import Workbook
from openpyxl.chart import LineChart, Reference
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils.dataframe import dataframe_to_rows

def generate_normalized_kpi_comps(
    output_path: str,
    tickers: list[str],
    kpi_name: str,
    num_quarters: int,
    mcp_client
) -> dict:
    """
    Generate normalized KPI comparison across multiple tickers.

    Args:
        output_path: Path for output Excel file
        tickers: List of ticker symbols to compare
        kpi_name: KPI name to analyze
        num_quarters: Number of historical quarters
        mcp_client: Daloopa MCP client instance

    Returns:
        dict with comparison summary
    """
    from datetime import datetime, timedelta

    # Calculate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=num_quarters * 92)

    # Collect raw data from all tickers
    all_data = []

    for ticker in tickers:
        response = mcp_client.call_tool(
            "daloopa_get_kpi_time_series",
            ticker=ticker,
            kpi_name=kpi_name,
            start_date=start_date.strftime("%Y-%m-%d"),
            end_date=end_date.strftime("%Y-%m-%d")
        )

        for period in response.get("periods", []):
            all_data.append({
                "ticker": ticker,
                "period": period["period"],
                "fiscal_end": period["fiscal_end"],
                "value": period["value"]
            })

    # Normalize fiscal periods to calendar quarters
    normalized = mcp_client.call_tool(
        "daloopa_normalize_fiscal_periods",
        data_array=all_data,
        target_calendar="CQ"
    )

    # Build comparison DataFrame
    periods = []
    for np in normalized["normalized_periods"]:
        row = {"Calendar Quarter": np["calendar_period"]}
        for ticker in tickers:
            if ticker in np["tickers"]:
                row[ticker] = np["tickers"][ticker]["value"]
            else:
                row[ticker] = None
        periods.append(row)

    df = pd.DataFrame(periods)
    df = df.sort_values("Calendar Quarter")

    # Calculate statistics
    stats = {
        "Mean": df[tickers].mean(),
        "Median": df[tickers].median(),
        "Min": df[tickers].min(),
        "Max": df[tickers].max(),
        "Std Dev": df[tickers].std()
    }
    stats_df = pd.DataFrame(stats).T

    # Create Excel workbook
    wb = Workbook()

    # Main comparison sheet
    ws_data = wb.active
    ws_data.title = "KPI Comparison"

    # Add title
    ws_data['A1'] = f"{kpi_name} - Normalized Comparison"
    ws_data['A1'].font = Font(bold=True, size=14)
    ws_data.merge_cells('A1:F1')

    # Add data
    start_row = 3
    for r_idx, row in enumerate(dataframe_to_rows(df, index=False, header=True), start_row):
        for c_idx, value in enumerate(row, 1):
            cell = ws_data.cell(row=r_idx, column=c_idx, value=value)
            if r_idx == start_row:  # Header row
                cell.font = Font(bold=True)
                cell.fill = PatternFill('solid', start_color='D9E1F2')

    # Format numbers as percentages if applicable
    if "%" in kpi_name:
        for row in range(start_row + 1, ws_data.max_row + 1):
            for col in range(2, len(tickers) + 2):
                ws_data.cell(row=row, column=col).number_format = '0.0%'

    # Add statistics section
    stats_start = ws_data.max_row + 3
    ws_data.cell(row=stats_start, column=1, value="Statistics").font = Font(bold=True)

    for r_idx, (stat_name, row) in enumerate(stats_df.iterrows(), stats_start + 1):
        ws_data.cell(row=r_idx, column=1, value=stat_name)
        for c_idx, ticker in enumerate(tickers, 2):
            ws_data.cell(row=r_idx, column=c_idx, value=row[ticker])

    # Create line chart
    chart = LineChart()
    chart.title = f"{kpi_name} Trend"
    chart.style = 10
    chart.y_axis.title = kpi_name
    chart.x_axis.title = "Calendar Quarter"
    chart.height = 10
    chart.width = 15

    # Add data series
    data = Reference(ws_data, min_col=2, max_col=len(tickers)+1,
                     min_row=start_row, max_row=start_row + len(df))
    cats = Reference(ws_data, min_col=1, min_row=start_row+1,
                     max_row=start_row + len(df))
    chart.add_data(data, titles_from_data=True)
    chart.set_categories(cats)

    # Position chart
    chart_position = f"A{ws_data.max_row + 3}"
    ws_data.add_chart(chart, chart_position)

    # Adjust column widths
    ws_data.column_dimensions['A'].width = 18
    for i, ticker in enumerate(tickers, 2):
        ws_data.column_dimensions[chr(64 + i)].width = 12

    wb.save(output_path)

    return {
        "output_file": output_path,
        "kpi": kpi_name,
        "tickers": tickers,
        "quarters_analyzed": len(df),
        "statistics": stats_df.to_dict()
    }
```

---

### Skill 3: Idea Generator / Screener (`screen_operational_divergence`)

**Target Users:** L/S Equity & Event-Driven Funds

**Purpose:** Find companies where operational KPIs diverge from stock performance.

**Workflow:**
1. Define sector and screening criteria
2. Screen all companies for KPI condition
3. Cross-reference with stock performance
4. Rank by divergence magnitude
5. Generate investment thesis summary

**Example Prompt:**
> "Look at all Tier 1 SaaS companies covered by Daloopa. List any companies where 'Net Revenue Retention' (NRR) has increased for 2 consecutive quarters, but the stock is down >10% YTD."

**Python Implementation:**

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.formatting.rule import ColorScaleRule

def screen_operational_divergence(
    output_path: str,
    sector: str,
    kpi_name: str,
    kpi_condition: dict,
    stock_condition: dict,
    mcp_client
) -> dict:
    """
    Screen for divergences between operational KPIs and stock performance.

    Args:
        output_path: Path for output Excel file
        sector: Daloopa sector name
        kpi_name: KPI to screen
        kpi_condition: {"type": "consecutive_increase", "periods": 2}
        stock_condition: {"metric": "ytd_return", "operator": "<", "value": -10}
        mcp_client: Daloopa MCP client instance

    Returns:
        dict with screening results
    """
    # Screen companies by KPI criteria
    screen_results = mcp_client.call_tool(
        "daloopa_screen_kpi",
        sector=sector,
        kpi_name=kpi_name,
        condition=kpi_condition
    )

    # Filter by stock performance
    divergence_matches = []

    for company in screen_results.get("matches", []):
        stock_perf = company["stock_performance_ytd"]

        # Check stock condition
        if evaluate_condition(stock_perf, stock_condition):
            # Calculate divergence score
            kpi_values = company["kpi_values"]
            kpi_change = calculate_kpi_trend(kpi_values)

            divergence_score = abs(kpi_change - stock_perf)

            divergence_matches.append({
                "ticker": company["ticker"],
                "company_name": company["company_name"],
                "kpi_current": kpi_values[-1]["value"] if kpi_values else None,
                "kpi_change_pct": kpi_change,
                "stock_ytd_pct": stock_perf,
                "divergence_score": divergence_score,
                "kpi_history": kpi_values
            })

    # Sort by divergence score
    divergence_matches.sort(key=lambda x: x["divergence_score"], reverse=True)

    # Create Excel output
    wb = Workbook()
    ws = wb.active
    ws.title = "Divergence Screen"

    # Title
    ws['A1'] = f"Operational Divergence Screen: {kpi_name}"
    ws['A1'].font = Font(bold=True, size=14)
    ws.merge_cells('A1:F1')

    ws['A2'] = f"Sector: {sector} | Condition: {kpi_condition['type']} | Stock: YTD < {stock_condition['value']}%"
    ws['A2'].font = Font(italic=True, size=10)
    ws.merge_cells('A2:F2')

    # Headers
    headers = ["Ticker", "Company", f"{kpi_name} (Current)", "KPI Change %", "Stock YTD %", "Divergence Score"]
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=4, column=col, value=header)
        cell.font = Font(bold=True)
        cell.fill = PatternFill('solid', start_color='D9E1F2')
        cell.alignment = Alignment(horizontal='center')

    # Data rows
    for row_idx, match in enumerate(divergence_matches, 5):
        ws.cell(row=row_idx, column=1, value=match["ticker"])
        ws.cell(row=row_idx, column=2, value=match["company_name"])

        kpi_cell = ws.cell(row=row_idx, column=3, value=match["kpi_current"])
        kpi_cell.number_format = '0.0%' if match["kpi_current"] and match["kpi_current"] < 10 else '0.0'

        ws.cell(row=row_idx, column=4, value=match["kpi_change_pct"])
        ws.cell(row=row_idx, column=5, value=match["stock_ytd_pct"])
        ws.cell(row=row_idx, column=6, value=match["divergence_score"])

        # Highlight high divergence
        if match["divergence_score"] > 20:
            ws.cell(row=row_idx, column=6).fill = PatternFill('solid', start_color='90EE90')

    # Format percentage columns
    for row in range(5, len(divergence_matches) + 5):
        ws.cell(row=row, column=4).number_format = '+0.0%;-0.0%'
        ws.cell(row=row, column=5).number_format = '+0.0%;-0.0%'
        ws.cell(row=row, column=6).number_format = '0.0'

    # Column widths
    ws.column_dimensions['A'].width = 10
    ws.column_dimensions['B'].width = 25
    ws.column_dimensions['C'].width = 15
    ws.column_dimensions['D'].width = 15
    ws.column_dimensions['E'].width = 15
    ws.column_dimensions['F'].width = 18

    # Add investment thesis section
    thesis_row = len(divergence_matches) + 7
    ws.cell(row=thesis_row, column=1, value="Investment Thesis").font = Font(bold=True, size=12)

    if divergence_matches:
        top_match = divergence_matches[0]
        thesis_text = (
            f"Top opportunity: {top_match['ticker']} shows {kpi_name} improving "
            f"(+{top_match['kpi_change_pct']:.1f}%) while stock is down {top_match['stock_ytd_pct']:.1f}% YTD. "
            f"This {abs(top_match['divergence_score']):.1f}pt divergence suggests potential mispricing."
        )
        ws.cell(row=thesis_row + 1, column=1, value=thesis_text)
        ws.merge_cells(f'A{thesis_row + 1}:F{thesis_row + 1}')

    wb.save(output_path)

    return {
        "output_file": output_path,
        "total_screened": len(screen_results.get("matches", [])),
        "matches_found": len(divergence_matches),
        "top_opportunities": divergence_matches[:5]
    }


def evaluate_condition(value: float, condition: dict) -> bool:
    """Evaluate a condition against a value."""
    operator = condition.get("operator", "<")
    threshold = condition.get("value", 0)

    if operator == "<":
        return value < threshold
    elif operator == ">":
        return value > threshold
    elif operator == "<=":
        return value <= threshold
    elif operator == ">=":
        return value >= threshold
    return False


def calculate_kpi_trend(kpi_values: list) -> float:
    """Calculate percentage change in KPI over periods."""
    if len(kpi_values) < 2:
        return 0

    first_value = kpi_values[0]["value"]
    last_value = kpi_values[-1]["value"]

    if first_value == 0:
        return 0

    return ((last_value - first_value) / first_value) * 100
```

---

### Skill 4: Audit Trail Validator (`verify_source_links`)

**Target Users:** Junior Bankers & Associates

**Purpose:** Add source verification comments to cells with Daloopa data links.

**Workflow:**
1. User selects cell range with financial data
2. Look up each data point ID in Daloopa
3. Fetch source context (PDF link, page, text snippet)
4. Add Excel comments with full audit trail
5. Generate verification report

**Example Prompt:**
> "Add comments to cells B10:B50 containing the source URL and text snippet for these historical revenue numbers."

**Python Implementation:**

```python
from openpyxl import load_workbook
from openpyxl.comments import Comment
from openpyxl.styles import PatternFill

def verify_source_links(
    model_path: str,
    cell_range: str,
    data_point_mapping: dict,
    mcp_client
) -> dict:
    """
    Add source verification comments to Excel cells.

    Args:
        model_path: Path to Excel file
        cell_range: Range to verify (e.g., "B10:B50")
        data_point_mapping: Dict mapping cells to data_point_ids
        mcp_client: Daloopa MCP client instance

    Returns:
        dict with verification summary
    """
    wb = load_workbook(model_path)
    sheet = wb.active

    results = {
        "verified_cells": [],
        "unverified_cells": [],
        "sources": []
    }

    # Parse range
    start_cell, end_cell = cell_range.split(':')
    col = start_cell[0]
    start_row = int(start_cell[1:])
    end_row = int(end_cell[1:])

    for row in range(start_row, end_row + 1):
        cell_ref = f"{col}{row}"
        cell = sheet[cell_ref]

        # Skip empty cells
        if cell.value is None:
            continue

        # Get data point ID for this cell
        data_point_id = data_point_mapping.get(cell_ref)

        if not data_point_id:
            results["unverified_cells"].append(cell_ref)
            # Mark unverified cells
            cell.fill = PatternFill('solid', start_color='FFE4E1')  # Light red
            continue

        # Fetch source context from Daloopa
        source = mcp_client.call_tool(
            "daloopa_get_source_context",
            data_point_id=data_point_id
        )

        # Build comment text
        comment_text = build_source_comment(source)

        # Add comment to cell
        cell.comment = Comment(comment_text, "Daloopa Audit")
        cell.comment.width = 400
        cell.comment.height = 150

        # Mark as verified
        cell.fill = PatternFill('solid', start_color='E8F5E9')  # Light green

        results["verified_cells"].append(cell_ref)
        results["sources"].append({
            "cell": cell_ref,
            "value": cell.value,
            "source_type": source["source_type"],
            "filing_date": source["filing_date"],
            "page": source["page_number"],
            "url": source["pdf_url"]
        })

    # Add verification summary sheet
    if "Audit Trail" in wb.sheetnames:
        del wb["Audit Trail"]

    ws_audit = wb.create_sheet("Audit Trail")

    # Headers
    headers = ["Cell", "Value", "Source Type", "Filing Date", "Page", "PDF URL"]
    for col_idx, header in enumerate(headers, 1):
        ws_audit.cell(row=1, column=col_idx, value=header).font = \
            Font(bold=True)

    # Data
    for row_idx, source_data in enumerate(results["sources"], 2):
        ws_audit.cell(row=row_idx, column=1, value=source_data["cell"])
        ws_audit.cell(row=row_idx, column=2, value=source_data["value"])
        ws_audit.cell(row=row_idx, column=3, value=source_data["source_type"])
        ws_audit.cell(row=row_idx, column=4, value=source_data["filing_date"])
        ws_audit.cell(row=row_idx, column=5, value=source_data["page"])
        ws_audit.cell(row=row_idx, column=6, value=source_data["url"])

    # Adjust column widths
    ws_audit.column_dimensions['A'].width = 8
    ws_audit.column_dimensions['B'].width = 15
    ws_audit.column_dimensions['C'].width = 12
    ws_audit.column_dimensions['D'].width = 12
    ws_audit.column_dimensions['E'].width = 8
    ws_audit.column_dimensions['F'].width = 50

    wb.save(model_path)

    return {
        "total_cells": end_row - start_row + 1,
        "verified": len(results["verified_cells"]),
        "unverified": len(results["unverified_cells"]),
        "audit_sheet_created": True,
        "sources": results["sources"]
    }


def build_source_comment(source: dict) -> str:
    """Build formatted comment text from source context."""
    lines = [
        f"Source: {source['source_type']}",
        f"Filed: {source['filing_date']}",
        f"Page: {source['page_number']}",
        "",
        f"Snippet: \"{source['text_snippet'][:200]}...\"" if len(source.get('text_snippet', '')) > 200 else f"Snippet: \"{source.get('text_snippet', '')}\"",
        "",
        f"SEC: {source.get('sec_url', 'N/A')}",
        f"Daloopa: {source['pdf_url']}"
    ]
    return "\n".join(lines)


# Convenience function for automatic data point ID detection
def auto_verify_daloopa_cells(
    model_path: str,
    sheet_name: str,
    mcp_client
) -> dict:
    """
    Automatically find and verify all Daloopa-sourced cells in a sheet.

    Looks for cells with Daloopa metadata stored in custom properties
    or a hidden mapping sheet.
    """
    wb = load_workbook(model_path)

    # Check for mapping sheet
    if "_daloopa_mapping" in wb.sheetnames:
        mapping_sheet = wb["_daloopa_mapping"]
        data_point_mapping = {}

        for row in range(2, mapping_sheet.max_row + 1):
            cell_ref = mapping_sheet.cell(row=row, column=1).value
            dp_id = mapping_sheet.cell(row=row, column=2).value
            if cell_ref and dp_id:
                data_point_mapping[cell_ref] = dp_id

        # Find range from mapping
        if data_point_mapping:
            cells = list(data_point_mapping.keys())
            cols = set(c[0] for c in cells)
            rows = [int(c[1:]) for c in cells]

            for col in cols:
                col_cells = [c for c in cells if c[0] == col]
                col_rows = sorted([int(c[1:]) for c in col_cells])
                cell_range = f"{col}{col_rows[0]}:{col}{col_rows[-1]}"

                return verify_source_links(
                    model_path, cell_range, data_point_mapping, mcp_client
                )

    return {"error": "No Daloopa mapping found in workbook"}
```

---

### Skill 5: Proxy Model Builder (`build_proxy_cost_structure`)

**Target Users:** Private Equity / Corporate Dev

**Purpose:** Apply public company cost structures to private company revenue for pro-forma P&L.

**Workflow:**
1. User provides private company revenue and proxy ticker
2. Fetch historical cost structure from proxy company
3. Optionally adjust for company size/stage
4. Generate pro-forma P&L with formulas
5. Include sensitivity analysis

**Example Prompt:**
> "I am looking at a private e-commerce makeup brand with $50M revenue. Build a projected P&L for them using 'ELF Beauty' (ELF) historical margins from 2019 (when they were smaller) as a proxy."

**Python Implementation:**

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def build_proxy_cost_structure(
    output_path: str,
    private_revenue: float,
    proxy_ticker: str,
    proxy_year: str,
    revenue_unit: str,
    mcp_client
) -> dict:
    """
    Build pro-forma P&L using public company cost structure as proxy.

    Args:
        output_path: Path for output Excel file
        private_revenue: Private company revenue (in specified unit)
        proxy_ticker: Public company ticker to use as proxy
        proxy_year: Historical year for proxy margins
        revenue_unit: "millions" or "thousands"
        mcp_client: Daloopa MCP client instance

    Returns:
        dict with P&L summary
    """
    # Define P&L line items to fetch
    cost_structure_kpis = [
        ("Revenue", "Revenue"),
        ("COGS", "Cost of Goods Sold"),
        ("Gross Profit", "Gross Profit"),
        ("R&D", "Research and Development"),
        ("S&M", "Sales and Marketing"),
        ("G&A", "General and Administrative"),
        ("Operating Income", "Operating Income"),
        ("Net Income", "Net Income")
    ]

    # Fetch proxy company historical data
    year_start = f"{proxy_year}-01-01"
    year_end = f"{proxy_year}-12-31"

    proxy_data = {}

    for kpi_short, kpi_name in cost_structure_kpis:
        response = mcp_client.call_tool(
            "daloopa_get_kpi_time_series",
            ticker=proxy_ticker,
            kpi_name=kpi_name,
            start_date=year_start,
            end_date=year_end,
            period_type="annual"
        )

        if response.get("periods"):
            proxy_data[kpi_short] = response["periods"][0]["value"]

    # Calculate margins (as % of revenue)
    proxy_revenue = proxy_data.get("Revenue", 1)
    margins = {}

    for kpi_short, _ in cost_structure_kpis:
        if kpi_short in proxy_data and kpi_short != "Revenue":
            margins[kpi_short] = proxy_data[kpi_short] / proxy_revenue

    # Create Excel workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "Pro-Forma P&L"

    # Styling
    header_font = Font(bold=True, size=12)
    input_font = Font(color="0000FF")  # Blue for inputs
    formula_font = Font(color="000000")  # Black for formulas
    thin_border = Border(
        bottom=Side(style='thin')
    )

    # Title
    ws['A1'] = f"Pro-Forma P&L - Private Company Analysis"
    ws['A1'].font = Font(bold=True, size=14)
    ws.merge_cells('A1:E1')

    ws['A2'] = f"Proxy: {proxy_ticker} ({proxy_year} margins)"
    ws['A2'].font = Font(italic=True)

    # Input section
    ws['A4'] = "Assumptions"
    ws['A4'].font = header_font

    ws['A5'] = "Private Company Revenue"
    ws['B5'] = private_revenue
    ws['B5'].font = input_font
    ws['B5'].number_format = '$#,##0'
    ws['C5'] = f"${revenue_unit[0].upper()}"

    ws['A6'] = f"Proxy Company ({proxy_ticker})"
    ws['B6'] = proxy_revenue
    ws['B6'].number_format = '$#,##0'
    ws['C6'] = f"${revenue_unit[0].upper()}"

    # P&L Statement
    ws['A8'] = "Pro-Forma Income Statement"
    ws['A8'].font = header_font

    # Headers
    headers = ["Line Item", "Amount", "% of Rev", f"{proxy_ticker} %", "Variance"]
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=9, column=col, value=header)
        cell.font = Font(bold=True)
        cell.fill = PatternFill('solid', start_color='D9E1F2')
        cell.alignment = Alignment(horizontal='center')

    # P&L line items with formulas
    row = 10

    # Revenue
    ws.cell(row=row, column=1, value="Revenue")
    ws.cell(row=row, column=2, value=f"=B5")
    ws.cell(row=row, column=2).font = formula_font
    ws.cell(row=row, column=2).number_format = '$#,##0'
    ws.cell(row=row, column=3, value="=B10/B10")
    ws.cell(row=row, column=3).number_format = '0.0%'
    ws.cell(row=row, column=4, value=1.0)
    ws.cell(row=row, column=4).number_format = '0.0%'
    ws.cell(row=row, column=5, value="=C10-D10")
    ws.cell(row=row, column=5).number_format = '+0.0%;-0.0%'
    row += 1

    # COGS
    cogs_margin = margins.get("COGS", 0.4)
    ws.cell(row=row, column=1, value="Cost of Goods Sold")
    ws.cell(row=row, column=2, value=f"=B$5*D{row}")
    ws.cell(row=row, column=2).font = formula_font
    ws.cell(row=row, column=2).number_format = '($#,##0)'
    ws.cell(row=row, column=3, value=f"=B{row}/B$10")
    ws.cell(row=row, column=3).number_format = '0.0%'
    ws.cell(row=row, column=4, value=cogs_margin)
    ws.cell(row=row, column=4).font = input_font
    ws.cell(row=row, column=4).number_format = '0.0%'
    ws.cell(row=row, column=5, value=f"=C{row}-D{row}")
    ws.cell(row=row, column=5).number_format = '+0.0%;-0.0%'
    row += 1

    # Gross Profit
    ws.cell(row=row, column=1, value="Gross Profit")
    ws.cell(row=row, column=1).font = Font(bold=True)
    ws.cell(row=row, column=2, value=f"=B10-B11")
    ws.cell(row=row, column=2).font = formula_font
    ws.cell(row=row, column=2).number_format = '$#,##0'
    ws.cell(row=row, column=3, value=f"=B{row}/B$10")
    ws.cell(row=row, column=3).number_format = '0.0%'
    gp_margin = margins.get("Gross Profit", 0.6)
    ws.cell(row=row, column=4, value=gp_margin)
    ws.cell(row=row, column=4).number_format = '0.0%'
    ws.cell(row=row, column=5, value=f"=C{row}-D{row}")
    ws.cell(row=row, column=5).number_format = '+0.0%;-0.0%'
    for col in range(1, 6):
        ws.cell(row=row, column=col).border = thin_border
    row += 1

    # Operating expenses
    opex_items = [
        ("Research & Development", "R&D"),
        ("Sales & Marketing", "S&M"),
        ("General & Administrative", "G&A")
    ]

    opex_rows = []
    for item_name, margin_key in opex_items:
        margin_val = margins.get(margin_key, 0.1)
        ws.cell(row=row, column=1, value=item_name)
        ws.cell(row=row, column=2, value=f"=B$5*D{row}")
        ws.cell(row=row, column=2).font = formula_font
        ws.cell(row=row, column=2).number_format = '($#,##0)'
        ws.cell(row=row, column=3, value=f"=B{row}/B$10")
        ws.cell(row=row, column=3).number_format = '0.0%'
        ws.cell(row=row, column=4, value=margin_val)
        ws.cell(row=row, column=4).font = input_font
        ws.cell(row=row, column=4).number_format = '0.0%'
        ws.cell(row=row, column=5, value=f"=C{row}-D{row}")
        ws.cell(row=row, column=5).number_format = '+0.0%;-0.0%'
        opex_rows.append(row)
        row += 1

    # Total Operating Expenses
    ws.cell(row=row, column=1, value="Total Operating Expenses")
    opex_sum = "+".join([f"B{r}" for r in opex_rows])
    ws.cell(row=row, column=2, value=f"={opex_sum}")
    ws.cell(row=row, column=2).font = formula_font
    ws.cell(row=row, column=2).number_format = '($#,##0)'
    ws.cell(row=row, column=3, value=f"=B{row}/B$10")
    ws.cell(row=row, column=3).number_format = '0.0%'
    for col in range(1, 6):
        ws.cell(row=row, column=col).border = thin_border
    row += 1

    # Operating Income
    ws.cell(row=row, column=1, value="Operating Income")
    ws.cell(row=row, column=1).font = Font(bold=True)
    ws.cell(row=row, column=2, value=f"=B12-B{row-1}")
    ws.cell(row=row, column=2).font = formula_font
    ws.cell(row=row, column=2).number_format = '$#,##0;($#,##0)'
    ws.cell(row=row, column=3, value=f"=B{row}/B$10")
    ws.cell(row=row, column=3).number_format = '0.0%'
    op_margin = margins.get("Operating Income", 0.1)
    ws.cell(row=row, column=4, value=op_margin)
    ws.cell(row=row, column=4).number_format = '0.0%'
    ws.cell(row=row, column=5, value=f"=C{row}-D{row}")
    ws.cell(row=row, column=5).number_format = '+0.0%;-0.0%'
    ws.cell(row=row, column=2).fill = PatternFill('solid', start_color='E8F5E9')

    # Column widths
    ws.column_dimensions['A'].width = 28
    ws.column_dimensions['B'].width = 15
    ws.column_dimensions['C'].width = 12
    ws.column_dimensions['D'].width = 12
    ws.column_dimensions['E'].width = 12

    # Add sensitivity analysis sheet
    ws_sens = wb.create_sheet("Sensitivity Analysis")
    create_sensitivity_table(ws_sens, private_revenue, margins)

    # Add source notes
    notes_row = row + 3
    ws.cell(row=notes_row, column=1, value="Source Notes").font = Font(bold=True)
    ws.cell(row=notes_row + 1, column=1,
            value=f"Proxy margins from {proxy_ticker} {proxy_year} annual report via Daloopa MCP")
    ws.cell(row=notes_row + 2, column=1,
            value="Blue values are adjustable inputs; black values are formulas")

    wb.save(output_path)

    return {
        "output_file": output_path,
        "proxy_ticker": proxy_ticker,
        "proxy_year": proxy_year,
        "private_revenue": private_revenue,
        "margins_applied": margins,
        "sheets_created": ["Pro-Forma P&L", "Sensitivity Analysis"]
    }


def create_sensitivity_table(ws, base_revenue: float, margins: dict):
    """Create a sensitivity analysis table."""
    ws['A1'] = "Operating Income Sensitivity"
    ws['A1'].font = Font(bold=True, size=12)

    ws['A3'] = "Revenue Growth"
    ws['B2'] = "Gross Margin Change"

    # Revenue scenarios
    revenue_changes = [-20, -10, 0, 10, 20]
    margin_changes = [-5, -2.5, 0, 2.5, 5]

    # Headers
    for col, mc in enumerate(margin_changes, 3):
        ws.cell(row=2, column=col, value=f"{mc:+.1f}%")
        ws.cell(row=2, column=col).alignment = Alignment(horizontal='center')

    for row, rc in enumerate(revenue_changes, 3):
        ws.cell(row=row, column=2, value=f"{rc:+d}%")
        ws.cell(row=row, column=2).alignment = Alignment(horizontal='center')

        for col, mc in enumerate(margin_changes, 3):
            # Formula for operating income based on changes
            adj_rev = base_revenue * (1 + rc/100)
            adj_gm = margins.get("Gross Profit", 0.6) + mc/100
            adj_opex = margins.get("R&D", 0.1) + margins.get("S&M", 0.15) + margins.get("G&A", 0.08)
            op_income = adj_rev * (adj_gm - adj_opex)

            cell = ws.cell(row=row, column=col, value=op_income)
            cell.number_format = '$#,##0'

            # Color code
            if op_income > 0:
                cell.fill = PatternFill('solid', start_color='C6EFCE')
            else:
                cell.fill = PatternFill('solid', start_color='FFC7CE')
```

---

## Best Practices

### 1. Data Quality
- Always verify data point IDs exist before calling `get_source_context`
- Handle missing KPIs gracefully with fallback values
- Validate fiscal period formats before normalization

### 2. Excel Model Integrity
- Use formulas for all calculations, never hardcode computed values
- Maintain audit trail with cell comments linking to sources
- Color-code inputs (blue) vs formulas (black) per industry standards

### 3. Performance
- Batch multiple KPI requests when possible
- Cache normalized period mappings for repeated use
- Use pandas for bulk data operations, openpyxl for formatting

### 4. User Communication
- Always display source URLs for transparency
- Highlight significant variances (>5%) for attention
- Generate summary statistics with data tables

### 5. Error Handling
```python
def safe_mcp_call(mcp_client, tool_name: str, **kwargs):
    """Wrapper for MCP calls with error handling."""
    try:
        response = mcp_client.call_tool(tool_name, **kwargs)
        if "error" in response:
            return {"error": response["error"], "data": None}
        return {"error": None, "data": response}
    except Exception as e:
        return {"error": str(e), "data": None}
```

## Integration with xlsx Skill

These Daloopa MCP skills work alongside the base xlsx skill. After running any skill:

1. **Recalculate formulas**: Use the recalc.py script from xlsx skill
   ```bash
   python /path/to/.claude/skills/xlsx/recalc.py output.xlsx
   ```

2. **Verify no errors**: Check the JSON output for any formula errors

3. **Apply formatting**: Use xlsx skill guidelines for financial model standards
