from fastapi import FastAPI
from database import engine
import models
from routers import assets, customers, hierarchy ,topology
from fastapi.middleware.cors import CORSMiddleware



models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Network Inventory Management API",
    description="API for managing broadband assets, customers, and deployments.",
    version="0.1.0"
)

# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# --- API Routers ---
app.include_router(assets.router)
app.include_router(customers.router)
app.include_router(hierarchy.router) # Add the new hierarchy router
app.include_router(topology.router)

# --- Root Endpoint ---
@app.get("/", tags=["Root"])
def read_root():
    """ A simple root endpoint to check if the API is running. """
    return {"message": "Welcome to the Network Inventory API"}