# services/evaluator.py
import os
import json
from dotenv import load_dotenv
from groq import Groq


# load the GROQ_API_KEY from the .env file
load_dotenv()


# initialize the Groq client once so we reuse the same connection
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def evaluate_answer(role: str, question: str, answer: str) -> dict:

    # count words in the answer — strip removes leading/trailing spaces first
    word_count = len(answer.strip().split())

    # if someone just types "a" or "ok" or leaves near-empty input,
    # we skip the API call entirely and return 0 straight away
    if word_count < 5:
        return {
            "score": 0,
            "feedback": "No meaningful answer was provided. A single word or random characters do not count as an attempt.",
            "suggestion": "Read the question carefully and write a proper response with at least a few sentences explaining your approach or understanding.",
            # still fetch a sample answer so the user can learn from it
            "sample_answer": generate_sample_answer(role, question)
        }

    # build the evaluation prompt with a strict scoring rubric
    # this forces the model to score honestly instead of being generous
    prompt = f"""You are a strict technical interviewer evaluating a candidate's answer.

Role: {role}
Question: {question}
Candidate's Answer: {answer}

Scoring rules (follow these strictly, do not be lenient):
- 0: No answer, single word, random characters, or completely irrelevant response
- 1-3: Extremely vague, no technical depth, missing all key points
- 4-5: Partial answer, mentions some relevant terms but lacks proper explanation
- 6-7: Decent answer with some correct points but missing important details
- 8-9: Strong answer covering most key aspects clearly and correctly
- 10: Perfect, complete, well-structured answer covering all points in depth

Evaluate the answer and respond in this exact JSON format:
{{
    "score": <number from 0 to 10>,
    "feedback": "<detailed feedback on the answer>",
    "suggestion": "<specific tips on how to improve this answer>",
    "sample_answer": "<a strong sample answer for this question>"
}}

Return ONLY the JSON. No extra text, no markdown, no code blocks."""

    # send the prompt to Groq and wait for the response
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=600,
        # lower temperature = more consistent and less random scoring
        temperature=0.5
    )

    # pull the raw text out of the response and strip whitespace
    result = response.choices[0].message.content.strip()

    # parse it as JSON and return the dict to the route handler
    return json.loads(result)


def generate_sample_answer(role: str, question: str) -> str:
    # this is only called when the user's answer was too short
    # we still want to show them a good answer so the session is useful
    sample_prompt = f"""You are an expert {role}. Provide a strong, detailed sample answer for this interview question:

Question: {question}

Return ONLY the answer text. No labels, no extra formatting."""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": sample_prompt}],
        max_tokens=400,
        temperature=0.5
    )

    # return just the text content from the response
    return response.choices[0].message.content.strip()