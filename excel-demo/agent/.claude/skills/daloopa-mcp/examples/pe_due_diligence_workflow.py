#!/usr/bin/env python3
"""
PE Due Diligence Workflow Example

This example demonstrates how to use the Daloopa MCP skills for
private equity due diligence on private company targets.

Target Users: Private Equity Associates & Corporate Development
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from daloopa_client import DaloopaMCPClient
from deep_benchmarker import generate_normalized_kpi_comps, auto_discover_peers
from proxy_model import build_proxy_cost_structure


def benchmark_target_against_peers():
    """
    Example: Benchmark a private target against public peers.

    Prompt: "I'm looking at a private cybersecurity company. Compare the
            operating margins of the top 4 public cybersecurity companies
            over the last 3 years."
    """
    print("=" * 60)
    print("DEEP BENCHMARKER: Peer Operating Margins")
    print("=" * 60)

    client = DaloopaMCPClient()

    result = generate_normalized_kpi_comps(
        output_path="output/cybersecurity_margin_comps.xlsx",
        tickers=["CRWD", "S", "PANW", "FTNT"],
        kpi_name="Operating Margin",
        num_quarters=12,
        mcp_client=client
    )

    print(f"\nGenerated comparison: {result['output_file']}")
    print(f"Tickers: {', '.join(result['tickers'])}")
    print(f"Quarters analyzed: {result['quarters_analyzed']}")

    print("\nKey Statistics:")
    print("-" * 40)
    stats = result['statistics']
    for stat_name, values in stats.items():
        print(f"  {stat_name}:")
        for ticker, value in values.items():
            print(f"    {ticker}: {value:.1%}")

    return result


def compare_sales_efficiency():
    """
    Example: Compare sales & marketing efficiency across SaaS peers.

    Prompt: "Build a sheet comparing Sales & Marketing % of Revenue for
            CRWD, S, PANW, and FTNT. Normalize to calendar quarters."
    """
    print("=" * 60)
    print("DEEP BENCHMARKER: S&M Efficiency Comparison")
    print("=" * 60)

    client = DaloopaMCPClient()

    result = generate_normalized_kpi_comps(
        output_path="output/sm_efficiency_comps.xlsx",
        tickers=["CRWD", "S", "PANW", "FTNT"],
        kpi_name="Sales and Marketing % of Revenue",
        num_quarters=12,
        mcp_client=client
    )

    print(f"\nGenerated comparison: {result['output_file']}")
    print("Includes:")
    print("  - Time series data (normalized to calendar quarters)")
    print("  - Statistical summary (mean, median, min, max, std)")
    print("  - Line chart visualization")
    print("  - Peer rankings by most recent quarter")

    return result


def build_private_company_proxy():
    """
    Example: Build a pro-forma P&L for a private target using a public proxy.

    Prompt: "I am looking at a private e-commerce makeup brand with $50M
            revenue. Build a projected P&L using ELF Beauty's 2019 margins
            (when they were smaller) as a proxy."
    """
    print("=" * 60)
    print("PROXY MODEL: Private Company P&L")
    print("=" * 60)

    client = DaloopaMCPClient()

    result = build_proxy_cost_structure(
        output_path="output/private_makeup_proforma.xlsx",
        private_revenue=50,  # $50M
        proxy_ticker="ELF",
        proxy_year="2019",
        revenue_unit="millions",
        mcp_client=client
    )

    print(f"\nGenerated pro-forma P&L: {result['output_file']}")
    print(f"Proxy: {result['proxy_ticker']} ({result['proxy_year']})")
    print(f"Target Revenue: ${result['private_revenue']}M")

    print("\nMargins Applied:")
    print("-" * 40)
    for kpi, margin in result['margins_applied'].items():
        print(f"  {kpi}: {margin:.1%}")

    print(f"\nSheets created: {', '.join(result['sheets_created'])}")
    print("\nFeatures:")
    print("  - Editable assumptions (blue cells)")
    print("  - All calculations via Excel formulas")
    print("  - Sensitivity analysis table")
    print("  - Proxy margin documentation")

    return result


def full_due_diligence_workflow():
    """
    Example: Complete DD workflow - benchmark peers then build proxy model.

    Prompt: "I need to evaluate a private SaaS company with $30M ARR.
            Show me the unit economics of comparable public SaaS companies
            and build a proxy P&L using Datadog's early-stage margins."
    """
    print("=" * 60)
    print("FULL DUE DILIGENCE WORKFLOW")
    print("=" * 60)

    client = DaloopaMCPClient()

    # Step 1: Auto-discover peers for a target
    print("\nStep 1: Discovering comparable peers...")
    peer_result = auto_discover_peers(
        ticker="DDOG",  # Using Datadog as reference
        kpi_name="Gross Margin",
        num_quarters=8,
        output_path="output/saas_peer_gross_margin.xlsx",
        mcp_client=client
    )
    print(f"  Found {len(peer_result['tickers'])} comparable companies")

    # Step 2: Benchmark unit economics
    print("\nStep 2: Benchmarking Net Revenue Retention...")
    benchmark_result = generate_normalized_kpi_comps(
        output_path="output/saas_nrr_benchmark.xlsx",
        tickers=peer_result['tickers'][:5],
        kpi_name="Net Revenue Retention",
        num_quarters=8,
        mcp_client=client
    )
    print(f"  Analyzed {benchmark_result['quarters_analyzed']} quarters")

    # Step 3: Build proxy model
    print("\nStep 3: Building proxy P&L for private target...")
    proxy_result = build_proxy_cost_structure(
        output_path="output/private_saas_proforma.xlsx",
        private_revenue=30,  # $30M ARR
        proxy_ticker="DDOG",
        proxy_year="2019",  # Early-stage Datadog
        revenue_unit="millions",
        mcp_client=client
    )
    print(f"  Created pro-forma with {len(proxy_result['margins_applied'])} margin assumptions")

    # Summary
    print("\n" + "=" * 60)
    print("DUE DILIGENCE OUTPUTS")
    print("=" * 60)
    print("\nGenerated files:")
    print(f"  1. Peer gross margin comparison: {peer_result['output_file']}")
    print(f"  2. NRR benchmark analysis: {benchmark_result['output_file']}")
    print(f"  3. Private company pro-forma: {proxy_result['output_file']}")
    print("\nNext steps:")
    print("  - Review peer rankings to identify best-in-class metrics")
    print("  - Adjust proxy margins based on target's specific situation")
    print("  - Run sensitivity analysis for different growth scenarios")

    return {
        "peers": peer_result,
        "benchmark": benchmark_result,
        "proxy": proxy_result
    }


if __name__ == "__main__":
    import os

    # Create output directory
    os.makedirs("output", exist_ok=True)

    print("\n" + "=" * 60)
    print("DALOOPA MCP PE DUE DILIGENCE WORKFLOW EXAMPLES")
    print("=" * 60 + "\n")

    # Run individual examples
    benchmark_target_against_peers()
    print("\n" + "-" * 60 + "\n")

    compare_sales_efficiency()
    print("\n" + "-" * 60 + "\n")

    build_private_company_proxy()
    print("\n" + "-" * 60 + "\n")

    # Run full workflow
    full_due_diligence_workflow()

    print("\n" + "=" * 60)
    print("Examples completed. Check 'output/' directory for Excel files.")
    print("=" * 60 + "\n")
