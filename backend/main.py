# main.py
# This is the entry point of our FastAPI backend server.
# It creates the app, sets up CORS so the frontend can talk to it,
# and registers all the route files (interview and evaluation).

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.interview import router as interview_router
from routes.evaluation import router as evaluation_router

# Create the FastAPI application instance
# The title and version show up in the auto-generated API docs at /docs
app = FastAPI(
    title="AI Mock Interview API",
    version="1.0.0"
)

# -----------------------------------------------------------------------
# CORS (Cross-Origin Resource Sharing) setup
# Without this, the browser will block requests from the frontend
# because the frontend (port 3000) and backend (port 8000) are different origins
# We allow both localhost:3000 and 127.0.0.1:3000 because browsers
# sometimes treat these two as different origins even though they
# both point to the same machine
# -----------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    # Allow all HTTP methods like GET, POST, PUT, DELETE
    allow_methods=["*"],
    # Allow all headers including Authorization and Content-Type
    allow_headers=["*"],
)

# -----------------------------------------------------------------------
# Register route files
# Each router handles a specific group of related API endpoints
# /interview  → handles starting a session and generating questions
# /evaluation → handles evaluating the user's answers
# -----------------------------------------------------------------------
app.include_router(interview_router, prefix="/interview", tags=["Interview"])
app.include_router(evaluation_router, prefix="/evaluation", tags=["Evaluation"])


# -----------------------------------------------------------------------
# Root endpoint - just a health check to confirm the server is running
# Visit http://127.0.0.1:8000 to see this response
# -----------------------------------------------------------------------
@app.get("/")
def root():
    return {"message": "AI Mock Interview API is running"}