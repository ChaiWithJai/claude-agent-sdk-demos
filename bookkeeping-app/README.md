# Bookkeeping & Accountant App

> ⚠️ **IMPORTANT**: This is a demo application by Anthropic. It is intended for local development only and should NOT be deployed to production or used at scale.

A demonstration desktop application powered by Claude and the [Claude Agent SDK](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview), designed to help W2 employees and LLC business owners manage their personal bookkeeping and accounting.

## What This Demo Shows

This Electron-based desktop application demonstrates how to:
- Track income from W2 employment and LLC business operations
- Categorize and manage business and personal expenses
- Calculate quarterly estimated taxes for self-employed individuals
- Generate financial reports (P&L, cash flow, balance sheet)
- Organize tax deductions and prepare for tax filing
- Maintain IRS-compliant financial records
- Use Claude to assist with bookkeeping and tax planning

### Example Use Cases

The `agent/` folder contains Python examples including:
- **Income Tracker**: Track W2 wages and LLC business income with proper categorization
- **Expense Tracker**: Categorize business expenses with tax deduction tracking
- **Quarterly Tax Calculator**: Estimate quarterly tax payments for LLC owners
- **Mileage Log**: Track business mileage for tax deductions
- **Financial Reports**: Generate P&L statements and cash flow reports

## Prerequisites

- [Node.js 18+](https://nodejs.org) or [Bun](https://bun.sh)
- An Anthropic API key ([get one here](https://console.anthropic.com))
- Python 3.9+ (for the Python agent examples)
- LibreOffice (optional, for formula recalculation)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/anthropics/sdk-demos.git
cd sdk-demos/bookkeeping-app
```

2. Install dependencies:
```bash
npm install
# or bun install
```

3. Configure your Anthropic API key:
   - Set the `ANTHROPIC_API_KEY` environment variable, or
   - The application will prompt you on first run

4. Run the Electron application:
```bash
npm start
# or bun start
```

## Working with Python Examples

The `agent/` directory contains Python scripts demonstrating financial tracking and tax calculations:

### Setup Python Environment

```bash
cd agent
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Run Example Scripts

```bash
# Create an income tracker
python create_income_tracker.py

# Create an expense tracker
python create_expense_tracker.py

# Calculate quarterly taxes
python calculate_quarterly_taxes.py

# Create a mileage log
python create_mileage_log.py
```

See the [agent/README.md](./agent/README.md) for more details on the bookkeeping agent setup and capabilities.

## Features

- **Income Tracking**: Track W2 wages, 1099 income, and LLC business revenue
- **Expense Management**: Categorize expenses with IRS-approved categories
- **Tax Calculations**: Estimate quarterly taxes and self-employment tax
- **Deduction Tracking**: Organize and track tax-deductible expenses
- **Financial Reports**: Generate P&L statements, cash flow reports, and balance sheets
- **Mileage Logging**: Track business mileage for tax deductions
- **Home Office Calculator**: Calculate home office deductions
- **Quarterly Planning**: Assist with quarterly estimated tax payments
- **Year-End Reports**: Prepare organized records for tax filing
- **Desktop Integration**: Native desktop application built with Electron

## Project Structure

```
bookkeeping-app/
├── agent/              # Python examples and bookkeeping agent setup
│   ├── create_income_tracker.py
│   ├── create_expense_tracker.py
│   ├── calculate_quarterly_taxes.py
│   ├── create_mileage_log.py
│   └── README.md       # Bookkeeping agent documentation
├── src/
│   ├── main/          # Electron main process
│   └── renderer/      # React UI components
└── package.json
```

## Tax Compliance & Disclaimer

**IMPORTANT**: This application provides organizational and computational assistance only. It does NOT provide professional tax, legal, or financial advice.

- Tax laws change annually and vary by state and jurisdiction
- This tool helps organize financial records but does not replace professional advice
- For complex tax situations, always consult with a licensed CPA or tax professional
- Verify all calculations independently
- The application is not responsible for any tax filing errors or penalties

### What This App Does:
- Helps organize income and expense records
- Provides templates for financial tracking
- Calculates estimated taxes based on inputs
- Generates reports for review

### What This App Does NOT Do:
- File taxes on your behalf
- Provide specific tax advice for your situation
- Replace a CPA or tax professional
- Guarantee accuracy of tax calculations
- Handle complex tax situations (partnerships, corporations, etc.)

## Target Users

### W2 Employees
- Track employment income and withholdings
- Organize itemized deductions
- Calculate effective tax rate
- Track home office deductions for remote work
- Manage HSA and retirement contributions

### LLC Business Owners
- Track business income and expenses
- Calculate quarterly estimated taxes
- Categorize expenses for Schedule C
- Track business mileage and auto expenses
- Calculate self-employment tax
- Prepare for tax filing with organized records

## Common Workflows

1. **Monthly Bookkeeping**: Record income and expenses, categorize transactions
2. **Quarterly Tax Prep**: Calculate estimated taxes for LLC owners
3. **Year-End Close**: Summarize annual finances for tax filing
4. **Expense Analysis**: Review spending and identify tax deductions
5. **Financial Planning**: Track cash flow and plan for taxes

## Resources

- [Claude Agent SDK Documentation](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview)
- [IRS Tax Forms and Publications](https://www.irs.gov/forms-instructions)
- [Schedule C Instructions (LLC/Self-Employed)](https://www.irs.gov/forms-pubs/about-schedule-c-form-1040)
- [Form 1040-ES (Estimated Taxes)](https://www.irs.gov/forms-pubs/about-form-1040-es)
- [Electron Documentation](https://www.electronjs.org/docs/latest/)
- [openpyxl Documentation](https://openpyxl.readthedocs.io/) (Python library used)

## Support

This is a demo application provided as-is. For issues related to:
- **Claude Agent SDK**: [SDK Documentation](https://docs.anthropic.com/claude-code)
- **Demo Issues**: [GitHub Issues](https://github.com/anthropics/sdk-demos/issues)
- **API Questions**: [Anthropic Support](https://support.anthropic.com)

For tax-related questions, consult:
- A licensed CPA or tax professional
- IRS publications and guidance
- Your state's tax authority

## Security & Privacy

- Financial data is stored locally on your machine
- No data is transmitted to external servers (except API calls to Claude)
- Password protect your financial files
- Keep backups in a secure location
- Do not share files containing sensitive tax information

## License

MIT - This is sample code for demonstration purposes.

---

Built by Anthropic to demonstrate the [Claude Agent SDK](https://github.com/anthropics/claude-code-sdk)
