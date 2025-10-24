"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface FilterSidebarProps {
  onCategoryChange: (category: string | null) => void
  onStatusChange: (status: string | null) => void
}

export function FilterSidebar({ onCategoryChange, onStatusChange }: FilterSidebarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("category")

  const categories = ["Music", "Design", "Animation", "Game", "Film", "Art"]
  const statuses = ["Open", "Funded", "Closed"]

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => setExpandedCategory(expandedCategory === "category" ? null : "category")}
          className="w-full flex items-center justify-between font-semibold text-lg mb-4 hover:text-primary transition-colors"
        >
          Category
          <ChevronDown
            className={`w-5 h-5 transition-transform ${expandedCategory === "category" ? "rotate-180" : ""}`}
          />
        </button>
        {expandedCategory === "category" && (
          <div className="space-y-3">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  onChange={(e) => onCategoryChange(e.target.checked ? cat : null)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                  {cat}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
        <button
          onClick={() => setExpandedCategory(expandedCategory === "status" ? null : "status")}
          className="w-full flex items-center justify-between font-semibold text-lg mb-4 hover:text-primary transition-colors"
        >
          Status
          <ChevronDown
            className={`w-5 h-5 transition-transform ${expandedCategory === "status" ? "rotate-180" : ""}`}
          />
        </button>
        {expandedCategory === "status" && (
          <div className="space-y-3">
            {statuses.map((status) => (
              <label key={status} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  onChange={(e) => onStatusChange(e.target.checked ? status : null)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                  {status}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
