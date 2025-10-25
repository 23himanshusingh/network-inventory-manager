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

class AssetType(str, Enum):
    ONT = 'ONT'
    Router = 'Router'
    Splitter = 'Splitter'
    FDH = 'FDH'
    Switch = 'Switch'
    CPE = 'CPE'
    FiberRoll = 'FiberRoll'

class AssetStatus(str, Enum):
    Available = 'Available'
    Assigned = 'Assigned'
    Faulty = 'Faulty'
    Retired = 'Retired'

class CustomerStatus(str, Enum):
    Active = 'Active'
    Inactive = 'Inactive'
    Pending = 'Pending'

# --- User Schemas (Unchanged) ---
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

# --- Asset Schemas (Updated) ---
class AssetBase(BaseModel):
    asset_type: AssetType
    model: str
    serial_number: str
    location: Optional[str] = None

class AssetCreate(AssetBase):
    # Pass status on creation, default to Available
    status: AssetStatus = AssetStatus.Available

class AssetUpdate(BaseModel):
    # Define fields that are allowed to be updated
    model: Optional[str] = None
    status: Optional[AssetStatus] = None
    location: Optional[str] = None

class Asset(AssetBase):
    asset_id: int
    status: AssetStatus
    
    class Config:
        from_attributes = True

# --- Customer Schemas (Unchanged) ---
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

# --- Hierarchy Schemas (Updated) ---
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

# --- New Headend Schemas ---
class HeadendBase(BaseModel):
    name: str
    location: Optional[str] = None

class HeadendCreate(HeadendBase):
    pass

class Headend(HeadendBase):
    headend_id: int
    # Show nested FDHs
    fdhs: List[FDH] = [] 

    class Config:
        from_attributes = True

class SplitterUpdate(BaseModel):
    location: Optional[str] = None
    fdh_id: Optional[int] = None
    # We don't allow changing model/port_capacity, 
    # as that would be a replacement, not an update.

class FDHUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    region: Optional[str] = None
    max_ports: Optional[int] = None

class HeadendUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None