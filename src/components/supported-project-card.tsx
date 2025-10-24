import { ExternalLink } from "lucide-react"

interface SupportedProjectCardProps {
  projectTitle: string
  amount: number
  date: string
  status: "active" | "completed" | "funded"
  tier: string
}

export function SupportedProjectCard({ projectTitle, amount, date, status, tier }: SupportedProjectCardProps) {
  const statusConfig = {
    active: { label: "Active", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    completed: { label: "Completed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    funded: { label: "Funded", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  }

  const config = statusConfig[status]

  return (
    <div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">{projectTitle}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Supported on {date}</p>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
          <ExternalLink className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount Supported</p>
          <p className="font-bold text-lg text-primary">${amount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tier</p>
          <p className="font-semibold">{tier}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>{config.label}</span>
      </div>
    </div>
  )
}
