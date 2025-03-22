# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Import routes
# from app.api.routes import router as api_router
from .api.routes import router as api_router

# Set up logging
logging.basicConfig(level=logging.INFO)

# Using FastAPI 
app = FastAPI()

# Enable CORS (Allow React frontend to access FastAPI)
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:3000"],  # Adjust if needed
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)

# Run the FastAPI app with Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001, reload=True)