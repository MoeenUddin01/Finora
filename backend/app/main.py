"""
Main application entrypoint for Finora FastAPI Backend.
Configures CORS, registers API routers, and seeds startup data.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.seed import seed_data
from app.routers import (
    customers, suppliers, items, taxes, invoices, reports
)

# Initialize database schema and default seed data
Base.metadata.create_all(bind=engine)
seed_data()

app = FastAPI(
    title="Finora Accounting API",
    description="Backend API for Finora - Customers, Suppliers, Items, Invoices, Taxation, and Profit & Loss Reporting",
    version="1.0.0"
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(customers.router)
app.include_router(suppliers.router)
app.include_router(items.router)
app.include_router(taxes.router)
app.include_router(invoices.router)
app.include_router(reports.router)

@app.get("/api/health", tags=["Health Check"])
def health_check():
    """System health check endpoint."""
    return {"status": "ok", "app": "Finora Accounting API", "version": "1.0.0"}
