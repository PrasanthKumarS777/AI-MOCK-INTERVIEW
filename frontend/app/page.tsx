"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

interface SessionItem {
  question: string;
  answer: string;
  score: number;
}

function SummaryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const role = searchParams.get("role") || "Unknown Role";
  const rawData = searchParams.get("data");

  // parse the session history that was packed into the URL by the interview page
  let sessionData: SessionItem[] = [];
  try {
    if (rawData) sessionData = JSON.parse(decodeURIComponent(rawData));
  } catch {
    // if parsing fails just show an empty summary — better than crashing
    sessionData = [];
  }

  const totalScore = sessionData.reduce((sum, item) => sum + item.score, 0);
  const avg = sessionData.length > 0 ? totalScore / sessionData.length : 0;
  const averageScore = avg.toFixed(1);

  // map score ranges to a label + color
  const getPerformance = (a: number) => {
    if (a >= 8) return { label: "Excellent",         color: "var(--success)", dim: "rgba(34,197,94,0.12)"  };
    if (a >= 6) return { label: "Good",              color: "var(--accent)",  dim: "var(--accent-glow)"    };
    if (a >= 4) return { label: "Average",           color: "var(--warning)", dim: "var(--warning-bg)"     };
    return       { label: "Needs Improvement",       color: "var(--danger)",  dim: "var(--danger-bg)"      };
  };

  const getRecommendation = (a: number) => {
    if (a >= 8) return "Strong performance. Your answers were clear and structured — keep practicing to maintain this level.";
    if (a >= 6) return "Good effort. You're covering the right areas, but try adding more specific examples and structure.";
    if (a >= 4) return "Decent start. Go through the sample answers and practice explaining ideas more concisely.";
    return "Keep going. Study the fundamentals for this role and try again — every attempt counts.";
  };

  const scoreBadge = (score: number) => {
    if (score >= 8) return { bg: "rgba(34,197,94,0.1)",  color: "var(--success)" };
    if (score >= 5) return { bg: "rgba(245,158,11,0.1)", color: "var(--warning)" };
    return               { bg: "rgba(239,68,68,0.1)",   color: "var(--danger)"  };
  };

  const perf = getPerformance(avg);

  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)", padding: "1.5rem" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* page header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={{
            fontSize: "0.75rem", fontFamily: "var(--font-mono)",
            color: "var(--text-faint)", textTransform: "uppercase",
            letterSpacing: "0.08em", marginBottom: "0.5rem",
          }}>
            Session Complete
          </p>
          <h1 style={{
            fontSize: "clamp(1.375rem, 3vw, 1.75rem)",
            fontWeight: 700, color: "var(--text)",
            letterSpacing: "-0.02em", marginBottom: "0.5rem",
          }}>
            {role}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            {sessionData.length} questions answered
          </p>
        </div>

        {/* overall score */}
        <div style={{
          background: perf.dim,
          border: `1px solid ${perf.color}22`,
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          textAlign: "center",
          marginBottom: "1rem",
        }}>
          <p className="eyebrow" style={{ marginBottom: "1rem" }}>Overall Score</p>
          <div style={{ marginBottom: "0.75rem" }}>
            <span style={{
              fontSize: "clamp(3rem, 8vw, 5rem)",
              fontWeight: 700, color: perf.color,
              fontFamily: "var(--font-mono)", lineHeight: 1,
            }}>
              {averageScore}
            </span>
            <span style={{ fontSize: "1.25rem", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
              /10
            </span>
          </div>

          <span style={{
            display: "inline-block",
            padding: "0.25rem 1rem",
            borderRadius: "99px",
            border: `1px solid ${perf.color}44`,
            fontSize: "0.875rem", fontWeight: 600,
            color: perf.color, background: "rgba(0,0,0,0.3)",
          }}>
            {perf.label}
          </span>

          <p style={{
            fontSize: "0.75rem", color: "var(--text-faint)",
            fontFamily: "var(--font-mono)", marginTop: "0.75rem",
          }}>
            {totalScore} / {sessionData.length * 10} total points
          </p>
        </div>

        {/* recommendation */}
        <div className="card" style={{ marginBottom: "1rem" }}>
          <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>Recommendation</p>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.75 }}>
            {getRecommendation(avg)}
          </p>
        </div>

        {/* per-question breakdown */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>Question Breakdown</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {sessionData.map((item, i) => {
              const badge = scoreBadge(item.score);
              return (
                <div key={i} style={{
                  padding: "1rem",
                  background: "var(--surface-2)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                }}>
                  <div style={{
                    display: "flex", alignItems: "flex-start",
                    justifyContent: "space-between", gap: "1rem",
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: "0.75rem", fontFamily: "var(--font-mono)",
                        color: "var(--text-faint)", marginBottom: "0.5rem",
                      }}>
                        Q{i + 1}
                      </p>
                      <p style={{
                        fontSize: "0.875rem", color: "var(--text)",
                        fontWeight: 500, marginBottom: "0.5rem", lineHeight: 1.5,
                      }}>
                        {item.question}
                      </p>
                      {/* clamp the answer preview to 2 lines */}
                      <p style={{
                        fontSize: "0.75rem", color: "var(--text-faint)", lineHeight: 1.6,
                        display: "-webkit-box",
                        WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {item.answer}
                      </p>
                    </div>
                    <span style={{
                      flexShrink: 0,
                      padding: "0.25rem 0.75rem",
                      borderRadius: "var(--radius-sm)",
                      background: badge.bg, color: badge.color,
                      fontSize: "0.875rem", fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                    }}>
                      {item.score}/10
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={() => router.push("/")} className="btn-secondary">
            ← Try Another Role
          </button>
          <button
            onClick={() =>
              router.push(`/interview?role=${encodeURIComponent(role)}&difficulty=intermediate`)
            }
            className="btn-primary"
          >
            Practice Again
          </button>
        </div>

      </div>
    </main>
  );
}

export default function SummaryPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100dvh", background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div className="spinner" style={{ width: 24, height: 24 }} />
      </div>
    }>
      <SummaryContent />
    </Suspense>
  );
}