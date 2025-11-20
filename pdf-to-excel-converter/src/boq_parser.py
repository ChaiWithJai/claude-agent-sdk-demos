import pdfplumber
import pandas as pd
import re
from typing import List, Dict, Optional

class BOQParser:
    """Parser for Bill of Quantities (BOQ) documents for smoke detection systems."""

    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.data = []

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

    def extract_text(self) -> str:
        """Extract all text from PDF."""
        text = ""
        with pdfplumber.open(self.pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        return text

    def parse_boq_structure(self, text: str) -> List[Dict]:
        """Parse BOQ structure from text."""
        lines = text.split('\n')
        items = []

        for i, line in enumerate(lines):
            item_match = re.match(r'^(\d+\.?\d*)\s+(.+?)(?:\s+(\d+(?:\.\d+)?))?\s*$', line.strip())
            if item_match:
                item_no = item_match.group(1)
                description = item_match.group(2)
                quantity = item_match.group(3) if item_match.group(3) else None

                items.append({
                    'Item No': item_no,
                    'Description': description,
                    'Quantity': quantity,
                    'Unit': self._extract_unit(description),
                    'Category': self._categorize_smoke_detector_item(description)
                })

        return items

    def _extract_unit(self, description: str) -> str:
        """Extract unit from description."""
        units = ['nos', 'no', 'pcs', 'pc', 'set', 'meter', 'm', 'ft', 'each', 'ea']
        desc_lower = description.lower()
        for unit in units:
            if unit in desc_lower:
                return unit.upper()
        return 'NOS'

    def _categorize_smoke_detector_item(self, description: str) -> str:
        """Categorize items specific to smoke detection industry."""
        desc_lower = description.lower()

        categories = {
            'Smoke Detectors': ['smoke detector', 'smoke alarm', 'photoelectric', 'ionization', 'heat detector'],
            'Control Panels': ['control panel', 'facp', 'fire alarm control', 'annunciator', 'repeater panel'],
            'Notification Devices': ['horn', 'strobe', 'bell', 'siren', 'speaker', 'notification'],
            'Initiation Devices': ['pull station', 'manual pull', 'call point', 'break glass'],
            'Installation Materials': ['conduit', 'wire', 'cable', 'junction box', 'mounting bracket', 'backbox'],
            'Testing Equipment': ['test kit', 'test meter', 'megger', 'smoke detector tester'],
            'Accessories': ['battery', 'power supply', 'transformer', 'relay', 'module'],
            'System Components': ['addressable', 'conventional', 'analog', 'beam detector', 'duct detector']
        }

        for category, keywords in categories.items():
            if any(keyword in desc_lower for keyword in keywords):
                return category

        return 'Other'

    def parse(self) -> pd.DataFrame:
        """Main parsing method."""
        text = self.extract_text()
        tables = self.extract_tables()

        if tables:
            df = pd.concat(tables, ignore_index=True)
            df['Category'] = df.iloc[:, 1].apply(self._categorize_smoke_detector_item)
            return df
        else:
            items = self.parse_boq_structure(text)
            return pd.DataFrame(items)

    def get_summary(self, df: pd.DataFrame) -> pd.DataFrame:
        """Generate summary by category."""
        if 'Category' in df.columns:
            summary = df.groupby('Category').size().reset_index(name='Count')
            return summary
        return pd.DataFrame()
