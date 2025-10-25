import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // This now includes our color variables

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Update title for better branding
export const metadata = {
  title: "Seasons Insights | OpenMH", // Changed Title
  description: "Find mental health data and services in your community.", // Changed Description
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Remove Tailwind bg/text classes here, rely on globals.css */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}