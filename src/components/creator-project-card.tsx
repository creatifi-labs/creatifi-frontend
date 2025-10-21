import { MoreVertical, Upload, CheckCircle2 } from "lucide-react"

interface CreatorProjectCardProps {
  title: string
  status: "active" | "funded" | "closed"
  goal: number
  raised: number
  milestonesCompleted: number
  totalMilestones: number
}

export function CreatorProjectCard({
  title,
  status,
  goal,
  raised,
  milestonesCompleted,
  totalMilestones,
}: CreatorProjectCardProps) {
  const percentage = Math.round((raised / goal) * 100)

  const statusConfig = {
    active: { label: "Active", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    funded: { label: "Funded", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    closed: { label: "Closed", color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400" },
  }

  const config = statusConfig[status]

  return (
    <div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">{title}</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
            {config.label}
          </span>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">{percentage}% Funded</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ${raised.toLocaleString()} / ${goal.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full gradient-primary transition-all duration-500"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm">
              {milestonesCompleted} of {totalMilestones} milestones
            </span>
          </div>
          <button className="flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-semibold">
            <Upload className="w-4 h-4" />
            Update
          </button>
        </div>
      </div>
    </div>
  )
}
