"""
FastAPI router for financial reports (Profit & Loss Statement) and dashboard summary metrics.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ProfitLossResponse
from app import crud

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/profit-loss", response_model=ProfitLossResponse)
def read_profit_loss(
    start_date: Optional[str] = Query(None, description="ISO format start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="ISO format end date YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    """Retrieve Profit & Loss statement report."""
    return crud.get_profit_loss_report(db, start_date=start_date, end_date=end_date)
