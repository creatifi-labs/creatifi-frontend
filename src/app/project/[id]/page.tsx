"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { TopNav } from "@/components/top-nav"
import { Footer } from "@/components/footer"
import { getProject, getMilestone, getProjectRewardURI, supportProject } from "@/lib/contracts/factory"
import { fetchMetadataFromIPFS, ipfsToHttp } from "@/lib/ipfs"
import { formatEther, parseEther } from "viem"
import Image from "next/image"
import { Loader2, Check, Lock } from "lucide-react"

interface ProjectData {
	creator: string
	title: string
	targetAmount: bigint
	currentAmount: bigint
	fullyFunded: boolean
}

interface MilestoneData {
	index: number
	name: string
	amount: bigint
	released: boolean
	completed: boolean
}

export default function ProjectDetailPage() {
	const params = useParams()
	const router = useRouter()
	const projectId = Number(params.id)

	const [account, setAccount] = useState<string>("")
	const [loading, setLoading] = useState(true)
	const [supporting, setSupporting] = useState(false)
	const [supportAmount, setSupportAmount] = useState("")

	const [project, setProject] = useState<ProjectData | null>(null)
	const [milestones, setMilestones] = useState<MilestoneData[]>([])
	const [metadata, setMetadata] = useState<any>(null)

	useEffect(() => {
		checkConnection()
		if (projectId) {
			fetchProjectDetails()
		}
	}, [projectId])

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

	const fetchProjectDetails = async () => {
		console.log('=== FETCHING PROJECT DETAILS ===')
		console.log('Project ID:', projectId)
		
		try {
			setLoading(true)

			// Fetch project details
			console.log('Step 1: Fetching project data...')
			const projectData = await getProject(BigInt(projectId))
			
			console.log('Raw project data:', projectData)
			console.log('Target Amount (bigint):', projectData.targetAmount.toString())
			console.log('Current Amount (bigint):', projectData.currentAmount.toString())
			
			setProject(projectData)

			// Fetch milestones
			console.log('Step 2: Fetching milestones...')
			const milestonePromises = [
				getMilestone(BigInt(projectId), 0),
				getMilestone(BigInt(projectId), 1),
				getMilestone(BigInt(projectId), 2),
			]

			const milestonesData = await Promise.all(milestonePromises)
			console.log('Raw milestones data:', milestonesData)
			
			const formattedMilestones: MilestoneData[] = milestonesData.map((m, i) => ({
				index: i,
				name: m.name,
				amount: m.amount,
				released: m.released,
				completed: m.completed,
			}))

			console.log('Formatted milestones:', formattedMilestones)
			setMilestones(formattedMilestones)

			// Fetch metadata
			console.log('Step 3: Fetching metadata...')
			try {
				const rewardURI = await getProjectRewardURI(BigInt(projectId))
				console.log('Reward URI:', rewardURI)
				
				if (rewardURI) {
					const meta = await fetchMetadataFromIPFS(rewardURI)
					console.log('Metadata fetched successfully:', meta)
					setMetadata(meta)
				}
			} catch (metaErr) {
				console.error("Failed to fetch metadata:", metaErr)
			}

			console.log('=== FETCH COMPLETE ===')
		} catch (error) {
			console.error("=== ERROR FETCHING PROJECT ===")
			console.error("Error details:", error)
			console.error("Error message:", (error as Error).message)
			console.error("Error stack:", (error as Error).stack)
			
			alert("Failed to load project details: " + (error as Error).message)
			
			setProject(null)
			setMilestones([])
			setMetadata(null)
		} finally {
			setLoading(false)
		}
	}

	const handleSupport = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!account) {
			alert("Please connect your wallet first")
			return
		}

		if (!supportAmount || parseFloat(supportAmount) <= 0) {
			alert("Please enter a valid amount")
			return
		}

		try {
			setSupporting(true)

			// User input amount already includes fee (total to pay)
			// Contract will split: ~97.56% to project, ~2.44% to platform
			const totalAmount = parseFloat(supportAmount)

			console.log(`Supporting with ${totalAmount} ETH total`)

			const hash = await supportProject(
				BigInt(projectId),
				parseEther(totalAmount.toString())
			)

			alert(`Support successful!\nTransaction: ${hash}`)

			// Refresh project data
			await fetchProjectDetails()
			setSupportAmount("")
		} catch (error: any) {
			console.error("Error supporting project:", error)
			alert(`Failed to support project: ${error.message || "Unknown error"}`)
		} finally {
			setSupporting(false)
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-white dark:bg-slate-950">
				<TopNav />
				<div className="flex items-center justify-center py-20">
					<Loader2 className="w-8 h-8 animate-spin text-blue-600" />
					<span className="ml-3">Loading project...</span>
				</div>
				<Footer />
			</div>
		)
	}

	if (!project) {
		return (
			<div className="min-h-screen bg-white dark:bg-slate-950">
				<TopNav />
				<div className="text-center py-20">
					<p className="text-gray-600 dark:text-gray-400">Project not found</p>
					<button
						onClick={() => router.push("/explore")}
						className="mt-4 btn-gradient"
					>
						Back to Explore
					</button>
				</div>
				<Footer />
			</div>
		)
	}

	// CALCULATION HARUS SETELAH CHECK if (!project)
	const goalEth = Number(formatEther(project.targetAmount))
	const raisedEth = Number(formatEther(project.currentAmount))
	const progress = goalEth > 0 ? (raisedEth / goalEth) * 100 : 0
	const remaining = Math.max(goalEth - raisedEth, 0)

	return (
		<div className="min-h-screen bg-white dark:bg-slate-950">
			<TopNav />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Back Button */}
				<button
					onClick={() => router.back()}
					className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
				>
					← Back
				</button>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column - Project Info */}
					<div className="lg:col-span-2 space-y-6">
						{/* Project Image */}
						<div className="relative h-96 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl overflow-hidden">
							{metadata?.image ? (
								<Image
									src={ipfsToHttp(metadata.image)}
									alt={project.title}
									fill
									className="object-cover"
									unoptimized
								/>
							) : (
								<div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold opacity-20">
									{project.title.charAt(0).toUpperCase()}
								</div>
							)}
						</div>

						{/* Project Details */}
						<div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6">
							<h1 className="text-3xl font-bold mb-4">{project.title}</h1>
							
							{metadata?.description && (
								<p className="text-gray-600 dark:text-gray-400 mb-6">
									{metadata.description}
								</p>
							)}

							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<p className="text-gray-500 dark:text-gray-400">Creator</p>
									<p className="font-mono">
										{project.creator.slice(0, 6)}...{project.creator.slice(-4)}
									</p>
								</div>
								<div>
									<p className="text-gray-500 dark:text-gray-400">Project ID</p>
									<p className="font-semibold">#{projectId}</p>
								</div>
							</div>
						</div>

						{/* Milestones */}
						<div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6">
							<h2 className="text-2xl font-bold mb-4">Milestones</h2>
							<div className="space-y-4">
								{milestones.map((milestone) => (
									<div
										key={milestone.index}
										className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg"
									>
										<div
											className={`w-10 h-10 rounded-full flex items-center justify-center ${
												milestone.completed
													? "bg-green-500 text-white"
													: milestone.released
													? "bg-blue-500 text-white"
													: "bg-gray-300 dark:bg-slate-600 text-gray-600 dark:text-gray-400"
											}`}
										>
											{milestone.completed ? (
												<Check className="w-5 h-5" />
											) : milestone.released ? (
												<span>{milestone.index + 1}</span>
											) : (
												<Lock className="w-5 h-5" />
											)}
										</div>
										<div className="flex-1">
											<h3 className="font-semibold">{milestone.name}</h3>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												{formatEther(milestone.amount)} ETH
											</p>
										</div>
										<div>
											{milestone.completed ? (
												<span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
													Completed
												</span>
											) : milestone.released ? (
												<span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
													In Progress
												</span>
											) : (
												<span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 rounded-full">
													Locked
												</span>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Right Column - Funding Card */}
					<div className="lg:col-span-1">
						<div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6 sticky top-6">
							<h2 className="text-2xl font-bold mb-6">Support This Project</h2>

							{/* Progress */}
							<div className="mb-6">
								<div className="flex justify-between text-sm mb-2">
									<span className="text-gray-600 dark:text-gray-400">Raised</span>
									<span className="font-semibold">
										{raisedEth.toFixed(4)} / {goalEth.toFixed(4)} ETH
									</span>
								</div>
								<div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
									<div
										className="gradient-primary h-3 rounded-full transition-all duration-300"
										style={{ width: `${Math.min(progress, 100)}%` }}
									/>
								</div>
								<div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
									<span>{progress.toFixed(1)}% funded</span>
									<span>{remaining.toFixed(4)} ETH remaining</span>
								</div>
							</div>

							{/* Support Form */}
							{!project.fullyFunded ? (
								<form onSubmit={handleSupport} className="space-y-4">
									<div>
										<label className="block text-sm font-medium mb-2">
											Total Amount to Pay (ETH)
										</label>
										<input
											type="number"
											step="0.001"
											value={supportAmount}
											onChange={(e) => setSupportAmount(e.target.value)}
											placeholder="0.1"
											className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
											disabled={supporting}
										/>
										<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
											Contract automatically deducts 2.5% platform fee
										</p>
									</div>

									<button
										type="submit"
										disabled={supporting || !account}
										className="w-full btn-gradient flex items-center justify-center gap-2"
									>
										{supporting ? (
											<>
												<Loader2 className="w-4 h-4 animate-spin" />
												Processing...
											</>
										) : (
											"Support Project"
										)}
									</button>

									{!account && (
										<p className="text-center text-sm text-red-500">
											Please connect your wallet to support this project
										</p>
									)}
								</form>
							) : (
								<div className="text-center py-4">
									<p className="text-green-600 dark:text-green-400 font-semibold mb-2">
										✓ Fully Funded!
									</p>
									<p className="text-sm text-gray-600 dark:text-gray-400">
										This project has reached its funding goal
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	)
}
