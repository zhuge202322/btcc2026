import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InsiderCoinClub - Global Crypto Dashboard",
  description: "Web3 Trading, Charts, and Whale Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
