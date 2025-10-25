from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas
from passlib.context import CryptContext
from fastapi import HTTPException

# --- User / Auth ---
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


# --- Asset CRUD ---

def create_asset(db: Session, asset: schemas.AssetCreate):
    """Create a new inventory asset (ONT, Router, etc.)"""
    db_asset = db.query(models.Asset).filter(models.Asset.serial_number == asset.serial_number).first()
    if db_asset:
        raise HTTPException(status_code=400, detail="Asset with this serial number already exists")
    
    new_asset = models.Asset(**asset.model_dump())
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset

def get_asset_by_id(db: Session, asset_id: int):
    """Get a single asset by its ID"""
    return db.query(models.Asset).filter(models.Asset.asset_id == asset_id).first()



def get_assets(db: Session, 
             asset_type: schemas.AssetType | None = None, 
             status: schemas.AssetStatus | None = None, 
             location: str | None = None,  # Add this parameter
             skip: int = 0, 
             limit: int = 100):
    """Get a list of assets with optional filters for type, status, and location"""
    query = db.query(models.Asset)
    
    if asset_type:
        query = query.filter(models.Asset.asset_type == asset_type)
    if status:
        query = query.filter(models.Asset.status == status)
    if location:  # Add this block
        # Use .ilike() for case-insensitive partial matching
        query = query.filter(models.Asset.location.ilike(f"%{location}%")) 
        
    return query.offset(skip).limit(limit).all()


def update_asset(db: Session, asset_id: int, asset_update: schemas.AssetUpdate):
    """Update an asset's details (e.g., status, location)"""
    db_asset = get_asset_by_id(db, asset_id)
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    update_data = asset_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_asset, key, value)
    
    # --- AUDIT LOG ---
    # Log the change
    log_description = f"Updated asset {db_asset.serial_number}. "
    log_description += f"Changes: {', '.join([f'{k}: {v}' for k, v in update_data.items()])}"
    
    audit_log = models.AuditLog(
        action_type="Asset Update",
        description=log_description,
        user_id=1 # Hardcoding to admin for now. We will fix this in the auth sprint.
    )
    db.add(audit_log)
    # --- END AUDIT LOG ---

    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

def delete_asset(db: Session, asset_id: int):
    """'Delete' an asset by setting its status to Retired (soft delete)"""
    db_asset = get_asset_by_id(db, asset_id)
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    db_asset.status = schemas.AssetStatus.Retired
    
    # Log this action
    audit_log = models.AuditLog(
        action_type="Asset Retired",
        description=f"Retired asset {db_asset.serial_number} (ID: {asset_id})",
        user_id=1 # Hardcode admin user
    )
    db.add(audit_log)

    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset


# --- Hierarchy CRUD ---

def create_headend(db: Session, headend: schemas.HeadendCreate):
    new_headend = models.Headend(**headend.model_dump())
    db.add(new_headend)
    db.commit()
    db.refresh(new_headend)
    return new_headend

def get_headends(db: Session):
    return db.query(models.Headend).all()

def create_fdh(db: Session, fdh: schemas.FDHCreate):
    new_fdh = models.FDH(**fdh.model_dump())
    db.add(new_fdh)
    db.commit()
    db.refresh(new_fdh)
    return new_fdh

def get_fdhs(db: Session):
    return db.query(models.FDH).all()

def create_splitter(db: Session, splitter: schemas.SplitterCreate):
    new_splitter = models.Splitter(**splitter.model_dump())
    db.add(new_splitter)
    db.commit()
    db.refresh(new_splitter)
    return new_splitter

def get_splitters(db: Session):
    return db.query(models.Splitter).all()

def get_fdh_by_id(db: Session, fdh_id: int):
    return db.query(models.FDH).filter(models.FDH.fdh_id == fdh_id).first()

def get_splitter_by_id(db: Session, splitter_id: int):
    return db.query(models.Splitter).filter(models.Splitter.splitter_id == splitter_id).first()

def update_fdh(db: Session, fdh_id: int, fdh_update: schemas.FDHUpdate):
    """Update an FDH's details (name, location, etc.)"""
    db_fdh = get_fdh_by_id(db, fdh_id)
    if not db_fdh:
        raise HTTPException(status_code=404, detail="FDH not found")

    update_data = fdh_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_fdh, key, value)
    
    # --- AUDIT LOG ---
    log_description = f"Updated FDH {db_fdh.name}. "
    log_description += f"Changes: {', '.join([f'{k}: {v}' for k, v in update_data.items()])}"
    audit_log = models.AuditLog(
        action_type="FDH Update",
        description=log_description,
        user_id=1 # Hardcoding admin user for now
    )
    db.add(audit_log)
    # --- END AUDIT LOG ---

    db.add(db_fdh)
    db.commit()
    db.refresh(db_fdh)
    return db_fdh

def update_splitter(db: Session, splitter_id: int, splitter_update: schemas.SplitterUpdate):
    """Update a splitter's location or move it to a new FDH"""
    db_splitter = get_splitter_by_id(db, splitter_id)
    if not db_splitter:
        raise HTTPException(status_code=404, detail="Splitter not found")

    update_data = splitter_update.model_dump(exclude_unset=True)

    # --- Business Rule Check ---
    if "fdh_id" in update_data and db_splitter.used_ports > 0:
        raise HTTPException(
            status_code=400, 
            detail="Cannot move a splitter that has active customers. Please reassign customers first."
        )
    # --- End Business Rule Check ---

    for key, value in update_data.items():
        setattr(db_splitter, key, value)
    
    # --- AUDIT LOG ---
    log_description = f"Updated Splitter {db_splitter.splitter_id}. "
    log_description += f"Changes: {', '.join([f'{k}: {v}' for k, v in update_data.items()])}"
    audit_log = models.AuditLog(
        action_type="Splitter Update",
        description=log_description,
        user_id=1 # Hardcoding admin user for now
    )
    db.add(audit_log)
    # --- END AUDIT LOG ---

    db.add(db_splitter)
    db.commit()
    db.refresh(db_splitter)
    return db_splitter
    

# --- Customer CRUD (from Sprint 0) ---

def create_customer(db: Session, customer: schemas.CustomerCreate):
    new_customer = models.Customer(**customer.model_dump())
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer

def get_customers(db: Session):
    return db.query(models.Customer).all()

def get_customer_by_id(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.customer_id == customer_id).first()