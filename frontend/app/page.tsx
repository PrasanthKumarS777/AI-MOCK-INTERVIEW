"use client";

import { useState } from "react";
import { Suspense } from "react";

// keeping role options here so it's easy to add more later
const JOB_ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "Product Manager",
  "HR Manager",
  "Business Analyst",
  "DevOps Engineer",
];

const DIFFICULTY_LEVELS = [
  { value: "beginner",     label: "Beginner",     desc: "Basic concepts and fundamentals" },
  { value: "intermediate", label: "Intermediate", desc: "Real-world problem solving" },
  { value: "advanced",     label: "Advanced",     desc: "Deep dive and system design" },
];

function HomeContent() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const handleStart = () => {
    if (!selectedRole || !selectedDifficulty) return;
    // use window.location so the full page reloads cleanly into the interview
    window.location.href = `/interview?role=${encodeURIComponent(selectedRole)}&difficulty=${selectedDifficulty}`;
  };

  const canStart = selectedRole && selectedDifficulty;

  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)", padding: "1.5rem" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", paddingTop: "3rem" }}>

        {/* header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p style={{
            fontSize: "0.75rem", fontFamily: "var(--font-mono)",
            color: "var(--text-faint)", textTransform: "uppercase",
            letterSpacing: "0.1em", marginBottom: "0.75rem",
          }}>
            AI Powered
          </p>
          <h1 style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 700, color: "var(--text)",
            letterSpacing: "-0.03em", marginBottom: "0.75rem",
          }}>
            Mock Interview
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)", maxWidth: "42ch", margin: "0 auto" }}>
            Select your role and difficulty to begin your practice session
          </p>
        </div>

        {/* role selection */}
        <div className="card" style={{ marginBottom: "1rem" }}>
          <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>Choose Your Role</p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "0.5rem",
          }}>
            {JOB_ROLES.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${selectedRole === role ? "var(--accent)" : "var(--border)"}`,
                  background: selectedRole === role ? "var(--accent-glow)" : "var(--surface-2)",
                  color: selectedRole === role ? "var(--accent)" : "var(--text-muted)",
                  fontSize: "0.875rem",
                  fontWeight: selectedRole === role ? 600 : 400,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* difficulty selection */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>Select Difficulty</p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.5rem",
          }}>
            {DIFFICULTY_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setSelectedDifficulty(level.value)}
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${selectedDifficulty === level.value ? "var(--accent)" : "var(--border)"}`,
                  background: selectedDifficulty === level.value ? "var(--accent-glow)" : "var(--surface-2)",
                  color: selectedDifficulty === level.value ? "var(--accent)" : "var(--text-muted)",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
              >
                <p style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  marginBottom: "0.25rem",
                  color: selectedDifficulty === level.value ? "var(--accent)" : "var(--text)",
                }}>
                  {level.label}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
                  {level.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* start button */}
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="btn-primary"
          style={{
            width: "100%",
            padding: "0.875rem",
            fontSize: "1rem",
            fontWeight: 600,
            opacity: canStart ? 1 : 0.4,
            cursor: canStart ? "pointer" : "not-allowed",
          }}
        >
          {canStart
            ? `Start ${selectedRole} Interview — ${selectedDifficulty}`
            : "Select a role and difficulty to continue"}
        </button>

      </div>
    </main>
  );
}

// Suspense wrapper in case any child ever uses useSearchParams
export default function HomePage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100dvh", background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div className="spinner" style={{ width: 24, height: 24 }} />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}