"use client"

import Link from "next/link"
import { WalletButton } from "./wallet-button"

export function TopNav() {
  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-bold text-xl gradient-text">
            CreatiFi
          </Link>
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              href="/explore"
              className="text-sm md:text-base text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/creator"
              className="text-sm md:text-base text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
            >
              Create
            </Link>
            <Link
              href="/dashboard"
              className="text-sm md:text-base text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
