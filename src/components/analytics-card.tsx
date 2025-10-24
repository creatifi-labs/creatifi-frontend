"use client"

import type React from "react"
import { useState, useEffect } from "react"
interface AnalyticsCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: number
}

export function AnalyticsCard({ label, value, icon, trend }: AnalyticsCardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6">
        <div className="h-24 animate-pulse bg-gray-200 dark:bg-slate-700 rounded"></div>
      </div>
    )
  }

  return (
    <div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend !== undefined && (
            <p className={`text-xs mt-2 ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
              {trend > 0 ? "+" : ""}
              {trend}% from last month
            </p>
          )}
        </div>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
    </div>
  )
}
