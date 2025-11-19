#!/usr/bin/env python3
"""
Earnings Season Workflow Example

This example demonstrates how to use the Daloopa MCP skills during
earnings season to quickly update multiple models with new actuals.

Target Users: L/S Hedge Fund Analysts
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from daloopa_client import DaloopaMCPClient
from earnings_sprint import update_model_variance_analysis, batch_update_models
from audit_trail import verify_source_links, create_mapping_from_kpi_response


def single_model_update():
    """
    Example: Update a single model with Q3 2024 actuals for DoorDash.

    Prompt: "Update my DASH model with Q3 actuals from Daloopa. Show me
            the variance against my projections."
    """
    print("=" * 60)
    print("EARNINGS SPRINT: Single Model Update")
    print("=" * 60)

    # Initialize client (in production, this connects to live MCP)
    client = DaloopaMCPClient()

    # Define the update parameters
    result = update_model_variance_analysis(
        model_path="models/DASH_model.xlsx",
        ticker="DASH",
        kpis=[
            "Total Orders",
            "Marketplace GOV",
            "Revenue",
            "Adjusted EBITDA",
            "Average Order Value"
        ],
        quarter="Q3 2024",
        estimate_column="E",  # Column E contains Q3 estimates
        mcp_client=client
    )

    # Print results
    print(f"\nUpdated {result['summary']['total_updated']} KPIs for {result['ticker']}")
    print(f"Average variance: {result['summary']['avg_variance_pct']:.1f}%")
    print(f"Significant variances (>5%): {result['summary']['significant_variances']}")

    print("\nVariance Details:")
    print("-" * 50)
    for update in result['updates']:
        if 'error' in update:
            print(f"  {update['kpi']}: {update['error']}")
            continue

        indicator = "!" if abs(update['variance_pct']) > 5 else " "
        print(f"{indicator} {update['kpi']}")
        print(f"    Estimate: {update['estimate']:,.0f}")
        print(f"    Actual:   {update['actual']:,.0f}")
        print(f"    Variance: {update['variance_pct']:+.1f}%")
        print(f"    Source:   {update['source_url']}")
        print()

    return result


def batch_model_update():
    """
    Example: Update multiple models in batch for portfolio companies.

    Prompt: "Update all my delivery/gig economy models with Q3 actuals."
    """
    print("=" * 60)
    print("EARNINGS SPRINT: Batch Model Update")
    print("=" * 60)

    client = DaloopaMCPClient()

    # Define batch configurations
    model_configs = [
        {
            "model_path": "models/DASH_model.xlsx",
            "ticker": "DASH",
            "kpis": ["Total Orders", "Marketplace GOV", "Revenue"],
            "quarter": "Q3 2024",
            "estimate_column": "E"
        },
        {
            "model_path": "models/UBER_model.xlsx",
            "ticker": "UBER",
            "kpis": ["Gross Bookings", "Revenue", "Adjusted EBITDA"],
            "quarter": "Q3 2024",
            "estimate_column": "E"
        },
        {
            "model_path": "models/LYFT_model.xlsx",
            "ticker": "LYFT",
            "kpis": ["Active Riders", "Revenue per Active Rider", "Revenue"],
            "quarter": "Q3 2024",
            "estimate_column": "E"
        }
    ]

    results = batch_update_models(model_configs, client)

    print(f"\nBatch update completed for {len(results)} models")
    print("-" * 50)

    for result in results:
        if 'error' in result:
            print(f"  {result['ticker']}: ERROR - {result['error']}")
        else:
            sig = result['summary']['significant_variances']
            print(f"  {result['ticker']}: {result['summary']['total_updated']} KPIs updated, "
                  f"{sig} significant variances")

    return results


def verify_and_audit():
    """
    Example: After updating, verify all data points with source links.

    Prompt: "Add audit trail comments to all the new actuals I just added."
    """
    print("=" * 60)
    print("AUDIT TRAIL: Source Verification")
    print("=" * 60)

    client = DaloopaMCPClient()

    # First, get KPI data to create the mapping
    response = client.get_kpi_time_series(
        ticker="DASH",
        kpi_name="Revenue",
        start_date="2024-01-01",
        end_date="2024-12-31"
    )

    # Create mapping from response
    mapping = create_mapping_from_kpi_response(response, "B10")

    print(f"Created mapping for {len(mapping)} data points")

    # Verify source links
    result = verify_source_links(
        model_path="models/DASH_model.xlsx",
        cell_range="B10:B13",
        data_point_mapping=mapping,
        mcp_client=client
    )

    print(f"\nVerified {result['verified']} of {result['total_cells']} cells")
    print(f"Unverified: {result['unverified']}")
    print("Audit Trail sheet created with clickable source links")

    return result


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("DALOOPA MCP EARNINGS SEASON WORKFLOW EXAMPLES")
    print("=" * 60 + "\n")

    # Run examples
    single_model_update()
    print("\n" + "-" * 60 + "\n")
    batch_model_update()
    print("\n" + "-" * 60 + "\n")
    verify_and_audit()

    print("\n" + "=" * 60)
    print("Examples completed. See generated Excel files for results.")
    print("=" * 60 + "\n")
