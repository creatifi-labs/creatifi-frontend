import type React from "react"
import type { Metadata } from "next"
import { Inter, Roboto_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const geist = Inter({ subsets: ["latin"] })
const geistMono = Roboto_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CreatiFi - Decentralized Creative Funding",
  description: "Empowering creators, connecting supporters, powered by Web3 transparency",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.className} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
