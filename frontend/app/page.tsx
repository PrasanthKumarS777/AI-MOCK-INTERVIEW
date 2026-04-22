// page.tsx (Home Page)
// This is the first page the user sees when they open the app.
// It lets the user pick their job role and difficulty level
// before starting the interview session.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// List of available job roles the user can pick from
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

// Difficulty options with a short description for each
const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner", desc: "Basic concepts and fundamentals" },
  { value: "intermediate", label: "Intermediate", desc: "Real-world problem solving" },
  { value: "advanced", label: "Advanced", desc: "Deep dive and system design" },
];

export default function HomePage() {
  // Track which role the user selected
  const [selectedRole, setSelectedRole] = useState("");

  // Track which difficulty the user selected
  const [selectedDifficulty, setSelectedDifficulty] = useState("");

  // useRouter lets us navigate to the interview page programmatically
  const router = useRouter();

  // This runs when the user clicks "Start Interview"
  // We pass the role and difficulty as URL query parameters
  // so the interview page knows what session to start
  const handleStartInterview = () => {
    if (!selectedRole || !selectedDifficulty) return;

    // Navigate to the interview page with role and difficulty in the URL
    router.push(
      `/interview?role=${encodeURIComponent(selectedRole)}&difficulty=${selectedDifficulty}`
    );
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl">

        {/* Page heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            AI Mock Interview
          </h1>
          <p className="text-slate-500 text-sm">
            Select your role and difficulty to begin your practice session
          </p>
        </div>

        {/* Job Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Choose Your Role
          </label>
          <div className="grid grid-cols-2 gap-3">
            {JOB_ROLES.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 text-left
                  ${selectedRole === role
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50"
                  }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Level Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Select Difficulty
          </label>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTY_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setSelectedDifficulty(level.value)}
                className={`p-4 rounded-lg border text-center transition-all duration-200
                  ${selectedDifficulty === level.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50"
                  }`}
              >
                <div className="font-semibold text-sm">{level.label}</div>
                <div className="text-xs mt-1 opacity-70">{level.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button — disabled until both role and difficulty are selected */}
        <button
          onClick={handleStartInterview}
          disabled={!selectedRole || !selectedDifficulty}
          className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200
            bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {selectedRole && selectedDifficulty
            ? `Start Interview as ${selectedRole}`
            : "Select Role and Difficulty to Begin"}
        </button>

      </div>
    </main>
  );
}