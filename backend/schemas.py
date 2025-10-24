from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
import datetime

# --- Role Enums ---
class UserRole(str, Enum):
    Planner = 'Planner'
    Technician = 'Technician'
    Admin = 'Admin'
    SupportAgent = 'SupportAgent'

class AssetStatus(str, Enum):
    Available = 'Available'
    Assigned = 'Assigned'
    Faulty = 'Faulty'
    Retired = 'Retired'

class CustomerStatus(str, Enum):
    Active = 'Active'
    Inactive = 'Inactive'
    Pending = 'Pending'

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class User(UserBase):
    user_id: int
    last_login: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

# --- Asset Schemas ---
class AssetType(str, Enum):
    ONT = 'ONT'
    Router = 'Router'
    Splitter = 'Splitter'
    FDH = 'FDH'
    Switch = 'Switch'
    CPE = 'CPE'
    FiberRoll = 'FiberRoll'

class AssetBase(BaseModel):
    asset_type: AssetType
    model: str
    serial_number: str
    location: Optional[str] = None

class AssetCreate(AssetBase):
    pass

class Asset(AssetBase):
    asset_id: int
    status: AssetStatus

    class Config:
        from_attributes = True

# --- Customer Schemas ---
class CustomerBase(BaseModel):
    name: str
    address: str
    plan: Optional[str] = None
    neighborhood: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    customer_id: int
    status: CustomerStatus
    splitter_id: Optional[int] = None
    assigned_port: Optional[int] = None
    
    class Config:
        from_attributes = True

# --- Hierarchy Schemas ---
class SplitterBase(BaseModel):
    model: str
    port_capacity: int
    location: Optional[str] = None

class SplitterCreate(SplitterBase):
    fdh_id: int

class Splitter(SplitterBase):
    splitter_id: int
    fdh_id: int
    used_ports: int
    
    class Config:
        from_attributes = True

class FDHBase(BaseModel):
    name: str
    location: str
    region: Optional[str] = None

class FDHCreate(FDHBase):
    headend_id: int
    max_ports: Optional[int] = None

class FDH(FDHBase):
    fdh_id: int
    headend_id: int
    
    # Show nested splitters
    splitters: List[Splitter] = [] 
    
    class Config:
        from_attributes = True
