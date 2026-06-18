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
# This tells the browser which frontend origins are allowed to call our API.
# During development, our React app runs on localhost:5173.
# During production, it will be our Vercel URL.
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
# We attach our facility router with a prefix of "/api"
# This means our endpoint becomes: GET /api/facility/{ccn}
app.include_router(facility_router, prefix="/api")


# --- Health Check Endpoint ---
# A simple endpoint to verify the server is running.
# Render and other deployment platforms use this to check if the app is alive.
@app.get("/")
async def health_check():
    return {
        "status": "healthy",
        "service": "Medelite Facility Assessment API",
        "version": "1.0.0",
    }