# interview.py
# Used comments in the code extensively for better readability and understanding.
# This file defines the API routes related to the interview session.
# It handles two things:
#   1. Starting a new interview and getting the first question
#   2. Getting the next question during an ongoing interview

from fastapi import APIRouter
from models.schemas import InterviewStartRequest, QuestionResponse
from services.question_generator import generate_question

# APIRouter groups related endpoints together
# We register this in main.py under the /interview prefix
router = APIRouter()

# -----------------------------------------------------------------------
# In-memory session store
# We store each session's asked questions in a dictionary
# Key = session_id (role + difficulty), Value = list of asked questions
# This ensures the AI doesn't repeat questions in the same session
# Note: This resets when the server restarts (no database needed for now)
# -----------------------------------------------------------------------
session_store = {}


@router.post("/start", response_model=QuestionResponse)
def start_interview(request: InterviewStartRequest):
    """
    Starts a new interview session.
    Accepts the job role and difficulty from the frontend,
    creates a fresh session, and returns the very first question.
    """

    # Build a unique key for this session using role and difficulty
    session_id = f"{request.role}_{request.difficulty}"

    # Clear any previous session with the same role/difficulty
    # This lets the user restart without leftover questions
    session_store[session_id] = []

    # Ask the AI to generate the first question
    # Pass empty list since no questions have been asked yet
    question = generate_question(
        role=request.role,
        difficulty=request.difficulty,
        previous_questions=[]
    )

    # Save this question so it won't be repeated later
    session_store[session_id].append(question)

    return QuestionResponse(question=question)


@router.post("/next", response_model=QuestionResponse)
def next_question(request: InterviewStartRequest):
    """
    Generates the next question in an ongoing interview session.
    Passes all previously asked questions to the AI
    so it generates something new and different.
    """

    # Retrieve the session using the same key format
    session_id = f"{request.role}_{request.difficulty}"

    # Get previously asked questions, or empty list if session not found
    previous = session_store.get(session_id, [])

    # Generate a new question that avoids repeating the previous ones
    question = generate_question(
        role=request.role,
        difficulty=request.difficulty,
        previous_questions=previous
    )

    # Add this new question to the session history
    previous.append(question)
    session_store[session_id] = previous

    return QuestionResponse(question=question)