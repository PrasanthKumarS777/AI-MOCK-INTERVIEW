"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

// only run on client — useSearchParams needs it in Next.js
function InterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const role = searchParams.get("role") || "Software Engineer";
  const difficulty = searchParams.get("difficulty") || "intermediate";

  const [question, setQuestion]         = useState("");
  const [answer, setAnswer]             = useState("");
  const [feedback, setFeedback]         = useState<null | { score: number; feedback: string; improvement: string; sample_answer: string }>(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQ, setCurrentQ]         = useState(1);
  const [history, setHistory]           = useState<{ question: string; answer: string; score: number }[]>([]);
  const totalQ = 5;

  // fetch the first question as soon as the component mounts
  useEffect(() => {
    fetchQuestion();
  }, []);

  const fetchQuestion = async () => {
    setIsLoading(true);
    setFeedback(null);
    setAnswer("");
    try {
      const res = await fetch("http://127.0.0.1:8000/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, difficulty }),
      });
      const data = await res.json();
      setQuestion(data.question);
    } catch {
      setQuestion("Failed to load question. Please check your backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, difficulty, question, answer }),
      });
      const data = await res.json();
      setFeedback(data);
      // build up history as we go — needed to pass to the summary page at the end
      setHistory(prev => [...prev, { question, answer, score: data.score }]);
    } catch {
      setFeedback({ score: 0, feedback: "Failed to get feedback.", improvement: "", sample_answer: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQ >= totalQ) {
      // pack the full session into the URL so the summary page can read it
      const summaryData = encodeURIComponent(JSON.stringify(history));
      window.location.href = `/summary?role=${encodeURIComponent(role)}&data=${summaryData}`;
    } else {
      setCurrentQ(prev => prev + 1);
      fetchQuestion();
    }
  };

  const progress = (currentQ / totalQ) * 100;

  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)", padding: "1.5rem" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* header — role name, difficulty badge, and question counter */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: "1.5rem",
        }}>
          <div>
            <h1 style={{
              fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)",
              fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em",
            }}>
              {role}
            </h1>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.125rem", textTransform: "capitalize" }}>
              {difficulty} Level Interview
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{
              fontSize: "0.875rem", fontWeight: 600,
              color: "var(--text)", fontFamily: "var(--font-mono)",
            }}>
              Question {currentQ} of {totalQ}
            </p>
            {/* progress bar */}
            <div style={{
              width: 120, height: 4,
              background: "var(--border)",
              borderRadius: 99, marginTop: "0.5rem", overflow: "hidden",
            }}>
              <div style={{
                width: `${progress}%`, height: "100%",
                background: "var(--accent)",
                borderRadius: 99,
                transition: "width 400ms ease",
              }} />
            </div>
          </div>
        </div>

        {/* question card */}
        <div className="card" style={{ marginBottom: "1rem" }}>
          <p className="eyebrow" style={{ marginBottom: "1rem" }}>Interview Question</p>
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div className="skeleton skeleton-text" style={{ width: "90%" }} />
              <div className="skeleton skeleton-text" style={{ width: "75%" }} />
            </div>
          ) : (
            <p style={{ fontSize: "1rem", color: "var(--text)", lineHeight: 1.7 }}>
              {question}
            </p>
          )}
        </div>

        {/* answer textarea — hidden once feedback arrives */}
        {!feedback && (
          <div className="card" style={{ marginBottom: "1rem" }}>
            <p className="eyebrow" style={{ marginBottom: "1rem" }}>Your Answer</p>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
              style={{
                width: "100%", resize: "vertical",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1rem",
                color: "var(--text)",
                fontSize: "0.9375rem",
                lineHeight: 1.6,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.75rem" }}>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !answer.trim()}
                className="btn-primary"
                style={{
                  opacity: isSubmitting || !answer.trim() ? 0.5 : 1,
                  cursor: isSubmitting || !answer.trim() ? "not-allowed" : "pointer",
                }}
              >
                {isSubmitting ? "Evaluating..." : "Submit Answer"}
              </button>
            </div>
          </div>
        )}

        {/* feedback card — only shown after the answer is evaluated */}
        {feedback && (
          <div className="card" style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <p className="eyebrow">AI Feedback</p>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: feedback.score >= 7 ? "var(--success)" : feedback.score >= 4 ? "var(--warning)" : "var(--danger)",
              }}>
                {feedback.score}/10
              </span>
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <p className="eyebrow" style={{ fontSize: "0.6875rem", marginBottom: "0.375rem" }}>Feedback</p>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                {feedback.feedback}
              </p>
            </div>

            {feedback.improvement && (
              <div style={{
                padding: "0.75rem 1rem",
                background: "var(--warning-bg)",
                borderRadius: "var(--radius-md)",
                marginBottom: "0.75rem",
              }}>
                <p className="eyebrow" style={{ fontSize: "0.6875rem", color: "var(--warning)", marginBottom: "0.375rem" }}>
                  How to Improve
                </p>
                <p style={{ fontSize: "0.8125rem", color: "var(--warning)", lineHeight: 1.7 }}>
                  {feedback.improvement}
                </p>
              </div>
            )}

            {feedback.sample_answer && (
              <div style={{
                padding: "0.75rem 1rem",
                background: "rgba(34,197,94,0.06)",
                borderRadius: "var(--radius-md)",
              }}>
                <p className="eyebrow" style={{ fontSize: "0.6875rem", color: "var(--success)", marginBottom: "0.375rem" }}>
                  Sample Answer
                </p>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                  {feedback.sample_answer}
                </p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button onClick={handleNext} className="btn-primary">
                {currentQ >= totalQ ? "View Summary →" : "Next Question →"}
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

// Next.js throws if useSearchParams isn't wrapped in Suspense
// so the actual page content lives here and the default export wraps it
export default function InterviewPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100dvh", background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div className="spinner" style={{ width: 24, height: 24 }} />
      </div>
    }>
      <InterviewContent />
    </Suspense>
  );
}