from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from typing import List

router = APIRouter(
    prefix="/api/assets",  # Note the /api prefix for the proxy
    tags=["Assets & Hierarchy"]
)

@router.get("/splitters", response_model=List[schemas.Splitter])
def get_all_splitters(db: Session = Depends(get_db)):
    """ Get a list of all splitters. """
    splitters = db.query(models.Splitter).all()
    return splitters

@router.get("/fdhs", response_model=List[schemas.FDH])
def get_all_fdhs(db: Session = Depends(get_db)):
    """ Get a list of all FDHs and their nested splitters. """
    fdhs = db.query(models.FDH).all()
    return fdhs

@router.post("/assets", response_model=schemas.Asset, status_code=201)
def create_asset(asset: schemas.AssetCreate, db: Session = Depends(get_db)):
    """ Add a new asset to the inventory. """
    db_asset = db.query(models.Asset).filter(models.Asset.serial_number == asset.serial_number).first()
    if db_asset:
        raise HTTPException(status_code=400, detail="Asset with this serial number already exists")
    
    new_asset = models.Asset(**asset.model_dump())
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset
