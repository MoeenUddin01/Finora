from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr

# Customer Schemas
class CustomerBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    tax_number: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Supplier Schemas
class SupplierBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    tax_number: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierResponse(SupplierBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Item Schemas
class ItemBase(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    sales_price: float = 0.0
    purchase_price: float = 0.0
    unit: str = "pcs"

class ItemCreate(ItemBase):
    pass

class ItemResponse(ItemBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# TaxRate Schemas
class TaxRateBase(BaseModel):
    name: str
    rate_percent: float
    is_active: bool = True

class TaxRateCreate(TaxRateBase):
    pass

class TaxRateResponse(TaxRateBase):
    id: int

    class Config:
        from_attributes = True

# Account Schemas
class AccountResponse(BaseModel):
    id: int
    code: str
    name: str
    type: str
    system_key: Optional[str] = None
    is_system: bool

    class Config:
        from_attributes = True

# Invoice Item Schemas
class InvoiceItemCreate(BaseModel):
    item_id: int
    description: Optional[str] = None
    quantity: float = Field(gt=0, default=1.0)
    unit_price: float = Field(ge=0, default=0.0)
    tax_rate_percent: float = Field(ge=0, default=0.0)

class InvoiceItemResponse(BaseModel):
    id: int
    item_id: int
    description: Optional[str] = None
    quantity: float
    unit_price: float
    tax_rate_percent: float
    tax_amount: float
    amount: float
    item: Optional[ItemResponse] = None

    class Config:
        from_attributes = True

# Invoice Schemas
class InvoiceCreate(BaseModel):
    invoice_number: Optional[str] = None
    invoice_type: str  # SALES, PURCHASE
    party_type: str    # CUSTOMER, SUPPLIER
    customer_id: Optional[int] = None
    supplier_id: Optional[int] = None
    issue_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    status: str = "DRAFT"  # DRAFT, PAID, CANCELLED
    notes: Optional[str] = None
    items: List[InvoiceItemCreate]

class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    invoice_type: str
    party_type: str
    customer_id: Optional[int] = None
    supplier_id: Optional[int] = None
    issue_date: datetime
    due_date: Optional[datetime] = None
    status: str
    subtotal: float
    tax_total: float
    grand_total: float
    notes: Optional[str] = None
    created_at: datetime
    customer: Optional[CustomerResponse] = None
    supplier: Optional[SupplierResponse] = None
    items: List[InvoiceItemResponse] = []

    class Config:
        from_attributes = True

# Journal Entry & Line Schemas
class JournalLineResponse(BaseModel):
    id: int
    account_id: int
    debit: float
    credit: float
    account: Optional[AccountResponse] = None

    class Config:
        from_attributes = True

class JournalEntryResponse(BaseModel):
    id: int
    entry_number: str
    date: datetime
    description: Optional[str] = None
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    lines: List[JournalLineResponse] = []

    class Config:
        from_attributes = True

# P&L Report Schemas
class AccountSummary(BaseModel):
    code: str
    name: str
    amount: float

class ProfitLossResponse(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    total_sales_revenue: float
    total_purchase_expense: float
    gross_profit: float
    total_tax_collected: float
    total_tax_paid: float
    net_profit: float
    revenue_accounts: List[AccountSummary] = []
    expense_accounts: List[AccountSummary] = []
