import { Users, TrendingUp } from "lucide-react"
import Image from "next/image"

interface ProjectCardProps {
  id: string
  title: string
  creator: string
  category: string
  image: string
  goal: number
  raised: number
  supporters: number
}

export function ProjectCard({ title, creator, category, image, goal, raised, supporters }: ProjectCardProps) {
  const percentage = Math.round((raised / goal) * 100)

  return (
    <div className="group card-glow rounded-2xl overflow-hidden bg-white dark:bg-slate-800 transition-all duration-300 hover:scale-105">
      <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-slate-700">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
          {category}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">by {creator}</p>

        <div className="mb-4">
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

        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{supporters} supporters</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>Trending</span>
          </div>
        </div>
      </div>
    </div>
  )
}
