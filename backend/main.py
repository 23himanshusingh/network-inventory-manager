from fastapi import FastAPI
from database import engine
import models
from routers import assets, customers # Import routers
from fastapi.middleware.cors import CORSMiddleware

# Create all database tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Network Inventory Management API",
    description="API for managing broadband assets, customers, and deployments.",
    version="0.1.0"
)

# --- Middleware ---
# Setup CORS to allow our Vite frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", # Vite default port
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods
    allow_headers=["*"], # Allow all headers
)


# --- API Routers ---
# Include the API endpoints from other files
app.include_router(assets.router)
app.include_router(customers.router)
# Add other routers here (e.g., tasks, users)


# --- Root Endpoint ---
@app.get("/", tags=["Root"])
def read_root():
    """ A simple root endpoint to check if the API is running. """
    return {"message": "Welcome to the Network Inventory API"}
