#!/usr/bin/env python3
import argparse
import sys
import os
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from boq_parser import BOQParser
from spec_sheet_parser import SpecSheetParser
from excel_generator import ExcelGenerator

def convert_pdf_to_excel(pdf_path: str, output_path: str, doc_type: str = 'auto'):
    """
    Convert a PDF to Excel format.

    Args:
        pdf_path: Path to input PDF file
        output_path: Path to output Excel file
        doc_type: Type of document ('boq', 'spec', or 'auto')
    """
    if not os.path.exists(pdf_path):
        print(f"Error: File not found: {pdf_path}")
        return False

    print(f"Processing PDF: {pdf_path}")

    if doc_type == 'auto':
        with open(pdf_path, 'rb') as f:
            content = f.read()
            content_lower = str(content).lower()

            if 'bill of quantities' in content_lower or 'boq' in content_lower:
                doc_type = 'boq'
            elif 'specification' in content_lower or 'spec sheet' in content_lower:
                doc_type = 'spec'
            else:
                filename_lower = os.path.basename(pdf_path).lower()
                if 'boq' in filename_lower or 'bill' in filename_lower:
                    doc_type = 'boq'
                elif 'spec' in filename_lower:
                    doc_type = 'spec'
                else:
                    doc_type = 'boq'

    print(f"Detected document type: {doc_type.upper()}")

    generator = ExcelGenerator()

    try:
        if doc_type == 'boq':
            parser = BOQParser(pdf_path)
            df = parser.parse()

            if df.empty:
                print("Warning: No data extracted from PDF")
                return False

            print(f"Extracted {len(df)} items from BOQ")

            generator.create_summary_sheet(df)
            generator.create_boq_sheet(df)

        elif doc_type == 'spec':
            parser = SpecSheetParser(pdf_path)
            df = parser.parse()

            if df.empty:
                print("Warning: No data extracted from PDF")
                return False

            print(f"Extracted {len(df)} specifications")

            generator.create_spec_sheet(df)

        generator.save(output_path)
        print(f"Successfully created Excel file: {output_path}")
        return True

    except Exception as e:
        print(f"Error during conversion: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def batch_convert(input_dir: str, output_dir: str, doc_type: str = 'auto'):
    """
    Convert all PDFs in a directory to Excel.

    Args:
        input_dir: Directory containing PDF files
        output_dir: Directory for output Excel files
        doc_type: Type of document ('boq', 'spec', or 'auto')
    """
    if not os.path.exists(input_dir):
        print(f"Error: Directory not found: {input_dir}")
        return

    os.makedirs(output_dir, exist_ok=True)

    pdf_files = list(Path(input_dir).glob('*.pdf'))

    if not pdf_files:
        print(f"No PDF files found in {input_dir}")
        return

    print(f"Found {len(pdf_files)} PDF files")

    success_count = 0
    for pdf_file in pdf_files:
        output_name = pdf_file.stem + '.xlsx'
        output_path = os.path.join(output_dir, output_name)

        print(f"\n{'='*60}")
        if convert_pdf_to_excel(str(pdf_file), output_path, doc_type):
            success_count += 1

    print(f"\n{'='*60}")
    print(f"Conversion complete: {success_count}/{len(pdf_files)} files successful")

def main():
    parser = argparse.ArgumentParser(
        description='Convert smoke detection industry PDFs (BOQ, spec sheets) to Excel',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Convert a single BOQ PDF
  python pdf_to_excel.py -i boq.pdf -o boq.xlsx -t boq

  # Convert a spec sheet
  python pdf_to_excel.py -i spec.pdf -o spec.xlsx -t spec

  # Auto-detect and convert
  python pdf_to_excel.py -i document.pdf -o output.xlsx

  # Batch convert all PDFs in a directory
  python pdf_to_excel.py -i ./pdfs -o ./excel -b
        """
    )

    parser.add_argument('-i', '--input', required=True,
                       help='Input PDF file or directory (with -b flag)')
    parser.add_argument('-o', '--output', required=True,
                       help='Output Excel file or directory (with -b flag)')
    parser.add_argument('-t', '--type', choices=['boq', 'spec', 'auto'],
                       default='auto',
                       help='Document type (default: auto-detect)')
    parser.add_argument('-b', '--batch', action='store_true',
                       help='Batch convert all PDFs in input directory')

    args = parser.parse_args()

    if args.batch:
        batch_convert(args.input, args.output, args.type)
    else:
        convert_pdf_to_excel(args.input, args.output, args.type)

if __name__ == '__main__':
    main()
