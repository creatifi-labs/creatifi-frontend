"use client"

import { useState, useEffect } from "react"
import { TopNav } from "@/components/top-nav"
import { Footer } from "@/components/footer"
import { CreatorProjectCard } from "@/components/creator-project-card"
import { AnalyticsCard } from "@/components/analytics-card"
import { Users, TrendingUp, Award, Plus, Upload, CheckCircle2, Wallet, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCreatorProjects } from "@/hooks/useCreatorProjects"

export default function CreatorDashboard() {
	const router = useRouter()
	const [account, setAccount] = useState<string>("")

	useEffect(() => {
		checkConnection()
	}, [])

	const checkConnection = async () => {
		if (typeof window !== "undefined" && window.ethereum) {
			try {
				const accounts = await window.ethereum.request({
					method: "eth_accounts",
				})
				if (accounts && accounts.length > 0) {
					setAccount(accounts[0])
				}
			} catch (error) {
				console.error("Error checking connection:", error)
			}
		}
	}

	// Fetch creator projects
	const { projects, loading, error } = useCreatorProjects(account)

	// Calculate analytics from real data
	const totalRaised = projects.reduce((sum, p) => sum + p.raised, 0)
	const activeProjectsCount = projects.filter(p => p.status === 'active').length

	return (
		<div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
			<TopNav />

			{/* Header */}
			<section className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-start">
						<div>
							<h1 className="text-4xl font-bold mb-2">Creator Dashboard</h1>
							<p className="text-gray-600 dark:text-gray-400">
								Manage your projects and track your success
							</p>
						</div>
						<button 
							className="btn-gradient flex items-center gap-2"
							onClick={() => router.push('/creator/new')}
						>
							<Plus className="w-4 h-4" />
							New Project
						</button>
					</div>
				</div>
			</section>

			{/* Main Content - flex-1 untuk mengisi space */}
			<div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
				{/* Analytics Section */}
				<div className="mb-12">
					<h2 className="text-2xl font-bold mb-6">Your Analytics</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" suppressHydrationWarning>
						<AnalyticsCard
							label="Total Projects"
							value={projects.length.toString()}
							icon={<Award className="w-6 h-6" />}
						/>
						<AnalyticsCard
							label="Total Raised"
							value={`${totalRaised.toFixed(4)} ETH`}
							icon={<TrendingUp className="w-6 h-6" />}
						/>
						<AnalyticsCard
							label="Active Projects"
							value={activeProjectsCount.toString()}
							icon={<Award className="w-6 h-6" />}
						/>
						<AnalyticsCard
							label="Funded Projects"
							value={projects.filter(p => p.status === 'funded').length.toString()}
							icon={<Users className="w-6 h-6" />}
						/>
					</div>
				</div>

				{/* Projects Section */}
				<div>
					<h2 className="text-2xl font-bold mb-6">Your Projects</h2>
					
					{/* Loading State */}
					{loading && (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="w-8 h-8 animate-spin text-blue-600" />
							<span className="ml-3 text-gray-600 dark:text-gray-400">Loading projects...</span>
						</div>
					)}

					{/* Error State */}
					{error && (
						<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
							Error: {error}
						</div>
					)}

					{/* Empty State */}
					{!loading && !error && projects.length === 0 && account && (
						<div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-lg">
							<p className="text-gray-600 dark:text-gray-400 mb-4">
								You haven't created any projects yet.
							</p>
							<button 
								onClick={() => router.push('/creator/new')}
								className="btn-gradient"
							>
								Create Your First Project
							</button>
						</div>
					)}

					{/* No Wallet Connected */}
					{!account && !loading && (
						<div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-lg">
							<p className="text-gray-600 dark:text-gray-400">
								Please connect your wallet to view your projects.
							</p>
						</div>
					)}

					{/* Projects Grid */}
					{!loading && !error && projects.length > 0 && (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" suppressHydrationWarning>
							{projects.map((project) => (
								<CreatorProjectCard key={project.id} {...project} />
							))}
						</div>
					)}
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
						<button className="text-primary hover:text-secondary font-semibold transition-colors">
							Upload Now →
						</button>
					</div>

					<div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6 text-center">
						<div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center text-white mx-auto mb-4">
							<CheckCircle2 className="w-6 h-6" />
						</div>
						<h3 className="font-bold text-lg mb-2">Submit for Verification</h3>
						<p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
							Request milestone verification to release funds to your wallet.
						</p>
						<button className="text-primary hover:text-secondary font-semibold transition-colors">
							Submit →
						</button>
					</div>

					<div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6 text-center">
						<div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center text-white mx-auto mb-4">
							<Wallet className="w-6 h-6" />
						</div>
						<h3 className="font-bold text-lg mb-2">Withdraw Funds</h3>
						<p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
							Withdraw verified milestone funds to your connected wallet.
						</p>
						<button className="text-primary hover:text-secondary font-semibold transition-colors">
							Withdraw →
						</button>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	)
}
