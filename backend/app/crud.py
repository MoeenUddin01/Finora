"""
CRUD database operations and accounting journal engine for Finora application.
Handles creation, retrieval, updates, double-entry ledger postings, and P&L calculation.
"""
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import (
    Customer, Supplier, Item, TaxRate, Account, Invoice, InvoiceItem,
    JournalEntry, JournalLine
)
from app.schemas import (
    CustomerCreate, SupplierCreate, ItemCreate, TaxRateCreate, InvoiceCreate
)

# --- Customer CRUD ---

def get_customers(db: Session, skip: int = 0, limit: int = 100) -> List[Customer]:
    """Retrieve all customer records."""
    return db.query(Customer).order_by(Customer.id.desc()).offset(skip).limit(limit).all()

def get_customer(db: Session, customer_id: int) -> Optional[Customer]:
    """Retrieve a single customer by ID."""
    return db.query(Customer).filter(Customer.id == customer_id).first()

def create_customer(db: Session, customer_in: CustomerCreate) -> Customer:
    """Create a new customer record."""
    customer = Customer(**customer_in.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

# --- Supplier CRUD ---

def get_suppliers(db: Session, skip: int = 0, limit: int = 100) -> List[Supplier]:
    """Retrieve all supplier records."""
    return db.query(Supplier).order_by(Supplier.id.desc()).offset(skip).limit(limit).all()

def get_supplier(db: Session, supplier_id: int) -> Optional[Supplier]:
    """Retrieve a single supplier by ID."""
    return db.query(Supplier).filter(Supplier.id == supplier_id).first()

def create_supplier(db: Session, supplier_in: SupplierCreate) -> Supplier:
    """Create a new supplier record."""
    supplier = Supplier(**supplier_in.model_dump())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier

# --- Item CRUD ---

def get_items(db: Session, skip: int = 0, limit: int = 100) -> List[Item]:
    """Retrieve all product/service items."""
    return db.query(Item).order_by(Item.id.desc()).offset(skip).limit(limit).all()

def get_item(db: Session, item_id: int) -> Optional[Item]:
    """Retrieve a single item by ID."""
    return db.query(Item).filter(Item.id == item_id).first()

def create_item(db: Session, item_in: ItemCreate) -> Item:
    """Create a new inventory item."""
    item = Item(**item_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

# --- Tax Rate CRUD ---

def get_tax_rates(db: Session) -> List[TaxRate]:
    """Retrieve active tax rates."""
    return db.query(TaxRate).filter(TaxRate.is_active == True).all()

def create_tax_rate(db: Session, tax_in: TaxRateCreate) -> TaxRate:
    """Create a new tax rate rule."""
    tax = TaxRate(**tax_in.model_dump())
    db.add(tax)
    db.commit()
    db.refresh(tax)
    return tax

# --- Accounting & Double-Entry Journal Engine ---

def get_account_by_key(db: Session, system_key: str) -> Optional[Account]:
    """Find a system account in Chart of Accounts by its key (e.g. AR, AP, SALES, PURCHASES)."""
    return db.query(Account).filter(Account.system_key == system_key).first()

def create_journal_entry_for_invoice(db: Session, invoice: Invoice) -> Optional[JournalEntry]:
    """
    Auto-generates double-entry accounting journal entries for a Sales or Purchase invoice.
    
    Sales Invoice Journal Posting:
        Debit:  Accounts Receivable (or Cash if PAID) = grand_total
        Credit: Sales Revenue                         = subtotal
        Credit: Sales Tax Payable                     = tax_total
        
    Purchase Invoice Journal Posting:
        Debit:  Purchase Expense / COGS               = subtotal
        Debit:  Purchase Tax Credit                   = tax_total
        Credit: Accounts Payable (or Cash if PAID)    = grand_total
    """
    if invoice.journal_entry:
        # Avoid duplicate postings if already created
        return invoice.journal_entry

    lines = []
    entry_number = f"JE-{invoice.invoice_type[:3]}-{invoice.id:04d}"

    if invoice.invoice_type.upper() == "SALES":
        ar_account = get_account_by_key(db, "CASH" if invoice.status == "PAID" else "AR")
        sales_account = get_account_by_key(db, "SALES")
        tax_account = get_account_by_key(db, "SALES_TAX")

        if ar_account and invoice.grand_total > 0:
            lines.append(JournalLine(account_id=ar_account.id, debit=invoice.grand_total, credit=0.0))
        if sales_account and invoice.subtotal > 0:
            lines.append(JournalLine(account_id=sales_account.id, debit=0.0, credit=invoice.subtotal))
        if tax_account and invoice.tax_total > 0:
            lines.append(JournalLine(account_id=tax_account.id, debit=0.0, credit=invoice.tax_total))

    elif invoice.invoice_type.upper() == "PURCHASE":
        ap_account = get_account_by_key(db, "CASH" if invoice.status == "PAID" else "AP")
        purchases_account = get_account_by_key(db, "PURCHASES")
        tax_account = get_account_by_key(db, "PURCHASE_TAX")

        if purchases_account and invoice.subtotal > 0:
            lines.append(JournalLine(account_id=purchases_account.id, debit=invoice.subtotal, credit=0.0))
        if tax_account and invoice.tax_total > 0:
            lines.append(JournalLine(account_id=tax_account.id, debit=invoice.tax_total, credit=0.0))
        if ap_account and invoice.grand_total > 0:
            lines.append(JournalLine(account_id=ap_account.id, debit=0.0, credit=invoice.grand_total))

    if not lines:
        return None

    entry = JournalEntry(
        entry_number=entry_number,
        date=invoice.issue_date or datetime.utcnow(),
        description=f"Auto-posting for {invoice.invoice_type} Invoice {invoice.invoice_number}",
        reference_type="INVOICE",
        reference_id=invoice.id,
        lines=lines
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

# --- Invoice CRUD ---

def generate_invoice_number(db: Session, invoice_type: str) -> str:
    """Generates unique invoice sequence number (e.g. INV-2026-0001 or BILL-2026-0001)."""
    prefix = "INV" if invoice_type.upper() == "SALES" else "BILL"
    year = datetime.utcnow().year
    count = db.query(Invoice).filter(Invoice.invoice_type == invoice_type.upper()).count() + 1
    return f"{prefix}-{year}-{count:04d}"

def create_invoice(db: Session, invoice_in: InvoiceCreate) -> Invoice:
    """
    Creates a new Sales or Purchase invoice with calculated line items and grand total,
    and posts double-entry journal entries to the ledger.
    """
    inv_number = invoice_in.invoice_number or generate_invoice_number(db, invoice_in.invoice_type)
    
    invoice = Invoice(
        invoice_number=inv_number,
        invoice_type=invoice_in.invoice_type.upper(),
        party_type=invoice_in.party_type.upper(),
        customer_id=invoice_in.customer_id,
        supplier_id=invoice_in.supplier_id,
        issue_date=invoice_in.issue_date or datetime.utcnow(),
        due_date=invoice_in.due_date,
        status=invoice_in.status.upper(),
        notes=invoice_in.notes,
        subtotal=0.0,
        tax_total=0.0,
        grand_total=0.0
    )
    db.add(invoice)
    db.flush()

    subtotal = 0.0
    tax_total = 0.0

    for item_in in invoice_in.items:
        line_subtotal = item_in.quantity * item_in.unit_price
        line_tax = line_subtotal * (item_in.tax_rate_percent / 100.0)
        line_amount = line_subtotal + line_tax

        inv_item = InvoiceItem(
            invoice_id=invoice.id,
            item_id=item_in.item_id,
            description=item_in.description,
            quantity=item_in.quantity,
            unit_price=item_in.unit_price,
            tax_rate_percent=item_in.tax_rate_percent,
            tax_amount=line_tax,
            amount=line_amount
        )
        db.add(inv_item)

        subtotal += line_subtotal
        tax_total += line_tax

    invoice.subtotal = round(subtotal, 2)
    invoice.tax_total = round(tax_total, 2)
    invoice.grand_total = round(subtotal + tax_total, 2)

    db.commit()
    db.refresh(invoice)

    # Trigger accounting journal posting
    create_journal_entry_for_invoice(db, invoice)

    return invoice

def get_invoices(db: Session, invoice_type: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Invoice]:
    """Retrieve invoices filtered optionally by type (SALES or PURCHASE)."""
    query = db.query(Invoice)
    if invoice_type:
        query = query.filter(Invoice.invoice_type == invoice_type.upper())
    return query.order_by(Invoice.id.desc()).offset(skip).limit(limit).all()

def get_invoice(db: Session, invoice_id: int) -> Optional[Invoice]:
    """Retrieve full details of an invoice by ID."""
    return db.query(Invoice).filter(Invoice.id == invoice_id).first()

def update_invoice_status(db: Session, invoice_id: int, new_status: str) -> Optional[Invoice]:
    """Update invoice status (DRAFT, PAID, CANCELLED) and refresh accounting entries."""
    invoice = get_invoice(db, invoice_id)
    if not invoice:
        return None

    invoice.status = new_status.upper()
    db.commit()
    db.refresh(invoice)

    # Refresh journal entry if status changed to PAID
    if not invoice.journal_entry:
        create_journal_entry_for_invoice(db, invoice)

    return invoice

# --- Profit & Loss Report Engine ---

def get_profit_loss_report(db: Session, start_date: Optional[str] = None, end_date: Optional[str] = None) -> dict:
    """
    Calculates Profit & Loss financial summary statement based on ledger transactions.
    
    Formula:
        Total Revenue       = Sum of credits on REVENUE accounts
        Total Expense       = Sum of debits on EXPENSE accounts
        Gross Profit        = Total Revenue - Total Expense
        Tax Collected       = Sum of credits on Sales Tax Payable
        Tax Paid            = Sum of debits on Purchase Tax Credit
        Net Profit / (Loss) = Gross Profit
    """
    sales_invoices = db.query(Invoice).filter(
        Invoice.invoice_type == "SALES",
        Invoice.status != "CANCELLED"
    ).all()

    purchase_invoices = db.query(Invoice).filter(
        Invoice.invoice_type == "PURCHASE",
        Invoice.status != "CANCELLED"
    ).all()

    total_sales_revenue = sum(inv.subtotal for inv in sales_invoices)
    total_tax_collected = sum(inv.tax_total for inv in sales_invoices)

    total_purchase_expense = sum(inv.subtotal for inv in purchase_invoices)
    total_tax_paid = sum(inv.tax_total for inv in purchase_invoices)

    gross_profit = total_sales_revenue - total_purchase_expense
    net_profit = gross_profit

    revenue_accounts = [
        {"code": "4000", "name": "Sales Revenue", "amount": round(total_sales_revenue, 2)}
    ]
    expense_accounts = [
        {"code": "5000", "name": "Purchase Expense / COGS", "amount": round(total_purchase_expense, 2)}
    ]

    return {
        "start_date": start_date,
        "end_date": end_date,
        "total_sales_revenue": round(total_sales_revenue, 2),
        "total_purchase_expense": round(total_purchase_expense, 2),
        "gross_profit": round(gross_profit, 2),
        "total_tax_collected": round(total_tax_collected, 2),
        "total_tax_paid": round(total_tax_paid, 2),
        "net_profit": round(net_profit, 2),
        "revenue_accounts": revenue_accounts,
        "expense_accounts": expense_accounts
    }
