"""
Automated integration tests for Finora API endpoints and accounting engine.
Verifies tracer bullet flow: Customers/Suppliers -> Items -> Invoices -> Journal Postings -> P&L Report.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.seed import seed_data

# Create isolated test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_finora.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_data(TestingSessionLocal())
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_health_check():
    """Verify system health check endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_customer_and_supplier_creation():
    """Verify Customer and Supplier creation via API."""
    cust_resp = client.post("/api/customers", json={
        "name": "Test Client Inc",
        "email": "test@client.com",
        "phone": "+123456789"
    })
    assert cust_resp.status_code == 201
    cust_data = cust_resp.json()
    assert cust_data["name"] == "Test Client Inc"
    assert cust_data["id"] is not None

    supp_resp = client.post("/api/suppliers", json={
        "name": "Test Vendor Corp",
        "email": "vendor@test.com"
    })
    assert supp_resp.status_code == 201
    supp_data = supp_resp.json()
    assert supp_data["name"] == "Test Vendor Corp"
    assert supp_data["id"] is not None

def test_sales_and_purchase_invoices_tracer_flow():
    """
    Tracer bullet end-to-end test:
    Creates item, creates sales invoice, creates purchase invoice,
    verifies auto-calculations and P&L financial report output.
    """
    # 1. Create Product Item
    item_resp = client.post("/api/items", json={
        "name": "Software License",
        "code": "SL-100",
        "sales_price": 500.0,
        "purchase_price": 200.0,
        "unit": "license"
    })
    assert item_resp.status_code == 201
    item_id = item_resp.json()["id"]

    # 2. Get active customer & supplier IDs
    customers = client.get("/api/customers").json()
    suppliers = client.get("/api/suppliers").json()
    cust_id = customers[0]["id"]
    supp_id = suppliers[0]["id"]

    # 3. Create Sales Invoice (2 licenses @ 500 = 1000 subtotal, 10% tax = 100 tax, 1100 total)
    sales_inv_resp = client.post("/api/invoices", json={
        "invoice_type": "SALES",
        "party_type": "CUSTOMER",
        "customer_id": cust_id,
        "status": "PAID",
        "items": [
            {
                "item_id": item_id,
                "quantity": 2.0,
                "unit_price": 500.0,
                "tax_rate_percent": 10.0
            }
        ]
    })
    assert sales_inv_resp.status_code == 201
    sales_inv = sales_inv_resp.json()
    assert sales_inv["subtotal"] == 1000.0
    assert sales_inv["tax_total"] == 100.0
    assert sales_inv["grand_total"] == 1100.0

    # 4. Create Purchase Invoice (3 licenses @ 200 = 600 subtotal, 5% tax = 30 tax, 630 total)
    purchase_inv_resp = client.post("/api/invoices", json={
        "invoice_type": "PURCHASE",
        "party_type": "SUPPLIER",
        "supplier_id": supp_id,
        "status": "PAID",
        "items": [
            {
                "item_id": item_id,
                "quantity": 3.0,
                "unit_price": 200.0,
                "tax_rate_percent": 5.0
            }
        ]
    })
    assert purchase_inv_resp.status_code == 201
    purchase_inv = purchase_inv_resp.json()
    assert purchase_inv["subtotal"] == 600.0
    assert purchase_inv["tax_total"] == 30.0
    assert purchase_inv["grand_total"] == 630.0

    # 5. Verify Profit & Loss Report
    pl_resp = client.get("/api/reports/profit-loss")
    assert pl_resp.status_code == 200
    pl_data = pl_resp.json()
    
    assert pl_data["total_sales_revenue"] == 1000.0
    assert pl_data["total_purchase_expense"] == 600.0
    assert pl_data["gross_profit"] == 400.0
    assert pl_data["net_profit"] == 400.0
    assert pl_data["total_tax_collected"] == 100.0
    assert pl_data["total_tax_paid"] == 30.0
