# main.py
# This file creates the app instance, configures CORS, and registers routes.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.facility import router as facility_router

# Create the FastAPI application instance
# These metadata fields appear in the auto-generated API docs at /docs
app = FastAPI(
    title="Medelite Facility Assessment API",
    description="Fetches nursing home data from the CMS Provider Data Catalog",
    version="1.0.0",
)

# --- CORS Configuration ---

origins = [
    "http://localhost:5173",         # Vite dev server
    "http://localhost:3000",         # Fallback local port
    "https://*.vercel.app",          # Any Vercel deployment
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],             # Allow GET, POST, etc.
    allow_headers=["*"],             # Allow all headers
)

# --- Register Routers ---

app.include_router(facility_router, prefix="/api")


# --- Health Check Endpoint ---

@app.get("/")
async def health_check():
    return {
        "status": "healthy",
        "service": "Medelite Facility Assessment API",
        "version": "1.0.0",
    }