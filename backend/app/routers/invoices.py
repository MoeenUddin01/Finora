"""
FastAPI router for Sales & Purchase Invoice endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import InvoiceCreate, InvoiceResponse
from app import crud

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])

@router.get("", response_model=List[InvoiceResponse])
def read_invoices(
    type: Optional[str] = Query(None, description="Filter by invoice type: SALES or PURCHASE"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Retrieve invoices optionally filtered by type (SALES or PURCHASE)."""
    return crud.get_invoices(db, invoice_type=type, skip=skip, limit=limit)

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def read_invoice(invoice_id: int, db: Session = Depends(get_db)):
    """Retrieve full invoice details by ID."""
    invoice = crud.get_invoice(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.post("", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(invoice_in: InvoiceCreate, db: Session = Depends(get_db)):
    """Create a new Sales or Purchase invoice."""
    return crud.create_invoice(db, invoice_in)

@router.patch("/{invoice_id}/status", response_model=InvoiceResponse)
def update_invoice_status(invoice_id: int, new_status: str = Query(..., description="DRAFT, PAID, CANCELLED"), db: Session = Depends(get_db)):
    """Update invoice payment or status state."""
    invoice = crud.update_invoice_status(db, invoice_id, new_status)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice
