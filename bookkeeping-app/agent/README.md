# Bookkeeping Agent Setup

This folder contains a bookkeeping-specialized agent that uses the bookkeeping skill to help with personal finances, tax preparation, and accounting for W2 employees and LLC business owners.

## Prerequisites

The setup requires:

- Python 3.9+
- LibreOffice (for formula recalculation)
- Python virtual environment with required packages

## Python Environment

A virtual environment should be created in `.venv` with the following packages:
- `openpyxl` - For creating and editing Excel files with formulas and formatting
- `pandas` - For data analysis and manipulation

### Activating the Virtual Environment

To use the Python environment, activate it first:

```bash
# From the agent folder
source .venv/bin/activate
```

To deactivate:

```bash
deactivate
```

### Installing Dependencies

If you need to install dependencies:

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

## Using the Bookkeeping Skill

The agent has access to the bookkeeping skill located in `.claude/skills/bookkeeping/`. This skill provides:

- Income tracking for W2 and LLC sources
- Expense categorization with IRS-approved categories
- Quarterly tax estimate calculations
- Financial report generation (P&L, cash flow, balance sheet)
- Mileage and home office tracking
- Year-end tax preparation support
- Formula recalculation using LibreOffice

## Formula Recalculation

The bookkeeping skill includes a `recalc.py` script that uses LibreOffice to recalculate formulas:

```bash
source .venv/bin/activate
python .claude/skills/bookkeeping/recalc.py <excel_file> [timeout_seconds]
```

Example:
```bash
python .claude/skills/bookkeeping/recalc.py Income_Tracker.xlsx 30
```

The script will:
- Automatically configure LibreOffice on first run
- Recalculate all formulas
- Check for errors (#REF!, #DIV/0!, etc.)
- Return JSON with error details

## Example Scripts

This folder contains example Python scripts for common bookkeeping tasks:

### Income Tracker
```bash
python create_income_tracker.py
```
Creates a spreadsheet for tracking W2 wages and LLC business income with running totals and categorization.

### Expense Tracker
```bash
python create_expense_tracker.py
```
Creates a spreadsheet for categorizing business expenses with automatic deduction calculations and category totals.

### Quarterly Tax Calculator
```bash
python calculate_quarterly_taxes.py
```
Calculates quarterly estimated taxes for LLC owners based on income and expenses, including self-employment tax.

### Mileage Log
```bash
python create_mileage_log.py
```
Creates a mileage tracking spreadsheet for business travel deductions.

## Files in this Folder

- `CLAUDE.MD` - Instructions for the Bookkeeping Agent
- `create_income_tracker.py` - Script to create income tracking spreadsheet
- `create_expense_tracker.py` - Script to create expense tracking spreadsheet
- `calculate_quarterly_taxes.py` - Script to calculate quarterly tax estimates
- `create_mileage_log.py` - Script to create mileage tracking log
- `.venv/` - Python virtual environment (to be created)
- `requirements.txt` - Python dependencies
- `.claude/skills/bookkeeping/` - Bookkeeping skill files

## Common Use Cases

### For W2 Employees
- Track employment income and withholdings
- Organize itemized deductions
- Calculate effective tax rate
- Track home office deductions for remote work

### For LLC Business Owners
- Track business income from multiple sources
- Categorize expenses for Schedule C
- Calculate quarterly estimated taxes
- Prepare for year-end tax filing
- Track business mileage and auto expenses

## Tax Compliance Notice

**IMPORTANT**: This tool provides organizational and computational assistance only. It does NOT provide professional tax, legal, or financial advice.

- Always verify calculations independently
- Consult with a licensed CPA or tax professional for advice specific to your situation
- Tax laws change annually and vary by jurisdiction
- The tool is for record-keeping purposes only

## Getting Started

1. Install Python dependencies:
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Run an example script:
```bash
python create_income_tracker.py
```

3. Open the generated Excel file to review the template

4. Use the bookkeeping agent in the main app to create custom financial tracking spreadsheets tailored to your needs

## Tips for Best Results

- Update financial records at least monthly
- Save digital copies of all receipts
- Use consistent category names
- Review and recalculate spreadsheets after making changes
- Back up your financial files regularly
- Consult a CPA for tax advice
