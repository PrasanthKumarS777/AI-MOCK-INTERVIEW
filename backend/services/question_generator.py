# question_generator.py
# This service handles all AI question generation logic.
# It talks to the Gemini API and returns interview questions
# based on the job role and difficulty level provided.

import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load the GEMINI_API_KEY from the .env file into our environment
load_dotenv()

# Configure the Gemini client using the key from .env
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# We use gemini-1.5-flash because it is fast and free tier friendly
model = genai.GenerativeModel("gemini-1.5-flash")


def generate_question(role: str, difficulty: str, previous_questions: list = []) -> str:
    """
    Generates a single interview question for the given role and difficulty.

    Args:
        role: The job role e.g. 'Software Engineer'
        difficulty: One of 'beginner', 'intermediate', 'advanced'
        previous_questions: List of questions already asked this session
                            so the AI does not repeat them

    Returns:
        A single interview question as a plain string
    """

    # Build the list of already asked questions into the prompt
    # so the AI knows what to avoid repeating
    asked = "\n".join(previous_questions) if previous_questions else "None"

    # Craft a clear and specific prompt for the AI
    # The more specific the prompt, the better the question quality
    prompt = f"""
    You are an experienced interviewer conducting a {difficulty} level interview 
    for a {role} position.

    Generate exactly ONE interview question. 
    The question should be appropriate for {difficulty} level candidates.
    
    Questions already asked in this session (do NOT repeat these):
    {asked}

    Rules:
    - Return only the question, nothing else
    - No numbering, no explanation, no extra text
    - Make it specific to the {role} role
    """

    # Send the prompt to Gemini and get a response
    response = model.generate_content(prompt)

    # Extract and return the text from the response
    # .strip() removes any extra whitespace or newlines
    return response.text.strip()