"use client"

import type React from "react"

import { useState } from "react"

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
}

export function Tabs({ tabs }: TabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id)

  return (
    <div>
      <div className="flex gap-4 border-b border-gray-200 dark:border-slate-700 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>{tabs.find((tab) => tab.id === activeTab)?.content}</div>
    </div>
  )
}
