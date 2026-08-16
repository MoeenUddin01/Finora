# 💰 Finora — Accounting & Invoicing Platform

**Finora** is a full-stack, double-entry accounting software and invoicing platform designed for small businesses, freelancers, and finance professionals. Built with a modern high-performance stack (**FastAPI**, **SQLAlchemy**, **React**, **Tailwind CSS v4**, and **Recharts**), Finora automates double-entry ledger postings, tracks receivables/payables, and provides real-time Profit & Loss financial analytics.

---

## ✨ Features

- **🧾 Sales & Purchase Invoice Builders**
  - Live auto-calculation of line subtotals, tax rate percentages, and grand totals.
  - Item lookup dropdown with auto-filling default prices.
  - Quick inline customer/supplier creation modal directly inside the invoice builder.

- **🖨️ Printable Invoice Preview & PDF Export**
  - Professional invoice document viewer with status badges (`DRAFT`, `PAID`, `CANCELLED`).
  - One-click print / PDF export support using standard browser print styling.

- **⚙️ Automated Double-Entry Ledger Engine**
  - Automatic posting of balanced debit and credit journal entries to system accounts:
    - **Sales Invoice (Paid)**: Debit Cash/AR, Credit Sales Revenue, Credit Sales Tax Payable.
    - **Purchase Invoice (Paid)**: Debit Purchase Expense/COGS, Debit Purchase Tax Credit, Credit Cash/AP.

- **📊 Profit & Loss (P&L) Analytics Dashboard**
  - Real-time financial statement calculated directly from double-entry ledger journal postings.
  - Visual charts powered by **Recharts** comparing Sales Revenue, Purchase Expenses, and Net Profit.
  - Date range filters and detailed Revenue & Expense account breakdown tables.

- **👥 Master Data Management**
  - **Customers**: Contact details, tax IDs, and billing addresses.
  - **Suppliers**: Vendor accounts, contact details, and tax identification.
  - **Inventory Items**: Product and service catalog with sales price, purchase price, SKU code, and units.
  - **Tax Rates**: Tax rules configuration (GST, VAT, Sales Tax) with active status toggles.

- **📈 Executive Overview Dashboard**
  - High-level KPIs, monthly financial performance area chart, and recent invoice activity feed.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.14) |
| **Database & ORM** | [SQLite](https://sqlite.org/) + [SQLAlchemy 2.0](https://www.sqlalchemy.org/) |
| **Data Validation** | [Pydantic v2](https://docs.pydantic.dev/) |
| **Frontend Library** | [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) |
| **Styling & Icons** | [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) |
| **Financial Charts** | [Recharts 3](https://recharts.org/) |
| **HTTP Client** | [Axios](https://axios-http.com/) |
| **Test Suite** | [Pytest 9](https://docs.pytest.org/) |

---

## 📁 Project Structure

```text
Finora/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entrypoint & CORS setup
│   │   ├── database.py          # SQLite database session configuration
│   │   ├── models.py            # SQLAlchemy ORM models (Account, Customer, Item, Invoice, Journal)
│   │   ├── schemas.py           # Pydantic v2 validation & API response schemas
│   │   ├── crud.py              # CRUD database operations & double-entry engine
│   │   ├── seed.py              # Initial Chart of Accounts seed script
│   │   └── routers/             # API endpoint routers
│   │       ├── customers.py     # Customer CRUD endpoints
│   │       ├── suppliers.py     # Supplier CRUD endpoints
│   │       ├── items.py         # Inventory items endpoints
│   │       ├── taxes.py         # Tax rates configuration endpoints
│   │       ├── invoices.py      # Sales & Purchase Invoices & status updates
│   │       └── reports.py       # Profit & Loss financial report calculation
│   ├── finora.db                # SQLite database storage
│   ├── requirements.txt         # Python dependencies
│   └── tests/                   # Pytest automated integration test suite
│       └── test_api.py
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Sidebar.jsx      # Navigation sidebar with brand logo & quick action
│   │   │   ├── Navbar.jsx       # Header bar with search & admin badge
│   │   │   ├── Modal.jsx        # Animated dark-mode dialog overlay
│   │   │   ├── InvoiceBuilderModal.jsx # Live invoice builder with quick party add
│   │   │   └── InvoiceViewModal.jsx    # Printable invoice document view
│   │   ├── pages/               # Application page views
│   │   │   ├── DashboardPage.jsx   # Executive overview & KPIs
│   │   │   ├── InvoicesPage.jsx    # Sales & Purchase invoice tables
│   │   │   ├── CustomersPage.jsx   # Customer management page
│   │   │   ├── SuppliersPage.jsx   # Supplier management page
│   │   │   ├── ItemsPage.jsx       # Inventory items catalog
│   │   │   ├── TaxesPage.jsx       # Tax rates page
│   │   │   └── ProfitLossPage.jsx  # P&L statement & Recharts analytics
│   │   ├── services/
│   │   │   └── api.js           # Axios API client wrapper
│   │   ├── App.jsx              # Application layout & state routing
│   │   └── main.jsx             # React DOM entrypoint
│   ├── package.json             # Node.js dependencies & scripts
│   └── vite.config.js           # Vite dev server configuration & API proxy
└── PROGRESS.md                  # Implementation phases & commit checkpoints
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and `npm`

---

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/MoeenUddin01/Finora.git
cd Finora

# Activate Python virtual environment
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run FastAPI backend server (Port 8000)
PYTHONPATH=backend python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend API will be live at `http://127.0.0.1:8000`.  
Interactive API docs are available at `http://127.0.0.1:8000/docs`.

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node modules
npm install

# Start Vite dev server (Port 5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

### 3. Run Automated Tests

To run the Pytest backend integration suite:

```bash
PYTHONPATH=backend pytest backend/tests
```

---

## 🧮 Accounting Journal Posting Rules

Finora automatically enforces strict double-entry accounting principles:

### Sales Invoice Posting
- **Debit**: Accounts Receivable (1100) or Cash & Bank (1000 if PAID) = `Grand Total`
- **Credit**: Sales Revenue (4000) = `Subtotal`
- **Credit**: Sales Tax Payable (2100) = `Tax Total`

### Purchase Invoice Posting
- **Debit**: Purchase Expense / COGS (5000) = `Subtotal`
- **Debit**: Purchase Tax Credit (1200) = `Tax Total`
- **Credit**: Accounts Payable (2000) or Cash & Bank (1000 if PAID) = `Grand Total`

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
