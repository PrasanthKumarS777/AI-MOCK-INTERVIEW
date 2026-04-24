import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Mock Interview",
  description: "Practice your interview skills with AI-powered feedback",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* preconnect so Google Fonts doesn't block rendering */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}