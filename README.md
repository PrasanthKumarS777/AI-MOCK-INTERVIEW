# AI Mock Interview

A full-stack mock interview platform that generates role-specific technical questions using the Groq LLM API and evaluates your answers in real time with detailed feedback.

Built with **Next.js** on the frontend and **FastAPI** on the backend. No login required — just pick a role, pick a difficulty, and start practicing.

***

## What it does

- Picks a job role and difficulty level from the home screen
- Generates 5 unique interview questions using Llama 3.1 via Groq
- Accepts your typed answer and sends it for AI evaluation
- Returns a score out of 10, feedback, improvement tips, and a sample answer
- Shows a full session summary with per-question breakdown at the end

***

## Project structure

```
ai-mock-interview/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── models/
│   │   └── schemas.py          # Pydantic request/response models
│   ├── routes/
│   │   ├── interview.py        # /interview/start and /interview/next
│   │   └── evaluation.py       # /evaluation/submit
│   ├── services/
│   │   ├── question_generator.py   # Groq call to generate questions
│   │   └── evaluator.py            # Groq call to evaluate answers
│   ├── .env                    # API keys (never commit this)
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx            # Home screen — role and difficulty picker
│   │   ├── interview/
│   │   │   └── page.tsx        # Interview screen — questions and answers
│   │   └── summary/
│   │       └── page.tsx        # Final summary with scores
│   └── package.json
└── README.md
```

***

## Prerequisites

Make sure you have the following installed before starting:

- Python 3.10 or above
- Node.js 18 or above
- A free Groq API key from [https://console.groq.com](https://console.groq.com)

***

## Setup — Backend

**1. Navigate to the backend folder**

```bash
cd ai-mock-interview/backend
```

**2. Create and activate a virtual environment**

```bash
python -m venv venv

# Windows (Git Bash or MINGW64)
source venv/Scripts/activate

# macOS / Linux
source venv/bin/activate
```

**3. Install dependencies**

```bash
pip install -r requirements.txt
```

**4. Create the `.env` file**

Create a file called `.env` inside the `backend/` folder with the following content:

```
GROQ_API_KEY=your_groq_api_key_here
```

Replace `your_groq_api_key_here` with your actual key from [https://console.groq.com/keys](https://console.groq.com/keys).

**5. Start the backend server**

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The API will be running at `http://127.0.0.1:8000`.

You can verify it works by visiting `http://127.0.0.1:8000/docs` in your browser — this opens the auto-generated Swagger UI.

***

## Setup — Frontend

Open a second terminal window and run the following:

**1. Navigate to the frontend folder**

```bash
cd ai-mock-interview/frontend
```

**2. Install dependencies**

```bash
npm install
```

**3. Build the app**

```bash
npm run build
```

**4. Start the frontend server**

```bash
npm start
```

The app will be available at `http://localhost:3000`.

> If you are actively making changes to the frontend code, use `npm run dev` instead of building every time.

***

## How to use

1. Open `http://localhost:3000`
2. Select a job role from the grid (e.g. Software Engineer, Data Scientist)
3. Select a difficulty level — Beginner, Intermediate, or Advanced
4. Click **Start Interview**
5. Read the question and type your answer in the text box
6. Click **Submit Answer**
7. Review your score, feedback, improvement tips, and the sample answer
8. Click **Next Question** and repeat for all 5 questions
9. After the final question, click **View Session Summary** to see your overall performance

***

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/interview/start` | Starts the session and returns the first question |
| POST | `/interview/next` | Returns the next question in the session |
| POST | `/evaluation/submit` | Evaluates the submitted answer and returns feedback |

***

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.10+ |
| AI | Groq API — Llama 3.1 8B Instant |
| Server | Uvicorn (ASGI) |

***

## Environment variables

| Variable | Where | Description |
|----------|-------|-------------|
| `GROQ_API_KEY` | `backend/.env` | Your Groq API key |

***

## .gitignore

Make sure your `.env` file is never pushed to GitHub. Your `.gitignore` should include at minimum:

```
backend/.env
backend/venv/
frontend/.next/
frontend/node_modules/
__pycache__/
*.pyc
```

***

## Common issues

**Backend returns 500 on `/interview/start`**
Check that your `GROQ_API_KEY` is correctly set in `backend/.env` and the virtual environment is activated before running uvicorn.

**Frontend shows "Error connecting to server"**
The backend is not running. Start it first with uvicorn before opening the app.

**`npm run build` fails with useSearchParams error**
The `interview/page.tsx` and `summary/page.tsx` components must wrap `useSearchParams()` inside a `<Suspense>` boundary. This is a Next.js 13+ requirement for static builds.

**Model decommissioned error from Groq**
The model name in `question_generator.py` and `evaluator.py` may be outdated. Use `llama-3.1-8b-instant` — check [https://console.groq.com/docs/models](https://console.groq.com/docs/models) for the current list.

***

## License

MIT