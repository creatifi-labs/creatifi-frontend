"use client"

import { TopNav } from "@/components/top-nav"
import { Footer } from "@/components/footer"
import { CreatorProjectCard } from "@/components/creator-project-card"
import { AnalyticsCard } from "@/components/analytics-card"
import { Users, TrendingUp, Award, Plus } from "lucide-react"

const creatorProjects = [
  {
    title: "Indie Game Studio - RPG Adventure",
    status: "active" as const,
    goal: 50000,
    raised: 42500,
    milestonesCompleted: 1,
    totalMilestones: 4,
  },
  {
    title: "Previous Project - Completed",
    status: "funded" as const,
    goal: 30000,
    raised: 32000,
    milestonesCompleted: 4,
    totalMilestones: 4,
  },
  {
    title: "Archived Project",
    status: "closed" as const,
    goal: 20000,
    raised: 18500,
    milestonesCompleted: 2,
    totalMilestones: 3,
  },
]

export default function CreatorDashboard() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <TopNav />

      {/* Header */}
      <section className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">Creator Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your projects and track your success</p>
            </div>
            <button className="btn-gradient flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Analytics Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticsCard label="Total Supporters" value="3,250" icon={<Users className="w-6 h-6" />} trend={12} />
            <AnalyticsCard label="Total Raised" value="$125,500" icon={<TrendingUp className="w-6 h-6" />} trend={8} />
            <AnalyticsCard label="Active Projects" value="1" icon={<Award className="w-6 h-6" />} />
            <AnalyticsCard label="Avg Support Tier" value="$45" icon={<Users className="w-6 h-6" />} trend={5} />
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creatorProjects.map((project, idx) => (
              <CreatorProjectCard key={idx} {...project} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6 text-center">
            <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center text-white mx-auto mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Upload Progress</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Share updates with your supporters about project progress.
            </p>
            <button className="text-primary hover:text-secondary font-semibold transition-colors">Upload Now →</button>
          </div>

          <div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6 text-center">
            <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center text-white mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Submit for Verification</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Request milestone verification to release funds to your wallet.
            </p>
            <button className="text-primary hover:text-secondary font-semibold transition-colors">Submit →</button>
          </div>

          <div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6 text-center">
            <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center text-white mx-auto mb-4">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Withdraw Funds</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Withdraw verified milestone funds to your connected wallet.
            </p>
            <button className="text-primary hover:text-secondary font-semibold transition-colors">Withdraw →</button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

import { Upload, CheckCircle2, Wallet } from "lucide-react"
