import pdfplumber
import pandas as pd
import re
from typing import List, Dict, Optional

class SpecSheetParser:
    """Parser for specification sheets for smoke detection equipment."""

    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.specifications = {}

    def extract_text(self) -> str:
        """Extract all text from PDF."""
        text = ""
        with pdfplumber.open(self.pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        return text

    def extract_tables(self) -> List[pd.DataFrame]:
        """Extract tables from PDF."""
        tables = []
        with pdfplumber.open(self.pdf_path) as pdf:
            for page in pdf.pages:
                page_tables = page.extract_tables()
                for table in page_tables:
                    if table:
                        df = pd.DataFrame(table[1:], columns=table[0])
                        tables.append(df)
        return tables

    def extract_product_info(self, text: str) -> Dict:
        """Extract product information."""
        info = {
            'Product Name': '',
            'Model Number': '',
            'Manufacturer': '',
            'Product Type': ''
        }

        model_patterns = [
            r'Model[:\s]+([A-Z0-9-]+)',
            r'Part[:\s#]+([A-Z0-9-]+)',
            r'SKU[:\s]+([A-Z0-9-]+)'
        ]

        for pattern in model_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                info['Model Number'] = match.group(1)
                break

        product_types = ['smoke detector', 'heat detector', 'control panel', 'notification device',
                        'horn', 'strobe', 'pull station', 'duct detector', 'beam detector']

        text_lower = text.lower()
        for ptype in product_types:
            if ptype in text_lower:
                info['Product Type'] = ptype.title()
                break

        return info

    def extract_technical_specs(self, text: str) -> Dict:
        """Extract technical specifications."""
        specs = {}

        patterns = {
            'Operating Voltage': r'(?:Operating\s+)?Voltage[:\s]+([0-9.-]+\s*(?:V|VAC|VDC))',
            'Current Draw': r'Current[:\s]+([0-9.-]+\s*(?:mA|A))',
            'Temperature Range': r'Temperature[:\s]+(-?[0-9]+°?\s*[CF]?\s*to\s*-?[0-9]+°?\s*[CF])',
            'Humidity Range': r'Humidity[:\s]+([0-9]+%?\s*to\s*[0-9]+%)',
            'Dimensions': r'Dimensions[:\s]+([0-9.]+\s*[x×]\s*[0-9.]+\s*[x×]?\s*[0-9.]*\s*(?:in|mm|cm))',
            'Weight': r'Weight[:\s]+([0-9.]+\s*(?:kg|g|lb|oz))',
            'Coverage Area': r'Coverage[:\s]+([0-9,]+\s*(?:sq\.?\s*ft|ft²|m²))',
            'Response Time': r'Response[:\s]+([0-9.]+\s*(?:sec|seconds|min|minutes))'
        }

        for spec_name, pattern in patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                specs[spec_name] = match.group(1)

        return specs

    def extract_standards_compliance(self, text: str) -> List[str]:
        """Extract compliance standards."""
        standards = []

        standard_patterns = [
            r'UL\s*\d+[A-Z]?',
            r'NFPA\s*\d+',
            r'FM\s*Approved',
            r'CE\s*Certified',
            r'EN\s*\d+',
            r'ISO\s*\d+',
            r'BS\s*\d+',
            r'CSA\s*Certified'
        ]

        for pattern in standard_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            standards.extend([m.upper() for m in matches])

        return list(set(standards))

    def extract_features(self, text: str) -> List[str]:
        """Extract product features."""
        features = []

        feature_keywords = [
            'addressable', 'wireless', 'photoelectric', 'ionization',
            'multi-sensor', 'dual sensor', 'heat detection', 'smoke detection',
            'tamper resistant', 'led indicator', 'test button', 'low battery',
            'self-diagnostic', 'drift compensation', 'alarm memory'
        ]

        text_lower = text.lower()
        for keyword in feature_keywords:
            if keyword in text_lower:
                features.append(keyword.title())

        return features

    def parse(self) -> pd.DataFrame:
        """Main parsing method."""
        text = self.extract_text()
        tables = self.extract_tables()

        product_info = self.extract_product_info(text)
        tech_specs = self.extract_technical_specs(text)
        standards = self.extract_standards_compliance(text)
        features = self.extract_features(text)

        data = []

        data.append({'Category': 'Product Information', 'Specification': 'Model Number', 'Value': product_info.get('Model Number', 'N/A')})
        data.append({'Category': 'Product Information', 'Specification': 'Product Type', 'Value': product_info.get('Product Type', 'N/A')})

        for spec_name, spec_value in tech_specs.items():
            data.append({'Category': 'Technical Specifications', 'Specification': spec_name, 'Value': spec_value})

        if standards:
            data.append({'Category': 'Compliance', 'Specification': 'Standards', 'Value': ', '.join(standards)})

        if features:
            data.append({'Category': 'Features', 'Specification': 'Key Features', 'Value': ', '.join(features)})

        df = pd.DataFrame(data)

        if tables:
            for i, table_df in enumerate(tables):
                table_df['Source'] = f'Table {i+1}'

        return df

    def get_comparison_format(self, multiple_specs: List[pd.DataFrame]) -> pd.DataFrame:
        """Format multiple spec sheets for comparison."""
        comparison_data = []

        for i, spec_df in enumerate(multiple_specs):
            for _, row in spec_df.iterrows():
                comparison_data.append({
                    'Product': f'Product {i+1}',
                    'Category': row.get('Category', ''),
                    'Specification': row.get('Specification', ''),
                    'Value': row.get('Value', '')
                })

        return pd.DataFrame(comparison_data)
