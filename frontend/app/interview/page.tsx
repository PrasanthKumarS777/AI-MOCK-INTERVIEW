"use client";

// these are the hooks we need — useState for local state, useEffect to run
// side effects (like fetching the first question on mount), and Suspense to
// handle the async nature of useSearchParams in Next.js 13+
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// shape of what comes back from the /evaluation/submit endpoint
// score is 0-10, and the rest are strings the AI fills in
interface EvaluationResult {
  score: number;
  feedback: string;
  suggestion: string;
  sample_answer: string;
}

// keeping these as constants so they're easy to tweak later
// if the interview length ever changes, this is the only place to update it
const TOTAL_QUESTIONS = 5;
const API_BASE = "http://127.0.0.1:8000";

// the actual page content is split into its own component because
// useSearchParams() needs to be wrapped in Suspense — Next.js requirement
function InterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // role and difficulty come in through the URL query string
  // e.g. /interview?role=Frontend+Engineer&difficulty=medium
  const role = searchParams.get("role") || "";
  const difficulty = searchParams.get("difficulty") || "";

  // question holds whatever the backend sends back for the current question
  const [question, setQuestion] = useState("");

  // user's typed response before they hit submit
  const [answer, setAnswer] = useState("");

  // null until the user submits — once set, the feedback panel replaces the text box
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  // tracks which question we're on out of TOTAL_QUESTIONS
  const [questionNumber, setQuestionNumber] = useState(1);

  // single loading flag covers both fetching questions and evaluating answers
  const [isLoading, setIsLoading] = useState(false);

  // keeps a running log of every Q&A pair + score so we can pass it
  // to the summary page at the end of the session
  const [sessionHistory, setSessionHistory] = useState<
    { question: string; answer: string; score: number }[]
  >([]);

  // word count check — anything under 5 words is not a real attempt
  // we compute this on every render so the button and hint stay in sync with typing
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const isValidAnswer = wordCount >= 5;

  // kick off the first question as soon as we have role + difficulty
  // the empty dependency array is intentional — we only want this once on mount
  useEffect(() => {
    if (role && difficulty) {
      fetchFirstQuestion();
    }
  }, [role, difficulty]);

  // hits the /interview/start endpoint to get question #1
  // separate from fetchNextQuestion because the start endpoint might do
  // session setup work on the backend side
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
      // if the backend isn't running, show a friendly message in place of the question
      setQuestion("Error connecting to server. Please make sure the backend is running.");
    }
    setIsLoading(false);
  };

  // sends the typed answer to the backend for AI evaluation
  // the backend returns a score plus feedback, suggestions, and a sample answer
  const handleSubmitAnswer = async () => {
    // double-check word count here too — just in case the button guard is bypassed
    if (!isValidAnswer) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/evaluation/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, question, answer }),
      });
      const data = await response.json();
      setEvaluation(data);

      // append this round to the history array — we need this for the summary screen
      setSessionHistory((prev) => [
        ...prev,
        { question, answer, score: data.score },
      ]);
    } catch (error) {
      alert("Error evaluating answer. Please check if backend is running.");
    }
    setIsLoading(false);
  };

  // called when the user clicks "Next Question" or "View Session Summary"
  // if we've hit the last question, serialize the history and navigate to /summary
  // otherwise, reset the answer/evaluation state and fetch the next question
  const handleNextQuestion = async () => {
    if (questionNumber >= TOTAL_QUESTIONS) {
      // pack the session data into the URL so the summary page can read it
      // without needing any shared state or a database call
      const summaryData = encodeURIComponent(JSON.stringify(sessionHistory));
      router.push(`/summary?data=${summaryData}&role=${encodeURIComponent(role)}`);
      return;
    }

    // wipe the previous answer + feedback so the UI returns to the "answer" state
    setEvaluation(null);
    setAnswer("");
    setIsLoading(true);
    setQuestionNumber((prev) => prev + 1);

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

  // quick helper to color-code the score badge
  // green for strong answers, yellow for okay, red for needs work
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 5) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">

        {/* ── header row: role name on the left, progress bar on the right ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{role}</h1>
            <p className="text-sm text-slate-500 capitalize">{difficulty} level interview</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-slate-600">
              Question {questionNumber} of {TOTAL_QUESTIONS}
            </span>
            {/* progress bar fills proportionally as questions advance */}
            <div className="w-32 h-2 bg-slate-200 rounded-full mt-1">
              <div
                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${(questionNumber / TOTAL_QUESTIONS) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── question card ── */}
        {/* shows a spinner while the first question is loading, then the question text */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-4">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-3">
            Interview Question
          </p>
          {isLoading && !question ? (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Generating question...</span>
            </div>
          ) : (
            <p className="text-slate-800 text-base leading-relaxed">{question}</p>
          )}
        </div>

        {/* ── answer input ── */}
        {/* this whole card disappears once the user gets feedback, to keep the UI clean */}
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

            {/* only show the warning if the user has started typing but hasn't reached 5 words yet
                we don't want to flash this on an empty box — that would be annoying on load */}
            {answer.length > 0 && !isValidAnswer && (
              <p className="text-red-500 text-sm mt-2">
                Please write at least a proper attempt before submitting.
              </p>
            )}

            {/* button is disabled while loading OR if the answer doesn't have enough words
                this is the first line of defense before the backend word count check */}
            <button
              onClick={handleSubmitAnswer}
              disabled={!isValidAnswer || isLoading}
              className="mt-3 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold
                rounded-xl transition-all duration-200 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "Evaluating..." : "Submit Answer"}
            </button>
          </div>
        )}

        {/* ── feedback card ── */}
        {/* only renders after evaluation comes back from the backend */}
        {evaluation && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-4">

            {/* score badge — color changes based on how well they did */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                AI Feedback
              </h2>
              <span className={`text-2xl font-bold ${getScoreColor(evaluation.score)}`}>
                {evaluation.score}/10
              </span>
            </div>

            {/* general feedback on what the user said */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Feedback</p>
              <p className="text-sm text-slate-700 leading-relaxed">{evaluation.feedback}</p>
            </div>

            {/* actionable tip for how to answer better next time */}
            <div className="mb-4 bg-yellow-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-yellow-700 uppercase mb-1">How to Improve</p>
              <p className="text-sm text-yellow-800 leading-relaxed">{evaluation.suggestion}</p>
            </div>

            {/* model answer is optional — the backend may or may not include it */}
            {evaluation.sample_answer && (
              <div className="bg-green-50 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-green-700 uppercase mb-1">Sample Answer</p>
                <p className="text-sm text-green-800 leading-relaxed">{evaluation.sample_answer}</p>
              </div>
            )}

            {/* button label changes on the last question to signal the session is wrapping up */}
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

// the default export wraps InterviewContent in Suspense
// Next.js requires this whenever a child component calls useSearchParams()
// the fallback is just a centered spinner — nothing fancy
export default function InterviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <InterviewContent />
    </Suspense>
  );
}