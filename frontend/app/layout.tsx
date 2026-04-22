// layout.tsx
// This is the root layout that wraps every page in the application.
// Think of it like the main HTML shell — the navbar and footer
// would go here if we had them. Every page renders inside {children}.

import type { Metadata } from "next";
import "./globals.css";

// Metadata shows up in the browser tab title and SEO
export const metadata: Metadata = {
  title: "AI Mock Interview",
  description: "Practice your interview skills with AI-powered feedback",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Every page component gets rendered here */}
        {children}
      </body>
    </html>
  );
}