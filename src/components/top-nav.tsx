"use client"

import Link from "next/link"
import { Wallet } from "lucide-react"

export function TopNav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-slate-900/80 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl gradient-text">CreatiFi</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/explore" className="text-gray-600 hover:text-primary transition-colors dark:text-gray-300">
              Explore
            </Link>
            <Link href="/creator" className="text-gray-600 hover:text-primary transition-colors dark:text-gray-300">
              Create
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-primary transition-colors dark:text-gray-300">
              Dashboard
            </Link>
          </div>

          <button className="btn-gradient flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        </div>
      </div>
    </nav>
  )
}
