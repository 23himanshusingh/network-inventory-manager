from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import models, schemas, crud
from database import get_db
from typing import List

router = APIRouter(
    prefix="/api/inventory-assets", # Changed prefix
    tags=["Inventory Assets"]
)

@router.post("/", response_model=schemas.Asset, status_code=201)
def create_new_asset(asset: schemas.AssetCreate, db: Session = Depends(get_db)):
    """ Add a new asset to the inventory (ONT, Router, etc.). """
    return crud.create_asset(db=db, asset=asset)

@router.get("/", response_model=List[schemas.Asset])
def read_assets(
    asset_type: schemas.AssetType | None = Query(None), # Use Query for clarity
    status: schemas.AssetStatus | None = Query(None),
    location: str | None = Query(None, description="Filter by location (partial match)"), # Add this
    db: Session = Depends(get_db)
):
    """ Get a list of all assets, with optional filtering. """
    return crud.get_assets(
        db=db, 
        asset_type=asset_type, 
        status=status, 
        location=location  # Pass it to the crud function
    )

@router.get("/{asset_id}", response_model=schemas.Asset)
def read_asset(asset_id: int, db: Session = Depends(get_db)):
    """ Get a single asset by its ID. """
    db_asset = crud.get_asset_by_id(db, asset_id)
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return db_asset

@router.put("/{asset_id}", response_model=schemas.Asset)
def update_existing_asset(asset_id: int, asset_update: schemas.AssetUpdate, db: Session = Depends(get_db)):
    """ Update an asset's status or location. """
    return crud.update_asset(db=db, asset_id=asset_id, asset_update=asset_update)

@router.delete("/{asset_id}", response_model=schemas.Asset)
def retire_asset(asset_id: int, db: Session = Depends(get_db)):
    """ 'Delete' an asset by setting its status to Retired (soft delete). """
    return crud.delete_asset(db=db, asset_id=asset_id)