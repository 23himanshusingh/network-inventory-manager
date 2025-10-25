from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models, schemas, crud
from database import get_db
from typing import List

router = APIRouter(
    prefix="/api/network-hierarchy",
    tags=["Network Hierarchy"]
)

# --- Headends ---
@router.post("/headends", response_model=schemas.Headend, status_code=201)
def create_headend(headend: schemas.HeadendCreate, db: Session = Depends(get_db)):
    return crud.create_headend(db=db, headend=headend)

@router.get("/headends", response_model=List[schemas.Headend])
def get_all_headends(db: Session = Depends(get_db)):
    return crud.get_headends(db=db)

# --- FDHs ---
@router.post("/fdhs", response_model=schemas.FDH, status_code=201)
def create_fdh(fdh: schemas.FDHCreate, db: Session = Depends(get_db)):
    return crud.create_fdh(db=db, fdh=fdh)

@router.get("/fdhs", response_model=List[schemas.FDH])
def get_all_fdhs(db: Session = Depends(get_db)):
    return crud.get_fdhs(db=db)

@router.put("/fdhs/{fdh_id}", response_model=schemas.FDH) # --- NEW ---
def update_fdh(fdh_id: int, fdh_update: schemas.FDHUpdate, db: Session = Depends(get_db)):
    """ Update an FDH's details (name, location, region) """
    return crud.update_fdh(db=db, fdh_id=fdh_id, fdh_update=fdh_update)

# --- Splitters ---
@router.post("/splitters", response_model=schemas.Splitter, status_code=201)
def create_splitter(splitter: schemas.SplitterCreate, db: Session = Depends(get_db)):
    return crud.create_splitter(db=db, splitter=splitter)

@router.get("/splitters", response_model=List[schemas.Splitter])
def get_all_splitters(db: Session = Depends(get_db)):
    return crud.get_splitters(db=db)

@router.put("/splitters/{splitter_id}", response_model=schemas.Splitter) # --- NEW ---
def update_splitter(splitter_id: int, splitter_update: schemas.SplitterUpdate, db: Session = Depends(get_db)):
    """ Update a splitter's internal location or move it to a new FDH """
    return crud.update_splitter(db=db, splitter_id=splitter_id, splitter_update=splitter_update)