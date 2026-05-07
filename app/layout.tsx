import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trades AI — AI Assistant for Home Service Professionals",
  description: "AI-powered client communication for HVAC, plumbers, electricians, and more",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
