from database import SessionLocal, engine
import models
from passlib.context import CryptContext
import datetime  # Ensure datetime is imported for the task

# Setup password hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_database():
    db = SessionLocal()
    
    try:
        # Create all tables
        models.Base.metadata.create_all(bind=engine)
        
        # Check if DB is already seeded
        if db.query(models.User).count() > 0:
            print("Database already seeded. Skipping.")
            return

        print("Seeding database...")

        # --- 1. Create Users ---
        admin_user = models.User(
            username="admin",
            password_hash=get_password_hash("admin123"),
            role="Admin"
        )
        planner_user = models.User(
            username="planner",
            password_hash=get_password_hash("planner123"),
            role="Planner"
        )
        tech_user = models.User(
            username="tech",
            password_hash=get_password_hash("tech123"),
            role="Technician"
        )
        # --- ADDED SUPPORT AGENT ---
        support_user = models.User(
            username="support",
            password_hash=get_password_hash("support123"),
            role="SupportAgent"
        )
        db.add_all([admin_user, planner_user, tech_user, support_user]) # Added support_user
        db.commit()
        
        # --- 2. Create Technician Profile ---
        tech_profile = models.Technician(
            name="Bob The Builder",
            contact="555-1234",
            region="North"
        )
        db.add(tech_profile)
        db.commit()

        # --- 3. Create Network Hierarchy ---
        headend1 = models.Headend(name="Main Headend", location="123 Core St")
        db.add(headend1)
        db.commit()
        
        fdh1 = models.FDH(
            name="FDH-01-North",
            location="Corner of 1st and Main",
            region="North",
            max_ports=128,
            headend_id=headend1.headend_id
        )
        db.add(fdh1)
        db.commit()
        
        splitter1 = models.Splitter(
            model="1:32",
            port_capacity=32,
            location="Slot 1, Shelf 1",
            fdh_id=fdh1.fdh_id
        )
        splitter2 = models.Splitter(
            model="1:16",
            port_capacity=16,
            location="Slot 2, Shelf 1",
            fdh_id=fdh1.fdh_id
        )
        db.add_all([splitter1, splitter2])
        db.commit()

        # --- 4. Create Dummy Assets ---
        asset1 = models.Asset(asset_type="ONT", model="Nokia G-010G-A", serial_number="NK123456", status="Available", location="Warehouse A")
        asset2 = models.Asset(asset_type="Router", model="Netgear R7000", serial_number="NG789012", status="Available", location="Warehouse A")
        db.add_all([asset1, asset2])
        db.commit()
        
        # --- 5. Create Dummy Customer & Task ---
        customer1 = models.Customer(
            name="Alice Smith",
            address="456 Oak St",
            neighborhood="North",
            plan="1 GIG Fiber",
            status="Pending"
            # Not assigned to splitter yet, that's for the planner
        )
        db.add(customer1)
        db.commit()
        
        task1 = models.DeploymentTask(
            status="Scheduled",
            scheduled_date=datetime.date.today() + datetime.timedelta(days=2),
            notes="New customer installation. 1 GIG plan.",
            customer_id=customer1.customer_id,
            technician_id=tech_profile.technician_id
        )
        db.add(task1)
        db.commit()

        print("Database seeding complete!")

    except Exception as e:
        print(f"An error occurred during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

