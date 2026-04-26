# services/question_generator.py
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_question(role: str, difficulty: str, previous_questions: list = []) -> str:
    prev_q_text = ""
    if previous_questions:
        prev_q_text = "Do NOT repeat these already asked questions:\n" + "\n".join(f"- {q}" for q in previous_questions)

    prompt = f"""You are an expert technical interviewer.
Generate ONE {difficulty} level interview question for a {role} position.
{prev_q_text}
Return ONLY the question. No explanation, no numbering, no extra text."""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
        temperature=0.7
    )
    return response.choices[0].message.content.strip()