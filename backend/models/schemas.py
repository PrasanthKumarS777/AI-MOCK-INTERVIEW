# schemas.py
# This file defines the data models (shapes) for our API requests and responses.
# Pydantic models automatically validate incoming data and give clear error messages.
# First step: Importing the Libraries
from pydantic import BaseModel
from typing import Optional

# --------------------------------------------------------------------------
# Request model for starting a new interview session
# The frontend sends the job role and difficulty level chosen by the user
# --------------------------------------------------------------------------
class InterviewStartRequest(BaseModel):
    role: str           # e.g. "Software Engineer", "HR Manager"
    difficulty: str     # e.g. "beginner", "intermediate", "advanced"

# --------------------------------------------------------------------------
# Request model for submitting an answer during the interview
# The frontend sends the current question and the user's typed answer
# --------------------------------------------------------------------------
class AnswerSubmitRequest(BaseModel):
    role: str           # keeping role context so AI evaluates accordingly
    question: str       # the question that was asked
    answer: str         # the user's answer to evaluate

# --------------------------------------------------------------------------
# Response model for a generated interview question
# The backend sends back a single question string to display on screen
# --------------------------------------------------------------------------
class QuestionResponse(BaseModel):
    question: str       # the AI generated question

# --------------------------------------------------------------------------
# Response model for evaluation result after the user submits an answer
# Contains score, feedback, and a suggested better answer
# --------------------------------------------------------------------------
class EvaluationResponse(BaseModel):
    score: int                        # score out of 10
    feedback: str                     # what was good or bad about the answer
    suggestion: str                   # how to improve the answer
    sample_answer: Optional[str] = None  # a better version of the answer (optional but i feel like adding it)