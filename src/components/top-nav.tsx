"use client"

import Link from "next/link"
import Image from "next/image"
import { WalletButton } from "./wallet-button"
import { Sun, Moon } from "lucide-react"
import { useState, useEffect } from "react"

export function TopNav() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Check dark mode on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark")
    setIsDarkMode(isDark)
  }, [])

  // Toggle dark mode
  const toggleDarkMode = () => {
    const html = document.documentElement
    if (html.classList.contains("dark")) {
      html.classList.remove("dark")
      setIsDarkMode(false)
      localStorage.setItem("theme", "light")
    } else {
      html.classList.add("dark")
      setIsDarkMode(true)
      localStorage.setItem("theme", "dark")
    }
  }

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-1">
            <Image
              src="/creatifilogo.png"
              alt="CreatiFi Logo"
              width={32}
              height={32}
              className="w-14 h-14"
            />
            <span className="font-bold text-xl gradient-text">CreatiFi</span>
          </Link>
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              href="/"
              className="text-sm md:text-base text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
            >
              Home
            </Link>
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
              Creator Space
            </Link>
            <Link
              href="/dashboard"
              className="text-sm md:text-base text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
            >
              Supporter Space
            </Link>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
