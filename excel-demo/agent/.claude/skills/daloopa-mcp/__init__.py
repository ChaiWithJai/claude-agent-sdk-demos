"""
Daloopa MCP Skills for Excel Agent

This package provides financial analysis skills powered by Daloopa's
Model Context Protocol server for institutional finance workflows.

Skills:
- Earnings Sprint: Update models with new actuals and variance analysis
- Deep Benchmarker: Normalized KPI comparisons across peers
- Divergence Screener: Find operational divergences from stock performance
- Audit Trail: Source verification for data points
- Proxy Model: Apply public company cost structures to private targets
"""

from .daloopa_client import (
    DaloopaMCPClient,
    get_quarter_dates,
    calculate_date_range,
    format_currency
)

from .earnings_sprint import (
    update_model_variance_analysis,
    batch_update_models
)

from .deep_benchmarker import (
    generate_normalized_kpi_comps,
    auto_discover_peers
)

from .divergence_screener import (
    screen_operational_divergence
)

from .audit_trail import (
    verify_source_links,
    auto_verify_daloopa_cells,
    create_mapping_from_kpi_response,
    generate_verification_report
)

from .proxy_model import (
    build_proxy_cost_structure
)

__all__ = [
    # Client
    'DaloopaMCPClient',
    'get_quarter_dates',
    'calculate_date_range',
    'format_currency',

    # Earnings Sprint
    'update_model_variance_analysis',
    'batch_update_models',

    # Deep Benchmarker
    'generate_normalized_kpi_comps',
    'auto_discover_peers',

    # Divergence Screener
    'screen_operational_divergence',

    # Audit Trail
    'verify_source_links',
    'auto_verify_daloopa_cells',
    'create_mapping_from_kpi_response',
    'generate_verification_report',

    # Proxy Model
    'build_proxy_cost_structure'
]

__version__ = '1.0.0'
