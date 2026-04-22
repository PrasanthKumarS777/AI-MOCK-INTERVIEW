"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface EvaluationResult {
  score: number;
  feedback: string;
  suggestion: string;
  sample_answer: string;
}

const TOTAL_QUESTIONS = 5;
const API_BASE = "http://127.0.0.1:8000";

function InterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const role = searchParams.get("role") || "";
  const difficulty = searchParams.get("difficulty") || "";

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<
    { question: string; answer: string; score: number }[]
  >([]);

  useEffect(() => {
    if (role && difficulty) {
      fetchFirstQuestion();
    }
  }, [role, difficulty]);

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
      setQuestion("Error connecting to server. Please make sure the backend is running.");
    }
    setIsLoading(false);
  };

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
      setSessionHistory((prev) => [
        ...prev,
        { question, answer, score: data.score },
      ]);
    } catch (error) {
      alert("Error evaluating answer. Please check if backend is running.");
    }
    setIsLoading(false);
  };

  const handleNextQuestion = async () => {
    if (questionNumber >= TOTAL_QUESTIONS) {
      const summaryData = encodeURIComponent(JSON.stringify(sessionHistory));
      router.push(`/summary?data=${summaryData}&role=${encodeURIComponent(role)}`);
      return;
    }
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

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 5) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{role}</h1>
            <p className="text-sm text-slate-500 capitalize">{difficulty} level interview</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-slate-600">
              Question {questionNumber} of {TOTAL_QUESTIONS}
            </span>
            <div className="w-32 h-2 bg-slate-200 rounded-full mt-1">
              <div
                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${(questionNumber / TOTAL_QUESTIONS) * 100}%` }}
              />
            </div>
          </div>
        </div>

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

        {evaluation && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                AI Feedback
              </h2>
              <span className={`text-2xl font-bold ${getScoreColor(evaluation.score)}`}>
                {evaluation.score}/10
              </span>
            </div>
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Feedback</p>
              <p className="text-sm text-slate-700 leading-relaxed">{evaluation.feedback}</p>
            </div>
            <div className="mb-4 bg-yellow-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-yellow-700 uppercase mb-1">How to Improve</p>
              <p className="text-sm text-yellow-800 leading-relaxed">{evaluation.suggestion}</p>
            </div>
            {evaluation.sample_answer && (
              <div className="bg-green-50 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-green-700 uppercase mb-1">Sample Answer</p>
                <p className="text-sm text-green-800 leading-relaxed">{evaluation.sample_answer}</p>
              </div>
            )}
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