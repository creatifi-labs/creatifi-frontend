"use client"

import { useState } from "react"
import { Gift } from "lucide-react"

interface SupportCardProps {
  projectTitle: string
  goal: number
  raised: number
}

export function SupportCard({ projectTitle, goal, raised }: SupportCardProps) {
  const [amount, setAmount] = useState("")
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  const tiers = [
    { id: "supporter", name: "Supporter", amount: 10, reward: "Digital Thank You" },
    { id: "patron", name: "Patron", amount: 50, reward: "NFT Badge + Updates" },
    { id: "champion", name: "Champion", amount: 100, reward: "NFT Badge + Exclusive Access" },
  ]

  const percentage = Math.round((raised / goal) * 100)

  return (
    <div className="card-glow rounded-2xl bg-white dark:bg-slate-800 p-8 sticky top-24">
      <h3 className="font-bold text-xl mb-6">Support This Project</h3>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">{percentage}% Funded</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ${raised.toLocaleString()} / ${goal.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full gradient-primary transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {tiers.map((tier) => (
          <button
            key={tier.id}
            onClick={() => {
              setSelectedTier(tier.id)
              setAmount(tier.amount.toString())
            }}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              selectedTier === tier.id
                ? "border-primary bg-primary/5 dark:bg-primary/10"
                : "border-gray-200 dark:border-slate-700 hover:border-primary"
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold">{tier.name}</span>
              <span className="text-primary font-bold">${tier.amount}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">{tier.reward}</p>
          </button>
        ))}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Custom Amount (ETH)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value)
            setSelectedTier(null)
          }}
          placeholder="0.5"
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <button className="btn-gradient w-full flex items-center justify-center gap-2 mb-3">
        <Gift className="w-4 h-4" />
        Support Now
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        You will receive an NFT Proof of Support after transaction confirmation.
      </p>
    </div>
  )
}
