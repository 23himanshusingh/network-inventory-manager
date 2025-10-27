from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import models, schemas, crud
from database import get_db
from typing import List, Dict, Any

router = APIRouter(
    prefix="/api/topology",
    tags=["Topology & Visualization"]
)

def format_node(item_id: str, label: str, type: str, status: str, x: int, y: int) -> Dict[str, Any]:
    """ Helper function to create a node for React Flow """
    
    # Map our asset status to a "faulty" flag
    is_faulty = status in ['Faulty', 'Retired', 'Inactive', 'Disconnected']
    
    return {
        "id": item_id,
        "position": {"x": x, "y": y},
        "data": {
            "label": label,
            "type": type,
            "status": status,
            "isFaulty": is_faulty
        },
        "type": "custom" # This will match our custom node in React
    }

def format_edge(source_id: str, target_id: str) -> Dict[str, Any]:
    """ Helper function to create an edge for React Flow """
    return {
        "id": f"e-{source_id}-to-{target_id}",
        "source": source_id,
        "target": target_id,
        "animated": False
    }

@router.get("/customer/{customer_id}")
def get_customer_topology(customer_id: int, db: Session = Depends(get_db)):
    """
    Generate the full network path for a single customer.
    Traverses: Headend -> FDH -> Splitter -> Customer -> ONT/Router
    """
    nodes = []
    edges = []
    
    customer = crud.get_customer_by_id(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    y_pos = 0
    
    # 1. Customer Node
    cust_id = f"cust-{customer.customer_id}"
    nodes.append(format_node(
        cust_id, customer.name, "customer", customer.status, 250, y_pos
    ))
    
    # 2. Customer Assets (ONT/Router)
    # We will implement this in the next sprint (Asset Assignment)
    # For now, we'll just show the customer
    
    if not customer.splitter_id:
        # Customer is not assigned, return just the customer node
        return {"nodes": nodes, "edges": edges}

    # 3. Splitter Node
    y_pos += 150
    splitter = crud.get_splitter_by_id(db, customer.splitter_id)
    split_id = f"split-{splitter.splitter_id}"
    nodes.append(format_node(
        split_id, f"Splitter {splitter.model} ({splitter.location})", "splitter", "Online", 250, y_pos
    ))
    edges.append(format_edge(split_id, cust_id))
    
    # 4. FDH Node
    y_pos += 150
    fdh = crud.get_fdh_by_id(db, splitter.fdh_id)
    fdh_id = f"fdh-{fdh.fdh_id}"
    nodes.append(format_node(
        fdh_id, f"FDH {fdh.name}", "fdh", "Online", 250, y_pos
    ))
    edges.append(format_edge(fdh_id, split_id))
    
    # 5. Headend Node
    y_pos += 150
    headend = db.query(models.Headend).filter(models.Headend.headend_id == fdh.headend_id).first()
    if headend:
        head_id = f"headend-{headend.headend_id}"
        nodes.append(format_node(
            head_id, f"Headend {headend.name}", "headend", "Online", 250, y_pos
        ))
        edges.append(format_edge(head_id, fdh_id))

    return {"nodes": nodes, "edges": edges}

@router.get("/fdh/{fdh_id}")
def get_fdh_topology(fdh_id: int, db: Session = Depends(get_db)):
    """
    Generate the topology for an FDH, showing its parent and all
    child splitters and their connected customers.
    """
    nodes = []
    edges = []
    
    fdh = crud.get_fdh_by_id(db, fdh_id)
    if not fdh:
        raise HTTPException(status_code=404, detail="FDH not found")

    # 1. FDH Node (Root)
    fdh_node_id = f"fdh-{fdh.fdh_id}"
    nodes.append(format_node(fdh_node_id, f"FDH {fdh.name}", "fdh", "Online", 400, 50))
    
    # 2. Parent Headend
    if fdh.headend_id:
        headend = db.query(models.Headend).filter(models.Headend.headend_id == fdh.headend_id).first()
        if headend:
            head_id = f"headend-{headend.headend_id}"
            nodes.append(format_node(head_id, f"Headend {headend.name}", "headend", "Online", 400, 250))
            edges.append(format_edge(head_id, fdh_node_id))
            
    # 3. Child Splitters
    splitters = db.query(models.Splitter).filter(models.Splitter.fdh_id == fdh.fdh_id).all()
    for i, splitter in enumerate(splitters):
        split_id = f"split-{splitter.splitter_id}"
        split_x_pos = (i * 200) # Spread splitters horizontally
        nodes.append(format_node(
            split_id, f"Splitter {splitter.model} ({splitter.location})", "splitter", "Online", split_x_pos, -150
        ))
        edges.append(format_edge(fdh_node_id, split_id))
        
        # 4. Child Customers
        customers = db.query(models.Customer).filter(models.Customer.splitter_id == splitter.splitter_id).all()
        for j, customer in enumerate(customers):
            cust_id = f"cust-{customer.customer_id}"
            cust_x_pos = split_x_pos + (j * 50) # Stagger customers slightly
            cust_y_pos = -250
            nodes.append(format_node(
                cust_id, customer.name, "customer", customer.status, cust_x_pos, cust_y_pos
            ))
            edges.append(format_edge(split_id, cust_id))

    return {"nodes": nodes, "edges": edges}

@router.get("/search")
def search_topology(
    serial: str | None = Query(None),
    db: Session = Depends(get_db)
):
    """
    Search for a device by its serial number and return the topology
    for the customer it's assigned to.
    """
    if not serial:
        raise HTTPException(status_code=400, detail="Serial number is required")
        
    # For now, we only search inventory assets (ONT/Router)
    asset = db.query(models.Asset).filter(models.Asset.serial_number == serial).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset with this serial number not found")
        
    # Check if this asset is assigned
    assignment = db.query(models.AssignedAssets).filter(models.AssignedAssets.asset_id == asset.asset_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Asset is not assigned to a customer")
        
    # Return the topology for the customer this asset is assigned to
    return get_customer_topology(assignment.customer_id, db)
