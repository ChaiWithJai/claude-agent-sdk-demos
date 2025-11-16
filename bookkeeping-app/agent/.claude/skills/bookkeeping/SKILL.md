---
name: bookkeeping
description: "Personal bookkeeping and accounting for W2 employees and LLC business owners. Comprehensive income tracking, expense categorization, tax preparation, and financial reporting with support for quarterly tax estimates, deduction tracking, and IRS-compliant record keeping."
license: Proprietary. LICENSE.txt has complete terms
---

# Bookkeeping & Accounting Skill

## Requirements for Financial Records

### Zero Formula Errors
- Every financial spreadsheet MUST be delivered with ZERO formula errors (#REF!, #DIV/0!, #VALUE!, #N/A, #NAME?)
- All calculations must be accurate and verifiable

### Tax Compliance
- Follow IRS guidelines for expense categorization
- Maintain proper documentation for all deductions
- Include appropriate disclaimers about professional tax advice

### Data Integrity
- Separate business and personal expenses clearly
- Maintain audit trail with dates, amounts, and descriptions
- Preserve historical records (never delete, only add corrections)

## Financial Bookkeeping Workflows

### 1. Income Tracking

#### W2 Employee Income
Track standard employment income:
- Gross wages
- Federal/state withholding
- Social Security and Medicare taxes
- Pre-tax deductions (401k, HSA, health insurance)
- Net take-home pay

#### LLC/Self-Employment Income
Track business revenue:
- Client payments and invoices
- 1099-NEC income
- Other business income
- Payment dates and methods

### 2. Expense Categorization

#### IRS-Approved Business Expense Categories
Common categories for Schedule C (LLC) or Schedule A (W2):

**Business Operating Expenses:**
- Advertising and marketing
- Office supplies and expenses
- Professional services (legal, accounting)
- Software and subscriptions
- Insurance (business liability, E&O)
- Business meals (50% deductible)
- Travel expenses
- Education and training
- Licenses and permits

**Vehicle Expenses:**
- Standard mileage deduction (track miles)
- OR actual expenses (gas, maintenance, insurance, depreciation)
- Business use percentage

**Home Office:**
- Square footage method
- Simplified method ($5 per sq ft, max 300 sq ft)

**Cost of Goods Sold (if applicable):**
- Inventory purchases
- Materials and supplies
- Direct labor

#### Personal Deductions (Schedule A)
- State and local taxes (SALT - $10,000 cap)
- Mortgage interest
- Charitable contributions
- Medical expenses (over 7.5% AGI threshold)

### 3. Tax Calculations

#### Quarterly Estimated Taxes (LLC/Self-Employed)
Formula for Form 1040-ES:
```
1. Estimate annual income
2. Calculate income tax using tax brackets
3. Add self-employment tax (15.3% on 92.35% of net profit)
4. Subtract withholding and credits
5. Divide by 4 for quarterly payment
```

#### Self-Employment Tax
- 12.4% Social Security (on first $160,200 for 2023)
- 2.9% Medicare (no cap)
- Additional 0.9% Medicare on income over $200k (single)

#### Effective Tax Rate
```
Effective Rate = Total Tax / Total Income
```

### 4. Financial Reports

#### Profit & Loss Statement (P&L)
Format:
```
Revenue
  - Client payments
  - Other income
= Total Revenue

Expenses
  - [Expense categories]
= Total Expenses

Net Profit = Revenue - Expenses
```

#### Cash Flow Statement
Track:
- Operating cash flow
- Beginning balance
- Income received
- Expenses paid
- Ending balance

#### Balance Sheet (for LLC)
Assets, Liabilities, and Equity tracking

### 5. Mileage Tracking

Standard format:
```
Date | Start Location | End Location | Purpose | Miles | Business %
```

IRS Requirements:
- Business purpose for each trip
- Odometer readings or trip distance
- Total annual miles and business miles percentage

## Excel Implementation Guidelines

### Color Coding for Financial Models

#### Industry-Standard Financial Colors
- **Blue text (RGB: 0,0,255)**: User inputs (amounts, dates, tax rates)
- **Black text (RGB: 0,0,0)**: ALL formulas and calculations
- **Green text (RGB: 0,128,0)**: Links to other worksheets
- **Yellow background (RGB: 255,255,0)**: Items needing attention or quarterly review
- **Red text (RGB: 255,0,0)**: Over-budget items or warnings

### Number Formatting Standards

#### Required Format Rules
- **Currency**: $#,##0.00 format with two decimals
- **Zeros**: Use "-" for zero values: $#,##0.00;($#,##0.00);-
- **Percentages**: 0.0% format (one decimal)
- **Dates**: Use consistent format (MM/DD/YYYY or YYYY-MM-DD)
- **Negative numbers**: Use parentheses ($1,234.56) not minus -$1,234.56
- **Years**: Format as text strings "2024" not 2,024

### Formula Construction for Bookkeeping

#### Always Use Cell References
```python
# Good: Tax rate as assumption
sheet['B1'] = 'Tax Rate'
sheet['C1'] = 0.22  # Blue text, user input
sheet['C5'] = '=B5*$C$1'  # Formula references tax rate

# Bad: Hardcoded tax rate
sheet['C5'] = '=B5*0.22'
```

#### Common Financial Formulas
```python
# Total income
sheet['B10'] = '=SUM(B2:B9)'

# Tax calculation
sheet['C10'] = '=B10*$C$1'

# Net income
sheet['D10'] = '=B10-C10'

# Year-to-date running total
sheet['E2'] = '=B2'
sheet['E3'] = '=E2+B3'  # Copy down

# Quarterly average
sheet['F10'] = '=AVERAGE(B2:B4)'

# Percentage of total
sheet['G2'] = '=B2/$B$10'
```

### Template Structure

#### Income Tracker Template
```
Headers (Row 1):
Date | Description | Category | Amount | Running Total | Notes

Formulas:
- Running Total: =SUM($D$2:D2)
- Monthly Total: =SUMIF(A:A,">="&DATE(YEAR,MONTH,1),D:D)
```

#### Expense Tracker Template
```
Headers (Row 1):
Date | Vendor | Category | Amount | Business % | Deductible | Receipt | Notes

Formulas:
- Deductible: =D2*E2
- Category Totals: =SUMIF(C:C,"Category Name",F:F)
```

#### Quarterly Tax Estimate Template
```
Income Summary:
- Total Income (Jan-Mar): =SUM(Sheet1!D:D where dates in Q1)
- Business Expenses: =SUM(ExpenseSheet!F:F where dates in Q1)
- Net Profit: =Income - Expenses

Tax Calculation:
- Self-Employment Tax: =Net Profit * 0.9235 * 0.153
- Income Tax: [Use tax bracket formulas]
- Total Tax Due: =SE Tax + Income Tax
- Quarterly Payment: =Total Tax / 4
```

## Python Implementation

### Using openpyxl for Bookkeeping

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, numbers

wb = Workbook()
sheet = wb.active
sheet.title = "Income Tracker"

# Headers
headers = ['Date', 'Description', 'Category', 'Amount', 'Running Total', 'Notes']
sheet.append(headers)

# Header formatting
for cell in sheet[1]:
    cell.font = Font(bold=True)
    cell.fill = PatternFill('solid', start_color='D9D9D9')
    cell.alignment = Alignment(horizontal='center')

# Sample data with formula
sheet.append(['2024-01-15', 'Client Payment', 'W2 Income', 5000, '=D2', 'January salary'])
sheet['D2'].number_format = '$#,##0.00'
sheet['E2'].number_format = '$#,##0.00'

# Amount column in blue (user input)
sheet['D2'].font = Font(color='0000FF')

# Formula column in black
sheet['E2'].font = Font(color='000000')

wb.save('income_tracker.xlsx')
```

### Tax Bracket Calculations

```python
# 2024 Tax brackets (example - verify current year rates)
def create_tax_calculation(sheet, income_cell):
    """
    Creates progressive tax bracket formulas
    Note: Always verify current tax year rates with IRS
    """
    # Single filer 2024 brackets (example)
    brackets = [
        (11600, 0.10),   # 10% up to $11,600
        (47150, 0.12),   # 12% from $11,601 to $47,150
        (100525, 0.22),  # 22% from $47,151 to $100,525
        (191950, 0.24),  # etc.
    ]

    # Standard deduction
    sheet['B1'] = 'Standard Deduction'
    sheet['C1'] = 14600  # 2024 single filer

    # Taxable income
    sheet['B2'] = 'Taxable Income'
    sheet['C2'] = f'={income_cell}-C1'
```

## Recalculating Formulas

Financial spreadsheets contain formulas that must be recalculated:

```bash
python recalc.py financial_tracker.xlsx 30
```

The script:
- Recalculates all tax formulas and totals
- Scans for errors (#REF!, #DIV/0!, etc.)
- Returns JSON with error details
- Ensures all calculations are current

## Common Bookkeeping Tasks

### Monthly Close Process
1. Record all income received during month
2. Categorize and enter all expenses
3. Reconcile credit card and bank statements
4. Calculate monthly totals
5. Update year-to-date figures
6. Review unusual items or discrepancies

### Quarterly Tax Preparation
1. Sum income for the quarter
2. Total deductible expenses by category
3. Calculate net profit
4. Estimate self-employment tax
5. Calculate income tax on net profit
6. Prepare Form 1040-ES payment

### Year-End Close
1. Finalize all December transactions
2. Generate annual P&L statement
3. Summarize deductions by category
4. Calculate total tax liability
5. Prepare documents for tax filing
6. Generate 1099s if applicable

### Expense Analysis
1. Group expenses by category
2. Calculate category percentages
3. Compare to budget or prior periods
4. Identify largest expense items
5. Review for tax optimization opportunities

## Best Practices

### Data Entry
- Enter transactions promptly (at least weekly)
- Include detailed descriptions for all items
- Save digital copies of all receipts
- Use consistent category names
- Note business purpose for all deductions

### Formula Design
- Put all assumptions in dedicated cells
- Use absolute references ($) for tax rates and constants
- Test formulas with sample data before full implementation
- Add cell comments for complex calculations
- Verify formula results manually for key totals

### Compliance
- Include disclaimer: "Not professional tax advice"
- Recommend CPA review for complex situations
- Reference current tax year in all calculations
- Update tax rates annually
- Maintain backup copies of all financial records

### Security
- Password protect sensitive financial files
- Store backups in secure location
- Don't share files with tax IDs or SSNs
- Use read-only mode when reviewing (not editing)

## Tax Disclaimer Template

Always include in financial workbooks:
```
DISCLAIMER: This spreadsheet is for organizational purposes only and does not
constitute professional tax, legal, or financial advice. Tax laws change annually
and vary by jurisdiction. Consult with a licensed CPA or tax professional for
advice specific to your situation. Verify all calculations independently.
```

## Code Style Guidelines

When generating Python code for bookkeeping:
- Write clear, well-documented code
- Include comments for tax calculations
- Validate input data (dates, amounts, categories)
- Handle edge cases (negative amounts, zero divisions)
- Use meaningful variable names for financial terms

For Excel files:
- Add comments to cells with tax calculations
- Document data sources for tax rates
- Include notes explaining deduction categories
- Label all assumptions clearly
- Provide instructions for quarterly updates
