import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InsiderCoinClub - 全球加密行情看板",
  description: "Web3 交易、行情看板、鲸鱼动态",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
