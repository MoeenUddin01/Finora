"""
FastAPI router for Tax Rate configuration endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import TaxRateCreate, TaxRateResponse
from app import crud

router = APIRouter(prefix="/api/taxes", tags=["Tax Rates"])

@router.get("", response_model=List[TaxRateResponse])
def read_tax_rates(db: Session = Depends(get_db)):
    """Retrieve all active tax rates."""
    return crud.get_tax_rates(db)

@router.post("", response_model=TaxRateResponse, status_code=status.HTTP_201_CREATED)
def create_tax_rate(tax_in: TaxRateCreate, db: Session = Depends(get_db)):
    """Create a new tax rate rule."""
    return crud.create_tax_rate(db, tax_in)
