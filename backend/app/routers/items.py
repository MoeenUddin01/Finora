"""
FastAPI router for inventory Item operations.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ItemCreate, ItemResponse
from app import crud

router = APIRouter(prefix="/api/items", tags=["Items"])

@router.get("", response_model=List[ItemResponse])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve all inventory product/service items."""
    return crud.get_items(db, skip=skip, limit=limit)

@router.get("/{item_id}", response_model=ItemResponse)
def read_item(item_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific item by ID."""
    item = crud.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.post("", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(item_in: ItemCreate, db: Session = Depends(get_db)):
    """Create a new product or service item."""
    return crud.create_item(db, item_in)
