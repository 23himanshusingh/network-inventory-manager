from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Text, DECIMAL, Date
from sqlalchemy.orm import relationship
from database import Base
import datetime

# --- Hierarchy & Location Models ---

class Headend(Base):
    """ Main hub/central office. """
    __tablename__ = "Headend"
    headend_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    location = Column(String(255))
    
    # One-to-Many: Headend -> FDHs
    fdhs = relationship("FDH", back_populates="headend")

class FDH(Base):
    """ Fiber Distribution Hub (neighborhood cabinet). """
    __tablename__ = "FDH"
    fdh_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    location = Column(String(255))
    region = Column(String(100))
    max_ports = Column(Integer)
    
    headend_id = Column(Integer, ForeignKey("Headend.headend_id"))
    
    # Many-to-One: FDH -> Headend
    headend = relationship("Headend", back_populates="fdhs")
    # One-to-Many: FDH -> Splitters
    splitters = relationship("Splitter", back_populates="fdh")

class Splitter(Base):
    """ Optical splitter inside an FDH. """
    __tablename__ = "Splitter"
    splitter_id = Column(Integer, primary_key=True, index=True)
    model = Column(String(50))
    port_capacity = Column(Integer, nullable=False)
    used_ports = Column(Integer, default=0)
    location = Column(String(100)) # e.g., "Slot 3, Shelf 1"
    
    fdh_id = Column(Integer, ForeignKey("FDH.fdh_id"))
    
    # Many-to-One: Splitter -> FDH
    fdh = relationship("FDH", back_populates="splitters")
    # One-to-Many: Splitter -> Customers
    customers = relationship("Customer", back_populates="splitter")
    # One-to-Many: Splitter -> FiberDropLines
    drop_lines = relationship("FiberDropLine", back_populates="splitter")

# --- Customer & Asset Models ---

class Customer(Base):
    """ End-user customer profile. """
    __tablename__ = "Customer"
    customer_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    address = Column(Text)
    neighborhood = Column(String(100))
    plan = Column(String(50))
    connection_type = Column(Enum('Wired', 'Wireless'), default='Wired')
    status = Column(Enum('Active', 'Inactive', 'Pending'), default='Pending')
    assigned_port = Column(Integer) # Port number on the splitter
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    splitter_id = Column(Integer, ForeignKey("Splitter.splitter_id"), nullable=True)
    
    # Many-to-One: Customer -> Splitter
    splitter = relationship("Splitter", back_populates="customers")
    # One-to-Many: Customer -> AssignedAssets (Join Table)
    assigned_assets = relationship("AssignedAssets", back_populates="customer")
    # One-to-One: Customer -> FiberDropLine
    drop_line = relationship("FiberDropLine", back_populates="customer", uselist=False)
    # One-to-Many: Customer -> DeploymentTasks
    tasks = relationship("DeploymentTask", back_populates="customer")

class Asset(Base):
    """ A physical piece of hardware in inventory. """
    __tablename__ = "Asset"
    asset_id = Column(Integer, primary_key=True, index=True)
    asset_type = Column(Enum('ONT', 'Router', 'Splitter', 'FDH', 'Switch', 'CPE', 'FiberRoll'), nullable=False)
    model = Column(String(100))
    serial_number = Column(String(100), unique=True, index=True)
    status = Column(Enum('Available', 'Assigned', 'Faulty', 'Retired'), default='Available')
    location = Column(String(100)) # e.g., "Warehouse A", "Tech Van 3"
    
    # One-to-Many: Asset -> AssignedAssets (Join Table)
    assignments = relationship("AssignedAssets", back_populates="asset")

class AssignedAssets(Base):
    """ Join table linking Customers to their specific Assets (ONTs, Routers). """
    __tablename__ = "AssignedAssets"
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("Customer.customer_id"))
    asset_id = Column(Integer, ForeignKey("Asset.asset_id"))
    assigned_on = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Many-to-One: AssignedAssets -> Customer
    customer = relationship("Customer", back_populates="assigned_assets")
    # Many-to-One: AssignedAssets -> Asset
    asset = relationship("Asset", back_populates="assignments")

class FiberDropLine(Base):
    """ The physical fiber line from splitter to customer premises. """
    __tablename__ = "FiberDropLine"
    line_id = Column(Integer, primary_key=True, index=True)
    length_meters = Column(DECIMAL(6, 2))
    status = Column(Enum('Active', 'Disconnected'), default='Active')
    
    from_splitter_id = Column(Integer, ForeignKey("Splitter.splitter_id"))
    to_customer_id = Column(Integer, ForeignKey("Customer.customer_id"), unique=True)
    
    # Many-to-One: FiberDropLine -> Splitter
    splitter = relationship("Splitter", back_populates="drop_lines")
    # One-to-One: FiberDropLine -> Customer
    customer = relationship("Customer", back_populates="drop_line")

# --- User & Task Models ---

class Technician(Base):
    """ Field technician user. """
    __tablename__ = "Technician"
    technician_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    contact = Column(String(50))
    region = Column(String(100))
    
    # One-to-Many: Technician -> DeploymentTasks
    tasks = relationship("DeploymentTask", back_populates="technician")

class DeploymentTask(Base):
    """ A work order for installation or maintenance. """
    __tablename__ = "DeploymentTask"
    task_id = Column(Integer, primary_key=True, index=True)
    status = Column(Enum('Scheduled', 'InProgress', 'Completed', 'Failed'), default='Scheduled')
    scheduled_date = Column(Date)
    notes = Column(Text)
    
    customer_id = Column(Integer, ForeignKey("Customer.customer_id"))
    technician_id = Column(Integer, ForeignKey("Technician.technician_id"), nullable=True)
    
    # Many-to-One: DeploymentTask -> Customer
    customer = relationship("Customer", back_populates="tasks")
    # Many-to-One: DeploymentTask -> Technician
    technician = relationship("Technician", back_populates="tasks")

class User(Base):
    """ System user for role-based access control. """
    __tablename__ = "User"
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    role = Column(Enum('Planner', 'Technician', 'Admin', 'SupportAgent'), nullable=False)
    last_login = Column(DateTime)
    
    # One-to-Many: User -> AuditLogs
    logs = relationship("AuditLog", back_populates="user")

class AuditLog(Base):
    """ Tracks all changes made in the system. """
    __tablename__ = "AuditLog"
    log_id = Column(Integer, primary_key=True, index=True)
    action_type = Column(String(50))
    description = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    user_id = Column(Integer, ForeignKey("User.user_id"), nullable=True) # Nullable for system actions
    
    # Many-to-One: AuditLog -> User
    user = relationship("User", back_populates="logs")
