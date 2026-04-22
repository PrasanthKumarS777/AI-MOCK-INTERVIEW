// interview/page.tsx
// This is the main interview screen where the actual mock interview happens.
// It fetches questions from the backend, shows them one by one,
// captures the user's answer, sends it for evaluation,
// and displays the score and feedback after each answer.

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// This defines the shape of the evaluation result we get back from the backend
interface EvaluationResult {
  score: number;
  feedback: string;
  suggestion: string;
  sample_answer: string;
}

// Total number of questions per interview session
const TOTAL_QUESTIONS = 5;

// Backend API base URL — this is where our FastAPI server is running
const API_BASE = "http://localhost:8000";

export default function InterviewPage() {
  // Read the role and difficulty from the URL query parameters
  // e.g. /interview?role=Software Engineer&difficulty=intermediate
  const searchParams = useSearchParams();
  const router = useRouter();

  const role = searchParams.get("role") || "";
  const difficulty = searchParams.get("difficulty") || "";

  // The current question fetched from the AI
  const [question, setQuestion] = useState("");

  // The answer typed by the user in the text area
  const [answer, setAnswer] = useState("");

  // Stores the evaluation result after submitting an answer
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  // Tracks which question number we are on (1 to 5)
  const [questionNumber, setQuestionNumber] = useState(1);

  // Controls loading state while waiting for AI responses
  const [isLoading, setIsLoading] = useState(false);

  // Stores all question-answer-evaluation history for the session summary
  const [sessionHistory, setSessionHistory] = useState<
    { question: string; answer: string; score: number }[]
  >([]);

  // When the page loads, automatically fetch the first question
  useEffect(() => {
    if (role && difficulty) {
      fetchFirstQuestion();
    }
  }, [role, difficulty]);

  // Calls the /interview/start endpoint to get the very first question
  const fetchFirstQuestion = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, difficulty }),
      });
      const data = await response.json();
      setQuestion(data.question);
    } catch (error) {
      // If the backend is unreachable, show a helpful error message
      setQuestion("Error connecting to server. Please make sure the backend is running.");
    }
    setIsLoading(false);
  };

  // Sends the user's answer to the backend for AI evaluation
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/evaluation/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, question, answer }),
      });
      const data = await response.json();
      setEvaluation(data);

      // Save this Q&A pair to session history for the final summary
      setSessionHistory((prev) => [
        ...prev,
        { question, answer, score: data.score },
      ]);
    } catch (error) {
      alert("Error evaluating answer. Please check if backend is running.");
    }
    setIsLoading(false);
  };

  // Moves to the next question or redirects to summary if all 5 are done
  const handleNextQuestion = async () => {
    // If we have completed all questions, go to the summary page
    if (questionNumber >= TOTAL_QUESTIONS) {
      // Pass the session data as a URL parameter to the summary page
      const summaryData = encodeURIComponent(JSON.stringify(sessionHistory));
      router.push(`/summary?data=${summaryData}&role=${encodeURIComponent(role)}`);
      return;
    }

    // Reset state for the next question
    setEvaluation(null);
    setAnswer("");
    setIsLoading(true);
    setQuestionNumber((prev) => prev + 1);

    // Fetch the next question from the backend
    try {
      const response = await fetch(`${API_BASE}/interview/next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, difficulty }),
      });
      const data = await response.json();
      setQuestion(data.question);
    } catch (error) {
      setQuestion("Error fetching next question. Please check the backend.");
    }
    setIsLoading(false);
  };

  // Shows a score color — green for high, yellow for mid, red for low
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 5) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header showing role, difficulty and question progress */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{role}</h1>
            <p className="text-sm text-slate-500 capitalize">{difficulty} level interview</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-slate-600">
              Question {questionNumber} of {TOTAL_QUESTIONS}
            </span>
            {/* Progress bar showing how far through the interview we are */}
            <div className="w-32 h-2 bg-slate-200 rounded-full mt-1">
              <div
                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${(questionNumber / TOTAL_QUESTIONS) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-4">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-3">
            Interview Question
          </p>

          {/* Show loading spinner while waiting for AI to generate question */}
          {isLoading && !question ? (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Generating question...</span>
            </div>
          ) : (
            <p className="text-slate-800 text-base leading-relaxed">{question}</p>
          )}
        </div>

        {/* Answer Input — only shown when evaluation hasn't happened yet */}
        {!evaluation && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Your Answer
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={5}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700
                focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
            <button
              onClick={handleSubmitAnswer}
              disabled={!answer.trim() || isLoading}
              className="mt-3 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold
                rounded-xl transition-all duration-200 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "Evaluating..." : "Submit Answer"}
            </button>
          </div>
        )}

        {/* Evaluation Result — shown after the user submits an answer */}
        {evaluation && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-4">

            {/* Score display */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                AI Feedback
              </h2>
              <span className={`text-2xl font-bold ${getScoreColor(evaluation.score)}`}>
                {evaluation.score}/10
              </span>
            </div>

            {/* Feedback section */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Feedback</p>
              <p className="text-sm text-slate-700 leading-relaxed">{evaluation.feedback}</p>
            </div>

            {/* Suggestion section */}
            <div className="mb-4 bg-yellow-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-yellow-700 uppercase mb-1">How to Improve</p>
              <p className="text-sm text-yellow-800 leading-relaxed">{evaluation.suggestion}</p>
            </div>

            {/* Sample better answer */}
            {evaluation.sample_answer && (
              <div className="bg-green-50 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-green-700 uppercase mb-1">Sample Answer</p>
                <p className="text-sm text-green-800 leading-relaxed">{evaluation.sample_answer}</p>
              </div>
            )}

            {/* Next Question or Finish button */}
            <button
              onClick={handleNextQuestion}
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold
                rounded-xl transition-all duration-200"
            >
              {questionNumber >= TOTAL_QUESTIONS ? "View Session Summary →" : "Next Question →"}
            </button>
          </div>
        )}

      </div>
    </main>
  );
}