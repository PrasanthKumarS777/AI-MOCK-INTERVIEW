// summary/page.tsx
// This is the final page shown after the user completes all 5 interview questions.
// It displays the overall score, a performance breakdown for each question,
// and a final recommendation based on how well the user did.

"use client";

import { useSearchParams, useRouter } from "next/navigation";

// This defines the shape of each question's result stored in session history
interface SessionItem {
  question: string;
  answer: string;
  score: number;
}

export default function SummaryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read the session data and role passed from the interview page via URL
  const role = searchParams.get("role") || "Unknown Role";
  const rawData = searchParams.get("data");

  // Parse the JSON session history back from the URL string
  // If parsing fails, default to an empty array to avoid crashes
  let sessionData: SessionItem[] = [];
  try {
    if (rawData) {
      sessionData = JSON.parse(decodeURIComponent(rawData));
    }
  } catch (error) {
    sessionData = [];
  }

  // Calculate the total score by adding up all individual scores
  const totalScore = sessionData.reduce((sum, item) => sum + item.score, 0);

  // Calculate average score out of 10 rounded to 1 decimal place
  const averageScore =
    sessionData.length > 0
      ? (totalScore / sessionData.length).toFixed(1)
      : "0";

  // Generate a performance label based on the average score
  const getPerformanceLabel = (avg: number) => {
    if (avg >= 8) return { label: "Excellent", color: "text-green-600", bg: "bg-green-50" };
    if (avg >= 6) return { label: "Good", color: "text-blue-600", bg: "bg-blue-50" };
    if (avg >= 4) return { label: "Average", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { label: "Needs Improvement", color: "text-red-500", bg: "bg-red-50" };
  };

  const performance = getPerformanceLabel(parseFloat(averageScore));

  // Get a recommendation message based on performance level
  const getRecommendation = (avg: number) => {
    if (avg >= 8)
      return "Outstanding performance! You have a strong command of this role. Keep practicing to maintain this level.";
    if (avg >= 6)
      return "Good effort! You understand the core concepts well. Focus on improving depth and structure in your answers.";
    if (avg >= 4)
      return "Decent start. Review the sample answers provided and practice explaining concepts more clearly.";
    return "Keep practicing! Study the fundamentals of this role and try again. Every attempt makes you better.";
  };

  // Returns a color class based on individual question score
  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-700";
    if (score >= 5) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-600";
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Interview Complete!
          </h1>
          <p className="text-slate-500 text-sm">
            Here is your performance summary for the {role} interview
          </p>
        </div>

        {/* Overall Score Card */}
        <div className={`rounded-2xl p-6 mb-6 text-center ${performance.bg} border border-slate-100`}>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Overall Score
          </p>
          <p className={`text-5xl font-bold mb-2 ${performance.color}`}>
            {averageScore}<span className="text-2xl">/10</span>
          </p>
          <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${performance.color} bg-white`}>
            {performance.label}
          </span>

          {/* Total points display */}
          <p className="text-slate-400 text-xs mt-3">
            Total: {totalScore} / {sessionData.length * 10} points
          </p>
        </div>

        {/* Recommendation Box */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Recommendation
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            {getRecommendation(parseFloat(averageScore))}
          </p>
        </div>

        {/* Per Question Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
            Question Breakdown
          </p>

          {/* Loop through each question and display its result */}
          <div className="space-y-4">
            {sessionData.map((item, index) => (
              <div key={index} className="border border-slate-100 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Question number label */}
                    <p className="text-xs text-slate-400 font-semibold uppercase mb-1">
                      Question {index + 1}
                    </p>
                    {/* The actual question text */}
                    <p className="text-sm text-slate-700 font-medium mb-2">
                      {item.question}
                    </p>
                    {/* The user's answer — truncated if very long */}
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      Your answer: {item.answer}
                    </p>
                  </div>
                  {/* Score badge for this question */}
                  <span className={`px-3 py-1 rounded-full text-sm font-bold shrink-0 ${getScoreBadgeColor(item.score)}`}>
                    {item.score}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Retry the same role at same difficulty */}
          <button
            onClick={() => router.push("/")}
            className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700
              font-semibold text-sm hover:bg-slate-100 transition-all duration-200"
          >
            Try Another Role
          </button>

          {/* Start a fresh interview with the same role */}
          <button
            onClick={() =>
              router.push(
                `/interview?role=${encodeURIComponent(role)}&difficulty=intermediate`
              )
            }
            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white
              font-semibold text-sm transition-all duration-200"
          >
            Practice Again
          </button>
        </div>

      </div>
    </main>
  );
}