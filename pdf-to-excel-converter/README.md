# PDF to Excel Converter for Smoke Detection Industry

A specialized tool for converting PDF documents (Bill of Quantities and Specification Sheets) into formatted Excel spreadsheets for the smoke detection and fire alarm systems industry.

## Features

- **Automatic Document Type Detection**: Intelligently identifies BOQ or specification sheet documents
- **Industry-Specific Categorization**: Automatically categorizes smoke detector equipment into relevant groups
- **Professional Excel Formatting**: Creates well-formatted Excel files with headers, styling, and formulas
- **Batch Processing**: Convert multiple PDFs at once
- **Comprehensive Parsing**: Extracts tables, text, specifications, and compliance standards

## Installation

### Prerequisites

- Python 3.8 or higher
- Virtual environment (recommended)

### Setup

1. Navigate to the project directory:
```bash
cd pdf-to-excel-converter
```

2. Activate the virtual environment:
```bash
source .venv/bin/activate
```

3. Install dependencies (already done if using the provided setup):
```bash
pip install -r requirements.txt
```

## Usage

### Command Line Interface

The main script `pdf_to_excel.py` provides a command-line interface for converting PDFs.

#### Basic Usage

```bash
# Auto-detect document type and convert
python src/pdf_to_excel.py -i input.pdf -o output.xlsx

# Specify document type as BOQ
python src/pdf_to_excel.py -i boq.pdf -o boq.xlsx -t boq

# Specify document type as specification sheet
python src/pdf_to_excel.py -i spec.pdf -o spec.xlsx -t spec
```

#### Batch Conversion

```bash
# Convert all PDFs in a directory
python src/pdf_to_excel.py -i ./samples -o ./output -b
```

#### Command Line Options

- `-i, --input`: Input PDF file or directory (required)
- `-o, --output`: Output Excel file or directory (required)
- `-t, --type`: Document type (`boq`, `spec`, or `auto`). Default: `auto`
- `-b, --batch`: Enable batch mode for converting multiple files

## Supported Document Types

### 1. Bill of Quantities (BOQ)

BOQ documents are parsed to extract:
- Item numbers
- Descriptions
- Quantities
- Units
- Categories (auto-categorized by equipment type)
- Space for unit prices and total calculations

**Output includes:**
- Summary sheet with category breakdown
- BOQ sheet with formatted data
- Automatic formulas for price calculations
- Color-coded input fields (blue for user inputs)

### 2. Specification Sheets

Specification sheets are parsed to extract:
- Product information (model, type, manufacturer)
- Technical specifications (voltage, current, dimensions, etc.)
- Compliance standards (UL, NFPA, FM, CE, etc.)
- Key features

**Output includes:**
- Formatted specification table
- Categorized information sections
- Easy-to-read layout

## Equipment Categories

The converter automatically categorizes smoke detection equipment:

- **Smoke Detectors**: Photoelectric, ionization, heat detectors
- **Control Panels**: FACP, annunciators, repeater panels
- **Notification Devices**: Horns, strobes, bells, sirens, speakers
- **Initiation Devices**: Pull stations, manual pull, call points
- **Installation Materials**: Conduit, wire, cable, junction boxes, mounting brackets
- **Testing Equipment**: Test kits, meters, smoke detector testers
- **Accessories**: Batteries, power supplies, transformers, relays, modules
- **System Components**: Addressable, conventional, beam detectors, duct detectors

## Examples

### Example 1: Converting a BOQ

```bash
python src/pdf_to_excel.py -i samples/smoke_detector_boq.pdf -o output/boq_result.xlsx -t boq
```

**Output Excel Structure:**
- Sheet 1: Summary (category breakdown)
- Sheet 2: BOQ (detailed items with price calculations)

### Example 2: Converting a Spec Sheet

```bash
python src/pdf_to_excel.py -i samples/detector_specs.pdf -o output/specs_result.xlsx -t spec
```

**Output Excel Structure:**
- Sheet 1: Specifications (categorized technical details)

### Example 3: Batch Processing

```bash
# Place all PDFs in the samples directory
python src/pdf_to_excel.py -i samples/ -o output/ -b
```

## Python API

You can also use the converter programmatically:

```python
from src.boq_parser import BOQParser
from src.spec_sheet_parser import SpecSheetParser
from src.excel_generator import ExcelGenerator

# Parse a BOQ
parser = BOQParser('boq.pdf')
df = parser.parse()

# Generate Excel
generator = ExcelGenerator()
generator.create_boq_sheet(df)
generator.save('output.xlsx')
```

## Excel Output Features

### BOQ Sheets
- Professional header with project title
- Color-coded input fields:
  - Blue text: User inputs (unit prices)
  - Black text: Formulas and calculations
  - Yellow highlight: Important cells (totals)
- Automatic total calculations
- Category-based organization
- Bordered cells for clarity

### Specification Sheets
- Categorized sections (Product Info, Technical Specs, Compliance, Features)
- Category grouping with visual separation
- Wrapped text for long specifications
- Standards compliance tracking

## Troubleshooting

### No Data Extracted

If the PDF doesn't contain extractable data:
- Ensure the PDF is not a scanned image (OCR not currently supported)
- Check that the PDF contains actual text or tables
- Try specifying the document type explicitly with `-t`

### Parsing Errors

If specific fields are not extracted:
- The PDF format may not match expected patterns
- Consider manually adjusting the parser regex patterns in `boq_parser.py` or `spec_sheet_parser.py`

### Dependencies Issues

If you encounter import errors:
```bash
source .venv/bin/activate
pip install --upgrade -r requirements.txt
```

## Project Structure

```
pdf-to-excel-converter/
├── src/
│   ├── pdf_to_excel.py       # Main CLI script
│   ├── boq_parser.py          # BOQ PDF parser
│   ├── spec_sheet_parser.py  # Spec sheet PDF parser
│   └── excel_generator.py    # Excel file generator
├── samples/                   # Sample PDF files (add your PDFs here)
├── output/                    # Generated Excel files
├── .venv/                     # Python virtual environment
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## Dependencies

- **openpyxl**: Excel file creation and manipulation
- **pandas**: Data processing and analysis
- **pdfplumber**: PDF text and table extraction
- **PyPDF2**: PDF file handling
- **tabula-py**: Advanced table extraction

## Future Enhancements

Potential improvements:
- OCR support for scanned PDFs
- Additional document types (submittal sheets, cut sheets)
- Custom template support
- Multi-language support
- Web interface
- Database integration

## License

This tool is part of the Claude Agent SDK demos. See the main repository license for details.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the examples
3. Open an issue in the main repository

## Contributing

Contributions are welcome! Areas for improvement:
- Additional parser patterns for various PDF formats
- More equipment categories
- Enhanced Excel formatting options
- Performance optimizations for large PDFs
