# evaluator.py
# This service handles AI-based evaluation of user answers.
# It sends the question and answer to Gemini and parses back
# a structured score, feedback, and improvement suggestion.

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure Gemini with our API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-flash")


def evaluate_answer(role: str, question: str, answer: str) -> dict:
    """
    Evaluates a candidate's answer to an interview question.

    Args:
        role: The job role context for fair evaluation
        question: The interview question that was asked
        answer: The candidate's answer to evaluate

    Returns:
        A dictionary with keys: score, feedback, suggestion, sample_answer
    """

    # We ask Gemini to return JSON so we can easily parse it
    # This avoids messy text parsing and keeps the response structured
    prompt = f"""
    You are an expert interviewer evaluating a candidate for a {role} position.

    Interview Question: {question}
    Candidate's Answer: {answer}

    Evaluate the answer and respond ONLY with a valid JSON object in this exact format:
    {{
        "score": <number from 1 to 10>,
        "feedback": "<what was good and what was weak about this answer>",
        "suggestion": "<specific advice on how to improve this answer>",
        "sample_answer": "<a well-structured sample answer to this question>"
    }}

    Scoring guide:
    - 1 to 3: Off-topic or completely incorrect
    - 4 to 6: Partially correct but missing key points
    - 7 to 8: Good answer with minor gaps
    - 9 to 10: Excellent, complete, and well-structured answer

    Return ONLY the JSON. No extra text before or after it.
    """

    response = model.generate_content(prompt)
    raw_text = response.text.strip()

    # Sometimes Gemini wraps JSON in markdown code blocks like ```json ... ```
    # We clean that up before parsing
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```")[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]

    # Parse the cleaned JSON string into a Python dictionary
    result = json.loads(raw_text.strip())

    return result