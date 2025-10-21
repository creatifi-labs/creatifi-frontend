import type React from "react"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="card-glow rounded-2xl bg-white dark:bg-slate-800 p-6 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center text-white">{icon}</div>
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
  )
}
