"""
Database seeding script for Finora accounting application.
Populates default Chart of Accounts, standard Tax Rates, and initial demo data.
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import Account, TaxRate, Customer, Supplier, Item

def seed_data(db: Session = None):
    """
    Populates database tables with default accounting system configuration.
    
    Args:
        db (Session, optional): SQLAlchemy database session. If None, creates a new session.
    """
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        # Create tables if not present
        Base.metadata.create_all(bind=engine)

        # Default Chart of Accounts
        default_accounts = [
            {"code": "1000", "name": "Cash & Bank", "type": "ASSET", "system_key": "CASH", "is_system": True},
            {"code": "1100", "name": "Accounts Receivable", "type": "ASSET", "system_key": "AR", "is_system": True},
            {"code": "1200", "name": "Purchase Tax Credit", "type": "ASSET", "system_key": "PURCHASE_TAX", "is_system": True},
            {"code": "2000", "name": "Accounts Payable", "type": "LIABILITY", "system_key": "AP", "is_system": True},
            {"code": "2100", "name": "Sales Tax Payable", "type": "LIABILITY", "system_key": "SALES_TAX", "is_system": True},
            {"code": "3000", "name": "Owner's Equity", "type": "EQUITY", "system_key": "EQUITY", "is_system": True},
            {"code": "4000", "name": "Sales Revenue", "type": "REVENUE", "system_key": "SALES", "is_system": True},
            {"code": "5000", "name": "Purchase Expense / COGS", "type": "EXPENSE", "system_key": "PURCHASES", "is_system": True},
        ]

        for acc_data in default_accounts:
            existing = db.query(Account).filter(Account.code == acc_data["code"]).first()
            if not existing:
                account = Account(**acc_data)
                db.add(account)

        # Default Tax Rates
        default_taxes = [
            {"name": "Standard Tax (10%)", "rate_percent": 10.0, "is_active": True},
            {"name": "Reduced VAT (5%)", "rate_percent": 5.0, "is_active": True},
            {"name": "GST (18%)", "rate_percent": 18.0, "is_active": True},
            {"name": "Tax Exempt (0%)", "rate_percent": 0.0, "is_active": True},
        ]

        for tax_data in default_taxes:
            existing = db.query(TaxRate).filter(TaxRate.name == tax_data["name"]).first()
            if not existing:
                tax = TaxRate(**tax_data)
                db.add(tax)

        # Seed sample Customer, Supplier & Items if DB empty
        if db.query(Customer).count() == 0:
            sample_customer = Customer(
                name="Acme Corporation",
                email="billing@acme.com",
                phone="+1 (555) 019-2834",
                address="123 Innovation Way, Tech City",
                tax_number="TAX-ACME-991"
            )
            db.add(sample_customer)

        if db.query(Supplier).count() == 0:
            sample_supplier = Supplier(
                name="Global Components Ltd",
                email="sales@globalcomp.com",
                phone="+1 (555) 882-1920",
                address="789 Industrial Parkway, Logistics Hub",
                tax_number="TAX-GC-442"
            )
            db.add(sample_supplier)

        if db.query(Item).count() == 0:
            sample_items = [
                Item(name="Web Design Service", code="SRV-001", description="Custom responsive web development", sales_price=1500.0, purchase_price=800.0, unit="hours"),
                Item(name="Cloud Hosting License", code="LIC-002", description="Annual server subscription", sales_price=250.0, purchase_price=150.0, unit="unit"),
                Item(name="Hardware Component X", code="HW-003", description="Precision sensor module", sales_price=75.0, purchase_price=45.0, unit="pcs")
            ]
            for item in sample_items:
                db.add(item)

        db.commit()
        print("Database seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        if close_db:
            db.close()

if __name__ == "__main__":
    seed_data()
