#!/usr/bin/env python3
"""
Idea Generation Workflow Example

This example demonstrates how to use the Daloopa MCP skills for
generating investment ideas by screening for KPI divergences.

Target Users: L/S Equity & Event-Driven Fund Analysts
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from daloopa_client import DaloopaMCPClient
from divergence_screener import screen_operational_divergence
from deep_benchmarker import generate_normalized_kpi_comps


def screen_nrr_divergence():
    """
    Example: Find SaaS companies with improving NRR but poor stock performance.

    Prompt: "Look at all Tier 1 SaaS companies. List any where NRR has
            increased for 2 consecutive quarters but stock is down >10% YTD."
    """
    print("=" * 60)
    print("DIVERGENCE SCREENER: NRR vs Stock Performance")
    print("=" * 60)

    client = DaloopaMCPClient()

    result = screen_operational_divergence(
        output_path="output/nrr_divergence_screen.xlsx",
        sector="Tier 1 SaaS",
        kpi_name="Net Revenue Retention",
        kpi_condition={
            "type": "consecutive_increase",
            "periods": 2
        },
        stock_condition={
            "metric": "ytd_return",
            "operator": "<",
            "value": -10
        },
        mcp_client=client
    )

    print(f"\nScreened {result['total_screened']} companies in {result['sector']}")
    print(f"Found {result['matches_found']} divergence opportunities")

    if result['top_opportunities']:
        print("\nTop 5 Opportunities:")
        print("-" * 50)
        for i, opp in enumerate(result['top_opportunities'], 1):
            print(f"\n{i}. {opp['ticker']} - {opp['company_name']}")
            print(f"   NRR Current: {opp['kpi_current']:.1%}")
            print(f"   KPI Change: {opp['kpi_change_pct']:+.1f}%")
            print(f"   Stock YTD: {opp['stock_ytd_pct']:+.1f}%")
            print(f"   Divergence Score: {opp['divergence_score']:.1f}")

    return result


def screen_margin_expansion():
    """
    Example: Find companies with expanding gross margins.

    Prompt: "Screen for cybersecurity companies where gross margin has
            expanded by 2%+ but stock is underperforming the sector."
    """
    print("=" * 60)
    print("DIVERGENCE SCREENER: Gross Margin Expansion")
    print("=" * 60)

    client = DaloopaMCPClient()

    result = screen_operational_divergence(
        output_path="output/margin_expansion_screen.xlsx",
        sector="Cybersecurity",
        kpi_name="Gross Margin",
        kpi_condition={
            "type": "absolute_increase",
            "min_change": 2.0  # 2 percentage points
        },
        stock_condition={
            "metric": "ytd_return",
            "operator": "<",
            "value": 0
        },
        mcp_client=client
    )

    print(f"\nFound {result['matches_found']} margin expansion opportunities")

    if result['top_opportunities']:
        top = result['top_opportunities'][0]
        print(f"\nTop pick: {top['ticker']}")
        print(f"  Gross Margin: {top['kpi_current']:.1%}")
        print(f"  Improvement: {top['kpi_change_pct']:+.1f}%")
        print(f"  Stock YTD: {top['stock_ytd_pct']:+.1f}%")

    return result


def screen_accelerating_growth():
    """
    Example: Find companies with accelerating revenue growth.

    Prompt: "Find fintech companies where revenue growth rate has
            accelerated for 3 quarters but P/S multiple has contracted."
    """
    print("=" * 60)
    print("DIVERGENCE SCREENER: Accelerating Growth")
    print("=" * 60)

    client = DaloopaMCPClient()

    result = screen_operational_divergence(
        output_path="output/growth_acceleration_screen.xlsx",
        sector="Fintech",
        kpi_name="Revenue Growth YoY",
        kpi_condition={
            "type": "consecutive_increase",
            "periods": 3
        },
        stock_condition={
            "metric": "ytd_return",
            "operator": "<",
            "value": -15
        },
        mcp_client=client
    )

    print(f"\nFound {result['matches_found']} accelerating growth opportunities")

    return result


def deep_dive_opportunity():
    """
    Example: After screening, deep dive into top opportunity.

    Prompt: "The screen found SNOW as a top pick. Show me SNOW's NRR
            trend compared to peers over the last 2 years."
    """
    print("=" * 60)
    print("DEEP DIVE: Peer Comparison for Top Pick")
    print("=" * 60)

    client = DaloopaMCPClient()

    # First, run the screen to find top opportunity
    screen_result = screen_operational_divergence(
        output_path="output/temp_screen.xlsx",
        sector="Tier 1 SaaS",
        kpi_name="Net Revenue Retention",
        kpi_condition={"type": "consecutive_increase", "periods": 2},
        stock_condition={"metric": "ytd_return", "operator": "<", "value": -10},
        mcp_client=client
    )

    if not screen_result['top_opportunities']:
        print("No opportunities found to deep dive")
        return None

    top_ticker = screen_result['top_opportunities'][0]['ticker']
    print(f"\nDeep diving into top pick: {top_ticker}")

    # Get peers for comparison
    peers_response = client.get_peers(top_ticker, peer_type="direct")
    peer_tickers = [p['ticker'] for p in peers_response.get('peers', [])][:3]

    # Compare NRR with peers
    comparison = generate_normalized_kpi_comps(
        output_path=f"output/{top_ticker}_nrr_peer_comparison.xlsx",
        tickers=[top_ticker] + peer_tickers,
        kpi_name="Net Revenue Retention",
        num_quarters=8,
        mcp_client=client
    )

    print(f"\nGenerated peer comparison: {comparison['output_file']}")
    print(f"Compared {top_ticker} against: {', '.join(peer_tickers)}")

    return comparison


def full_idea_generation_workflow():
    """
    Example: Complete idea generation workflow from screen to thesis.

    This workflow:
    1. Screens for fundamental divergences
    2. Ranks opportunities by divergence score
    3. Deep dives into top picks with peer comparisons
    4. Generates investment thesis summary
    """
    print("=" * 60)
    print("FULL IDEA GENERATION WORKFLOW")
    print("=" * 60)

    client = DaloopaMCPClient()

    # Step 1: Run multiple screens
    print("\nStep 1: Running divergence screens...")

    screens = [
        {
            "name": "NRR Leaders",
            "sector": "Tier 1 SaaS",
            "kpi": "Net Revenue Retention",
            "kpi_condition": {"type": "consecutive_increase", "periods": 2},
            "stock_condition": {"operator": "<", "value": -10}
        },
        {
            "name": "Margin Expanders",
            "sector": "Tier 1 SaaS",
            "kpi": "Gross Margin",
            "kpi_condition": {"type": "absolute_increase", "min_change": 1.5},
            "stock_condition": {"operator": "<", "value": -5}
        },
        {
            "name": "FCF Improvers",
            "sector": "Tier 1 SaaS",
            "kpi": "Free Cash Flow Margin",
            "kpi_condition": {"type": "consecutive_increase", "periods": 2},
            "stock_condition": {"operator": "<", "value": -10}
        }
    ]

    all_opportunities = []

    for i, screen_config in enumerate(screens, 1):
        print(f"\n  Screen {i}: {screen_config['name']}")

        result = screen_operational_divergence(
            output_path=f"output/screen_{i}_{screen_config['name'].lower().replace(' ', '_')}.xlsx",
            sector=screen_config['sector'],
            kpi_name=screen_config['kpi'],
            kpi_condition=screen_config['kpi_condition'],
            stock_condition=screen_config['stock_condition'],
            mcp_client=client
        )

        print(f"    Found {result['matches_found']} matches")

        # Add screen name to opportunities
        for opp in result['top_opportunities']:
            opp['screen'] = screen_config['name']
            all_opportunities.append(opp)

    # Step 2: Rank all opportunities
    print("\n\nStep 2: Ranking all opportunities...")

    # De-duplicate and rank by divergence score
    seen_tickers = set()
    unique_opportunities = []
    for opp in sorted(all_opportunities, key=lambda x: x['divergence_score'], reverse=True):
        if opp['ticker'] not in seen_tickers:
            unique_opportunities.append(opp)
            seen_tickers.add(opp['ticker'])

    print(f"  {len(unique_opportunities)} unique opportunities across all screens")

    # Step 3: Generate summary
    print("\n" + "=" * 60)
    print("INVESTMENT IDEAS SUMMARY")
    print("=" * 60)

    if unique_opportunities:
        print("\nTop 10 Divergence Opportunities:")
        print("-" * 60)

        for i, opp in enumerate(unique_opportunities[:10], 1):
            print(f"\n{i}. {opp['ticker']} ({opp['company_name']})")
            print(f"   Screen: {opp['screen']}")
            print(f"   KPI Improvement: {opp['kpi_change_pct']:+.1f}%")
            print(f"   Stock YTD: {opp['stock_ytd_pct']:+.1f}%")
            print(f"   Divergence: {opp['divergence_score']:.1f}")

        # Investment thesis for top pick
        top = unique_opportunities[0]
        print("\n" + "=" * 60)
        print(f"INVESTMENT THESIS: {top['ticker']}")
        print("=" * 60)
        print(f"""
{top['ticker']} represents a compelling long opportunity based on
fundamental/price divergence:

THESIS: Strong operational improvements are not reflected in stock price

KEY POINTS:
1. Operational Improvement: {top['kpi_change_pct']:+.1f}% KPI improvement
2. Stock Underperformance: {top['stock_ytd_pct']:.1f}% YTD (vs market)
3. Divergence Score: {top['divergence_score']:.1f} (top decile)

CATALYSTS TO WATCH:
- Next earnings report (verify KPI trend continues)
- Guidance revisions
- Sell-side estimate revisions

RISKS:
- KPI improvement may be one-time
- Macro headwinds affecting entire sector
- Execution risk on growth initiatives

NEXT STEPS:
- Deep dive into {top['ticker']} vs peers
- Review management commentary on KPI drivers
- Build full valuation model with updated assumptions
""")

    return {
        "total_opportunities": len(unique_opportunities),
        "top_picks": unique_opportunities[:5]
    }


if __name__ == "__main__":
    import os

    # Create output directory
    os.makedirs("output", exist_ok=True)

    print("\n" + "=" * 60)
    print("DALOOPA MCP IDEA GENERATION WORKFLOW EXAMPLES")
    print("=" * 60 + "\n")

    # Run examples
    screen_nrr_divergence()
    print("\n" + "-" * 60 + "\n")

    screen_margin_expansion()
    print("\n" + "-" * 60 + "\n")

    deep_dive_opportunity()
    print("\n" + "-" * 60 + "\n")

    # Full workflow
    full_idea_generation_workflow()

    print("\n" + "=" * 60)
    print("Examples completed. Check 'output/' directory for Excel files.")
    print("=" * 60 + "\n")
