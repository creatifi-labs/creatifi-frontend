import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Web3Provider } from "@/providers/Web3Provider"; 
import "./globals.css";

export const metadata: Metadata = {
  title: "CreatiFi - Decentralized Creative Funding",
  description:
    "Empowering creators, connecting supporters, powered by Web3 transparency",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} ${GeistMono.className} font-sans antialiased`}
      >
        <Web3Provider>
          {children}
          <Analytics />
        </Web3Provider>
      </body>
    </html>
  );
}
