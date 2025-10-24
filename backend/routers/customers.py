from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from typing import List

router = APIRouter(
    prefix="/api/customers", # Note the /api prefix
    tags=["Customers"]
)

@router.post("/", response_model=schemas.Customer, status_code=201)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    """ Create a new customer profile. """
    new_customer = models.Customer(**customer.model_dump())
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer

@router.get("/", response_model=List[schemas.Customer])
def get_all_customers(db: Session = Depends(get_db)):
    """ Get a list of all customers. """
    customers = db.query(models.Customer).all()
    return customers

@router.get("/{customer_id}", response_model=schemas.Customer)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """ Get a specific customer by their ID. """
    customer = db.query(models.Customer).filter(models.Customer.customer_id == customer_id).first()
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer
