import { CheckCircle2, Clock } from "lucide-react"

interface MilestoneCardProps {
  title: string
  description: string
  targetAmount: number
  status: "completed" | "in-progress" | "pending"
  dueDate: string
}

export function MilestoneCard({ title, description, targetAmount, status, dueDate }: MilestoneCardProps) {
  const statusConfig = {
    completed: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
    "in-progress": { icon: Clock, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    pending: { icon: Clock, color: "text-gray-400", bg: "bg-gray-50 dark:bg-gray-900/20" },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6 border-l-4 border-primary">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-1">{title}</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
        </div>
        <div className={`${config.bg} p-2 rounded-lg`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target Amount</p>
          <p className="font-semibold text-primary">${targetAmount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Due Date</p>
          <p className="font-semibold">{dueDate}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
    </div>
  )
}
