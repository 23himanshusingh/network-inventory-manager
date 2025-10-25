from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, crud # Import crud
from database import get_db
from typing import List

router = APIRouter(
    prefix="/api/customers", 
    tags=["Customers"]
)

@router.post("/", response_model=schemas.Customer, status_code=201)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    """ Create a new customer profile. """
    return crud.create_customer(db=db, customer=customer) # Use crud

@router.get("/", response_model=List[schemas.Customer])
def get_all_customers(db: Session = Depends(get_db)):
    """ Get a list of all customers. """
    return crud.get_customers(db=db) # Use crud

@router.get("/{customer_id}", response_model=schemas.Customer)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """ Get a specific customer by their ID. """
    customer = crud.get_customer_by_id(db, customer_id) # Use crud
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer