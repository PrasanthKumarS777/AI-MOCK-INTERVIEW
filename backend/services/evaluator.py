import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def evaluate_answer(role: str, question: str, answer: str) -> dict:
    prompt = f"""You are an expert technical interviewer evaluating a candidate's answer.

Role: {role}
Question: {question}
Candidate's Answer: {answer}

Evaluate the answer and respond in this exact JSON format:
{{
    "score": <number from 1 to 10>,
    "feedback": "<detailed feedback on the answer>",
    "suggestion": "<specific tips on how to improve this answer>",
    "sample_answer": "<a strong sample answer for this question>"
}}

Return ONLY the JSON. No extra text, no markdown, no code blocks."""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=600,
        temperature=0.5
    )

    result = response.choices[0].message.content.strip()
    return json.loads(result)