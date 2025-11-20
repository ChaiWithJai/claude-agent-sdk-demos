#!/usr/bin/env python3
"""
Test script to demonstrate the PDF to Excel converter functionality.
Since we don't have actual PDFs, this creates sample DataFrames and generates Excel files.
"""

import sys
import pandas as pd
from pathlib import Path

sys.path.append(str(Path(__file__).parent / 'src'))

from excel_generator import ExcelGenerator

def create_sample_boq_data():
    """Create sample BOQ data for smoke detection system."""
    data = {
        'Item No': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        'Description': [
            'Addressable Photoelectric Smoke Detector, 24VDC',
            'Addressable Heat Detector, Fixed Temperature 135°F',
            'Manual Pull Station, Single Action, Red',
            'Horn/Strobe Notification Device, 24VDC, Red',
            'Fire Alarm Control Panel, 8-Zone Addressable',
            'Remote Annunciator Panel, LCD Display',
            'Duct Smoke Detector with Housing',
            'Fire Alarm Wire, 18/2 FPLR, Red',
            'Conduit and Fittings for Installation',
            'Smoke Detector Test Kit with Aerosol Spray'
        ],
        'Quantity': [50, 25, 10, 30, 1, 2, 5, 1000, 200, 2],
        'Unit': ['NOS', 'NOS', 'NOS', 'NOS', 'NOS', 'NOS', 'NOS', 'FT', 'FT', 'NOS'],
        'Category': [
            'Smoke Detectors',
            'Smoke Detectors',
            'Initiation Devices',
            'Notification Devices',
            'Control Panels',
            'Control Panels',
            'System Components',
            'Installation Materials',
            'Installation Materials',
            'Testing Equipment'
        ]
    }
    return pd.DataFrame(data)

def create_sample_spec_data():
    """Create sample specification data."""
    data = {
        'Category': [
            'Product Information', 'Product Information',
            'Technical Specifications', 'Technical Specifications',
            'Technical Specifications', 'Technical Specifications',
            'Technical Specifications',
            'Compliance', 'Features', 'Features'
        ],
        'Specification': [
            'Model Number', 'Product Type',
            'Operating Voltage', 'Current Draw',
            'Temperature Range', 'Humidity Range',
            'Dimensions',
            'Standards', 'Key Features', 'Detection Technology'
        ],
        'Value': [
            'SD-2400A',
            'Addressable Photoelectric Smoke Detector',
            '24 VDC',
            '45 mA standby, 85 mA alarm',
            '-4°F to 158°F (-20°C to 70°C)',
            '10% to 93% RH non-condensing',
            '4.1" diameter x 2.1" height',
            'UL 268, NFPA 72, FM Approved, CE Certified',
            'Addressable, Photoelectric, LED Indicator, Test Button, Drift Compensation',
            'Photoelectric smoke sensing with advanced algorithms'
        ]
    }
    return pd.DataFrame(data)

def test_boq_generation():
    """Test BOQ Excel generation."""
    print("Testing BOQ Excel generation...")

    df = create_sample_boq_data()

    generator = ExcelGenerator()
    generator.create_summary_sheet(df)
    generator.create_boq_sheet(df)

    output_file = 'output/sample_boq.xlsx'
    generator.save(output_file)

    print(f"✓ Created sample BOQ: {output_file}")
    print(f"  - {len(df)} items")
    print(f"  - {df['Category'].nunique()} categories")

def test_spec_generation():
    """Test specification sheet Excel generation."""
    print("\nTesting Specification Sheet Excel generation...")

    df = create_sample_spec_data()

    generator = ExcelGenerator()
    generator.create_spec_sheet(df)

    output_file = 'output/sample_spec.xlsx'
    generator.save(output_file)

    print(f"✓ Created sample specification sheet: {output_file}")
    print(f"  - {len(df)} specifications")
    print(f"  - {df['Category'].nunique()} categories")

def test_combined():
    """Test combined BOQ and spec sheet in one Excel file."""
    print("\nTesting combined Excel generation...")

    boq_df = create_sample_boq_data()
    spec_df = create_sample_spec_data()

    generator = ExcelGenerator()
    generator.create_summary_sheet(boq_df)
    generator.create_boq_sheet(boq_df, "Bill of Quantities")
    generator.create_spec_sheet(spec_df, "Equipment Specifications")

    output_file = 'output/sample_combined.xlsx'
    generator.save(output_file)

    print(f"✓ Created combined workbook: {output_file}")
    print(f"  - Summary sheet")
    print(f"  - BOQ with {len(boq_df)} items")
    print(f"  - Spec sheet with {len(spec_df)} specifications")

def main():
    print("="*60)
    print("PDF to Excel Converter - Test Suite")
    print("Smoke Detection Industry")
    print("="*60)

    try:
        test_boq_generation()
        test_spec_generation()
        test_combined()

        print("\n" + "="*60)
        print("All tests completed successfully!")
        print("="*60)
        print("\nGenerated files in ./output directory:")
        print("  - sample_boq.xlsx")
        print("  - sample_spec.xlsx")
        print("  - sample_combined.xlsx")
        print("\nYou can now add your PDF files to ./samples directory")
        print("and use the converter:")
        print("  python src/pdf_to_excel.py -i samples/your.pdf -o output/result.xlsx")

    except Exception as e:
        print(f"\n✗ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == '__main__':
    sys.exit(main())
