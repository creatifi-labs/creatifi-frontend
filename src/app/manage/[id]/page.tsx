"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { TopNav } from "@/components/top-nav"
import { Footer } from "@/components/footer"
import { 
  getProject, 
  getMilestone, 
  getProjectRewardURI,
  releaseMilestone,
  proposeMilestoneCompletion
} from "@/lib/contracts/factory"
import { fetchMetadataFromIPFS, uploadToIPFS, ipfsToHttp } from "@/lib/ipfs"
import { formatEther } from "viem"
import Image from "next/image"
import { Loader2, Check, Lock, Upload, ExternalLink, DollarSign, Clock } from "lucide-react"

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
	status: number
	proofURI: string
	agreeCount: bigint
	disagreeCount: bigint
	totalVotes: bigint
	voteDeadline: bigint
	finalized: boolean
}

export default function ManageProjectPage() {
	const params = useParams()
	const router = useRouter()
	const projectId = Number(params.id)

	const [account, setAccount] = useState<string>("")
	const [loading, setLoading] = useState(true)
	const [project, setProject] = useState<ProjectData | null>(null)
	const [milestones, setMilestones] = useState<MilestoneData[]>([])
	const [metadata, setMetadata] = useState<any>(null)
	
	const [releasingMilestone, setReleasingMilestone] = useState<number | null>(null)
	const [uploadingProof, setUploadingProof] = useState<number | null>(null)
	const [proofLinks, setProofLinks] = useState<Record<number, string>>({})

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
		try {
			setLoading(true)

			const projectData = await getProject(BigInt(projectId))
			setProject(projectData)

			const milestonePromises = [
				getMilestone(BigInt(projectId), 0),
				getMilestone(BigInt(projectId), 1),
				getMilestone(BigInt(projectId), 2),
			]

			const milestonesData = await Promise.all(milestonePromises)
			const formattedMilestones: MilestoneData[] = milestonesData.map((m, i) => ({
				index: i,
				name: m.name,
				amount: m.amount,
				released: m.released,
				completed: m.completed,
				status: m.status,
				proofURI: m.proofURI,
				agreeCount: m.agreeCount,
				disagreeCount: m.disagreeCount,
				totalVotes: m.totalVotes,
				voteDeadline: m.voteDeadline,
				finalized: m.finalized,
			}))

			setMilestones(formattedMilestones)

			try {
				const rewardURI = await getProjectRewardURI(BigInt(projectId))
				if (rewardURI) {
					const meta = await fetchMetadataFromIPFS(rewardURI)
					setMetadata(meta)
				}
			} catch (metaErr) {
				console.error("Failed to fetch metadata:", metaErr)
			}
		} catch (error) {
			console.error("Error fetching project:", error)
			alert("Failed to load project details: " + (error as Error).message)
		} finally {
			setLoading(false)
		}
	}

	const handleReleaseMilestone = async (index: number) => {
		try {
			setReleasingMilestone(index)
			const tx = await releaseMilestone(BigInt(projectId), index)
			alert(`Milestone funds released to your wallet!\nAmount: ${formatEther(milestones[index].amount)} ETH\nTransaction: ${tx}`)
			await fetchProjectDetails()
		} catch (err: any) {
			console.error("Error releasing milestone:", err)
			alert(`Failed to release milestone: ${err.message}`)
		} finally {
			setReleasingMilestone(null)
		}
	}

	const handleUploadProof = async (milestoneIndex: number) => {
		const ipfsLink = proofLinks[milestoneIndex]
		if (!ipfsLink || !ipfsLink.trim()) {
			alert("Please enter IPFS link for the proof image")
			return
		}

		// Validate IPFS link format
		if (!ipfsLink.startsWith('ipfs://') && !ipfsLink.includes('ipfs')) {
			alert("Please enter a valid IPFS link (e.g., ipfs://... or https://gateway.pinata.cloud/ipfs/...)")
			return
		}

		try {
			setUploadingProof(milestoneIndex)
			
			// Convert to ipfs:// format if needed
			let proofUri = ipfsLink
			if (ipfsLink.includes('gateway.pinata.cloud') || ipfsLink.includes('ipfs.io')) {
				const cid = ipfsLink.split('/ipfs/')[1]?.split('?')[0]
				if (cid) {
					proofUri = `ipfs://${cid}`
				}
			}

			// Submit to smart contract
			const hash = await proposeMilestoneCompletion(
				BigInt(projectId),
				milestoneIndex,
				proofUri
			)

			alert(`Proof submitted & voting started!\nTransaction: ${hash}`)
			await fetchProjectDetails()
			
			// Clear input after success
			setProofLinks((prev) => ({
				...prev,
				[milestoneIndex]: "",
			}))
		} catch (err: any) {
			console.error("Error proposing milestone:", err)
			alert(`Failed to propose milestone: ${err.message || "Unknown error"}`)
		} finally {
			setUploadingProof(null)
		}
	}

	const getTimeRemaining = (deadline: bigint) => {
		const now = Math.floor(Date.now() / 1000)
		const deadlineSeconds = Number(deadline)
		const remaining = deadlineSeconds - now

		if (remaining <= 0) return { text: "Voting Ended", expired: true, seconds: 0 }

		const days = Math.floor(remaining / 86400)
		const hours = Math.floor((remaining % 86400) / 3600)
		const minutes = Math.floor((remaining % 3600) / 60)

		if (days > 0) return { text: `${days}d ${hours}h remaining`, expired: false, seconds: remaining }
		if (hours > 0) return { text: `${hours}h ${minutes}m remaining`, expired: false, seconds: remaining }
		return { text: `${minutes}m remaining`, expired: false, seconds: remaining }
	}

	// Auto-refresh countdown
	useEffect(() => {
		if (!milestones.length) return
		const hasActiveVoting = milestones.some(m => m.status === 1 && !m.finalized)
		if (!hasActiveVoting) return

		const interval = setInterval(() => {
			setMilestones(prev => [...prev])
		}, 1000)

		return () => clearInterval(interval)
	}, [milestones])

	// Check if current user is creator
	const isCreator = account && project && account.toLowerCase() === project.creator.toLowerCase()

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

	if (!isCreator) {
		return (
			<div className="min-h-screen bg-white dark:bg-slate-950">
				<TopNav />
				<div className="text-center py-20">
					<p className="text-red-600 dark:text-red-400 mb-4">
						⚠️ Access Denied: Only the project creator can manage this project
					</p>
					<button
						onClick={() => router.push(`/project/${projectId}`)}
						className="btn-gradient"
					>
						View Public Project Page
					</button>
				</div>
				<Footer />
			</div>
		)
	}

	const goalEth = Number(formatEther(project.targetAmount))
	const raisedEth = Number(formatEther(project.currentAmount))
	const progress = goalEth > 0 ? (raisedEth / goalEth) * 100 : 0

	return (
		<div className="min-h-screen bg-white dark:bg-slate-950">
			<TopNav />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="mb-6 flex items-center justify-between">
					<button
						onClick={() => router.back()}
						className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
					>
						← Back
					</button>
					<button
						onClick={() => router.push(`/project/${projectId}`)}
						className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
					>
						<ExternalLink className="w-4 h-4" />
						View Public Page
					</button>
				</div>

				<div className="mb-6 card-glow rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
					<h1 className="text-3xl font-bold mb-2">Manage Your Project</h1>
					<p className="text-lg opacity-90">{project.title}</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-6">
						{/* Project Image */}
						<div className="relative h-64 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl overflow-hidden">
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

						{/* Funding Status Warning */}
						{!project.fullyFunded && (
							<div className="card-glow rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 p-6">
								<h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-2">
									⚠️ Project Not Fully Funded Yet
								</h3>
								<p className="text-sm text-yellow-700 dark:text-yellow-300">
									You need to reach 100% funding ({goalEth.toFixed(4)} ETH) before you can release any milestone.
									Currently at {progress.toFixed(1)}% ({raisedEth.toFixed(4)} ETH raised).
								</p>
							</div>
						)}

						{/* Milestones Management */}
						<div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6">
							<h2 className="text-2xl font-bold mb-4">Milestone Management</h2>
							<div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
								<h4 className="font-semibold mb-2">📋 How Milestones Work:</h4>
								<ul className="space-y-1 text-gray-700 dark:text-gray-300">
									<li>• <strong>Milestone 1:</strong> Release directly after 100% funded (no voting needed)</li>
									<li>• <strong>Milestone 2 & 3:</strong> Upload proof → 5 days voting → Release if approved</li>
									<li>• Voting requires &gt;50% agree votes to pass</li>
								</ul>
							</div>

							<div className="space-y-4">
								{milestones.map((milestone) => {
									const isVoting = milestone.status === 1 && !milestone.finalized
									const votePercentage = milestone.totalVotes > 0n 
										? Number((milestone.agreeCount * 100n) / milestone.totalVotes)
										: 0
									const timeRemaining = isVoting ? getTimeRemaining(milestone.voteDeadline) : null

									// Milestone 1: Can release directly if funded
									const canReleaseMilestone1 = milestone.index === 0 
										&& !milestone.released 
										&& project.fullyFunded

									// Milestone 2/3: Can release after voting passed and finalized
									const canReleaseMilestone23 = milestone.index > 0 
										&& !milestone.released 
										&& milestone.completed 
										&& milestone.finalized

									// Can propose logic
									let canPropose = false
									if (milestone.index === 1) {
										canPropose = milestones[0].released 
											&& !milestone.completed 
											&& milestone.status === 0
									} else if (milestone.index === 2) {
										canPropose = milestones[1].released 
											&& milestones[1].completed 
											&& !milestone.completed 
											&& milestone.status === 0
									}

									return (
										<div
											key={milestone.index}
											className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg space-y-3"
										>
											<div className="flex items-center gap-4">
												<div
													className={`w-10 h-10 rounded-full flex items-center justify-center ${
														milestone.released && milestone.completed
															? "bg-green-500 text-white"
															: milestone.released
															? "bg-blue-500 text-white"
															: "bg-gray-300 dark:bg-slate-600 text-gray-600 dark:text-gray-400"
													}`}
												>
													{milestone.released && milestone.completed ? (
														<Check className="w-5 h-5" />
													) : milestone.released ? (
														<DollarSign className="w-5 h-5" />
													) : (
														<Lock className="w-5 h-5" />
													)}
												</div>
												<div className="flex-1">
													<h3 className="font-semibold">
														Milestone {milestone.index + 1}: {milestone.name}
													</h3>
													<p className="text-sm text-gray-500 dark:text-gray-400">
														{formatEther(milestone.amount)} ETH
													</p>
												</div>
												<div>
													{milestone.released && milestone.completed ? (
														<span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
															✓ Released & Completed
														</span>
													) : milestone.released ? (
														<span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
															💰 Funds Released
														</span>
													) : isVoting ? (
														<span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
															⏳ Voting in Progress
														</span>
													) : (
														<span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 rounded-full">
															🔒 Locked
														</span>
													)}
												</div>
											</div>

											{/* Release Milestone 1 Button */}
											{canReleaseMilestone1 && (
												<div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
													<p className="text-sm font-medium mb-2 text-green-800 dark:text-green-200">
														🎉 Project fully funded! Release Milestone 1 to receive {formatEther(milestone.amount)} ETH
													</p>
													<button
														onClick={() => handleReleaseMilestone(milestone.index)}
														disabled={releasingMilestone === milestone.index}
														className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50"
													>
														{releasingMilestone === milestone.index ? (
															<>
																<Loader2 className="w-4 h-4 animate-spin" />
																Releasing Funds...
															</>
														) : (
															<>
																<DollarSign className="w-4 h-4" />
																Release Milestone 1 Funds
															</>
														)}
													</button>
												</div>
											)}

											{/* Release Milestone 2/3 After Voting Passed */}
											{canReleaseMilestone23 && (
												<div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
													<p className="text-sm font-medium mb-2 text-green-800 dark:text-green-200">
														✓ Voting passed! Release funds to receive {formatEther(milestone.amount)} ETH
													</p>
													<button
														onClick={() => handleReleaseMilestone(milestone.index)}
														disabled={releasingMilestone === milestone.index}
														className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50"
													>
														{releasingMilestone === milestone.index ? (
															<>
																<Loader2 className="w-4 h-4 animate-spin" />
																Releasing Funds...
															</>
														) : (
															<>
																<DollarSign className="w-4 h-4" />
																Release Milestone {milestone.index + 1} Funds
															</>
														)}
													</button>
												</div>
											)}

											{/* Upload Proof Section */}
											{canPropose && (
												<div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
													<p className="text-sm font-medium mb-2">
														📤 Submit progress proof for Milestone {milestone.index + 1}:
													</p>
													<p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
														Upload your proof image to <strong>Pinata</strong> or IPFS, then paste the link below.
														This will start a 5-day voting period.
													</p>
													{milestone.index === 1 && (
														<p className="text-xs text-green-600 dark:text-green-400 mb-2">
															✓ Milestone 1 has been released. You can now propose Milestone 2.
														</p>
													)}
													{milestone.index === 2 && (
														<p className="text-xs text-green-600 dark:text-green-400 mb-2">
															✓ Milestone 2 has been completed. You can now propose Milestone 3.
														</p>
													)}
													
													{/* IPFS Link Input */}
													<div className="mb-3">
														<label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
															IPFS Link (from Pinata or other gateway)
														</label>
														<input
															type="text"
															value={proofLinks[milestone.index] || ""}
															onChange={(e) =>
																setProofLinks((prev) => ({
																	...prev,
																	[milestone.index]: e.target.value,
																}))
															}
															placeholder="ipfs://... or https://gateway.pinata.cloud/ipfs/..."
															className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
														/>
														<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
															Example: ipfs://QmXxxx... or https://gateway.pinata.cloud/ipfs/QmXxxx...
														</p>
													</div>

													{/* Preview if link exists */}
													{proofLinks[milestone.index] && proofLinks[milestone.index].trim() && (
														<div className="mb-3">
															<p className="text-xs font-medium mb-1">Preview:</p>
															<img
																src={ipfsToHttp(proofLinks[milestone.index])}
																alt="Proof preview"
																className="w-full h-48 object-cover rounded-lg border-2 border-blue-500"
																onError={(e) => {
																	(e.target as HTMLImageElement).style.display = 'none'
																}}
															/>
														</div>
													)}
													
													{/* Submit Button */}
													<button
														onClick={() => handleUploadProof(milestone.index)}
														disabled={uploadingProof === milestone.index || !proofLinks[milestone.index]?.trim()}
														className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
													>
														{uploadingProof === milestone.index ? (
															<>
																<Loader2 className="w-4 h-4 animate-spin" />
																Submitting...
															</>
														) : (
															<>
																<Upload className="w-4 h-4" />
																Submit Proof & Start Voting
															</>
														)}
													</button>
													<div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
														<strong>💡 Tip:</strong> Upload your image to <a href="https://app.pinata.cloud" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Pinata</a> first, then copy the IPFS link here.
													</div>
												</div>
											)}

											{/* Voting Status */}
											{isVoting && (
												<div className="p-3 bg-white dark:bg-slate-600 rounded-lg">
													<div className="flex items-center justify-between mb-2">
														<p className="text-sm font-medium">Voting in Progress</p>
														{timeRemaining && (
															<span className={`text-xs flex items-center gap-1 ${
																timeRemaining.expired ? "text-red-600 dark:text-red-400 font-semibold" : "text-gray-500"
															}`}>
																<Clock className="w-3 h-3" />
																{timeRemaining.text}
															</span>
														)}
													</div>
													<div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-2">
														<div
															className="bg-green-500 h-2 rounded-full transition-all"
															style={{ width: `${votePercentage}%` }}
														/>
													</div>
													<div className="flex justify-between text-xs mb-2">
														<span className="text-green-600 dark:text-green-400">
															✓ Agree: {milestone.agreeCount.toString()} ({votePercentage.toFixed(1)}%)
														</span>
														<span className="text-red-600 dark:text-red-400">
															✗ Disagree: {milestone.disagreeCount.toString()}
														</span>
													</div>
													{milestone.proofURI && (
														<div className="mt-3">
															<p className="text-xs font-medium mb-2">Progress Proof:</p>
															<a
																href={ipfsToHttp(milestone.proofURI)}
																target="_blank"
																rel="noopener noreferrer"
																className="block"
															>
																<img
																	src={ipfsToHttp(milestone.proofURI)}
																	alt="Milestone proof"
																	className="w-full h-48 object-cover rounded-lg border-2 border-blue-500"
																/>
																<span className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block">
																	View Full Image →
																</span>
															</a>
														</div>
													)}
													<div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
														<strong>ℹ️ Note:</strong> After 5 days, supporters will finalize the vote. 
														If &gt;50% agree, you can release the funds.
													</div>
												</div>
											)}

											{/* Reset Notice */}
											{milestone.released && !milestone.completed && milestone.status === 0 && milestone.finalized && milestone.index > 0 && (
												<div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
													<p className="text-xs text-orange-800 dark:text-orange-200">
														<strong>🔄 Previous voting did not pass (&lt;50% agree).</strong> 
														Upload new proof to start voting again.
													</p>
												</div>
											)}
										</div>
									)
								})}
							</div>
						</div>
					</div>

					{/* Right Column - Stats */}
					<div className="lg:col-span-1">
						<div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6 sticky top-6">
							<h2 className="text-xl font-bold mb-4">Project Stats</h2>

							<div className="space-y-4">
								<div>
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Funding Progress</p>
									<div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-2">
										<div
											className="gradient-primary h-2 rounded-full transition-all"
											style={{ width: `${Math.min(progress, 100)}%` }}
										/>
									</div>
									<p className="text-lg font-bold">
										{raisedEth.toFixed(4)} / {goalEth.toFixed(4)} ETH
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{progress.toFixed(1)}% funded
									</p>
								</div>

								<div className="pt-4 border-t border-gray-200 dark:border-slate-700">
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Milestones Status</p>
									<div className="space-y-2">
										<div className="flex justify-between text-sm">
											<span>Completed:</span>
											<span className="font-semibold text-green-600 dark:text-green-400">
												{milestones.filter(m => m.completed).length} / 3
											</span>
										</div>
										<div className="flex justify-between text-sm">
											<span>In Progress:</span>
											<span className="font-semibold text-blue-600 dark:text-blue-400">
												{milestones.filter(m => m.released && !m.completed).length}
											</span>
										</div>
										<div className="flex justify-between text-sm">
											<span>Locked:</span>
											<span className="font-semibold text-gray-600 dark:text-gray-400">
												{milestones.filter(m => !m.released && !m.completed).length}
											</span>
										</div>
									</div>
								</div>

								<div className="pt-4 border-t border-gray-200 dark:border-slate-700">
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Project ID</p>
									<p className="font-mono text-lg">#{projectId}</p>
								</div>

								<div className="pt-4 border-t border-gray-200 dark:border-slate-700">
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
									<p className={`font-semibold ${project.fullyFunded ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
										{project.fullyFunded ? '✓ Fully Funded' : '📈 Funding in Progress'}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	)
}
