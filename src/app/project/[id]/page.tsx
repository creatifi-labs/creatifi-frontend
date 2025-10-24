"use client"

import { releaseMilestone } from "@/lib/contracts/factory"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { TopNav } from "@/components/top-nav"
import { Footer } from "@/components/footer"
import { 
  getProject, 
  getMilestone, 
  getProjectRewardURI, 
  supportProject,
  voteMilestoneCompletion,
  finalizeMilestoneVote,
  isSupporter
} from "@/lib/contracts/factory"
import { fetchMetadataFromIPFS, ipfsToHttp } from "@/lib/ipfs"
import { formatEther, parseEther } from "viem"
import Image from "next/image"
import { Loader2, Check, Lock, ThumbsUp, ThumbsDown, Clock, Award, Crown, Star } from "lucide-react"
import { uploadToIPFS } from "@/lib/ipfs"
import { proposeMilestoneCompletion } from "@/lib/contracts/factory"


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
	status: number // 0=Pending, 1=Proposed, 2=Completed
	proofURI: string
	agreeCount: bigint
	disagreeCount: bigint
	totalVotes: bigint
	voteDeadline: bigint
	finalized: boolean
}

interface TierData {
	name: string
	minContribution: string
	benefits: string
}

export default function ProjectDetailPage() {
	const params = useParams()
	const router = useRouter()
	const projectId = Number(params.id)

	const [uploadingProof, setUploadingProof] = useState(false)
	const [selectedFiles, setSelectedFiles] = useState<Record<number, File | null>>({})

	const [account, setAccount] = useState<string>("")
	const [loading, setLoading] = useState(true)
	const [supporting, setSupporting] = useState(false)
	const [supportAmount, setSupportAmount] = useState("")
	const [isUserSupporter, setIsUserSupporter] = useState(false)
	const [votingOnMilestone, setVotingOnMilestone] = useState<number | null>(null)
	const [finalizingMilestone, setFinalizingMilestone] = useState<number | null>(null)

	const [project, setProject] = useState<ProjectData | null>(null)
	const [milestones, setMilestones] = useState<MilestoneData[]>([])
	const [metadata, setMetadata] = useState<any>(null)
	const [userTier, setUserTier] = useState<TierData | null>(null)
	const [myContribution, setMyContribution] = useState<bigint>(0n)

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
				status: m.status,
				proofURI: m.proofURI,
				agreeCount: m.agreeCount,
				disagreeCount: m.disagreeCount,
				totalVotes: m.totalVotes,
				voteDeadline: m.voteDeadline,
				finalized: m.finalized,
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

			// Check if current user is supporter and get contribution
			if (account) {
				try {
					const supporter = await isSupporter(BigInt(projectId), account)
					setIsUserSupporter(supporter)

					if (supporter) {
						const { getContribution } = await import('@/lib/contracts/factory')
						const contribution = await getContribution(BigInt(projectId), account)
						setMyContribution(contribution)
						
						// Determine user tier based on contribution
						if (metadata?.tiers && Array.isArray(metadata.tiers)) {
							const contributionEth = Number(formatEther(contribution))
							const sortedTiers = [...metadata.tiers].sort(
								(a: TierData, b: TierData) => parseFloat(b.minContribution) - parseFloat(a.minContribution)
							)
							
							for (const tier of sortedTiers) {
								if (contributionEth >= parseFloat(tier.minContribution)) {
									setUserTier(tier)
									break
								}
							}
						}
					}
				} catch (err) {
					console.error('Failed to check supporter status:', err)
				}
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

			// User input adalah NET AMOUNT yang mau di-contribute ke project
			const netAmount = parseFloat(supportAmount)
			
			// Calculate fee: 25/1025 ≈ 2.439% dari total
			// Jika user mau contribute X ETH, dia harus bayar: X / (1 - fee_rate)
			// fee_rate = 25/1025 ≈ 0.02439
			// total = netAmount / (1 - 0.02439) = netAmount * 1.025
			const feeNumerator = 25
			const feeDenominator = 1025
			const totalToPay = netAmount * (feeDenominator / (feeDenominator - feeNumerator))
			const fee = totalToPay - netAmount

			console.log(`Net contribution: ${netAmount} ETH`)
			console.log(`Platform fee: ${fee.toFixed(6)} ETH`)
			console.log(`Total to pay: ${totalToPay.toFixed(6)} ETH`)

			const hash = await supportProject(
				BigInt(projectId),
				parseEther(totalToPay.toString())
			)

			alert(
				`Support successful!\n` +
				`Net contribution: ${netAmount} ETH\n` +
				`Platform fee: ${fee.toFixed(6)} ETH\n` +
				`Total paid: ${totalToPay.toFixed(6)} ETH\n` +
				`Transaction: ${hash}`
			)

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

	const handleVote = async (milestoneIndex: number, agree: boolean) => {
		if (!account) {
			alert("Please connect your wallet")
			return
		}

		if (!isUserSupporter) {
			alert("Only supporters can vote")
			return
		}

		try {
			setVotingOnMilestone(milestoneIndex)

			const hash = await voteMilestoneCompletion(
				BigInt(projectId),
				milestoneIndex,
				agree
			)

			alert(`Vote submitted!\nTransaction: ${hash}`)
			await fetchProjectDetails()
		} catch (error: any) {
			console.error('Error voting:', error)
			alert(`Failed to vote: ${error.message || "Unknown error"}`)
		} finally {
			setVotingOnMilestone(null)
		}
	}

	const handleFinalize = async (milestoneIndex: number) => {
		try {
			setFinalizingMilestone(milestoneIndex)

			const hash = await finalizeMilestoneVote(
				BigInt(projectId),
				milestoneIndex
			)

			alert(`Voting finalized!\nTransaction: ${hash}`)
			await fetchProjectDetails()
		} catch (error: any) {
			console.error('Error finalizing:', error)
			alert(`Failed to finalize: ${error.message || "Unknown error"}`)
		} finally {
			setFinalizingMilestone(null)
		}
	}

	// Handle upload + propose milestone completion
	const handleUploadProof = async (milestoneIndex: number) => {
		if (!account) {
			alert("Please connect your wallet first")
			return
		}

		const file = selectedFiles[milestoneIndex]
		if (!file) {
			alert("Please select a file to upload")
			return
		}

		try {
			setUploadingProof(true)
			// Upload ke IPFS
			const cid = await uploadToIPFS(file)
			const proofUri = `ipfs://${cid}`

			// Kirim ke smart contract
			const hash = await proposeMilestoneCompletion(
				BigInt(projectId),
				milestoneIndex,
				proofUri
			)

			alert(`Proof uploaded & proposal submitted!\nTransaction: ${hash}`)
			await fetchProjectDetails()
		} catch (err: any) {
			console.error("Error proposing milestone:", err)
			alert(`Failed to propose milestone: ${err.message || "Unknown error"}`)
		} finally {
			setUploadingProof(false)
		}
	}

	const handleReleaseMilestone = async (index: number) => {
	try {
		const tx = await releaseMilestone(BigInt(projectId), index)
		alert(`Milestone released! Tx: ${tx}`)
		await fetchProjectDetails()
	} catch (err: any) {
		alert(`Failed: ${err.message}`)
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
		const seconds = remaining % 60

		let text = ""
		if (days > 0) text = `${days}d ${hours}h remaining`
		else if (hours > 0) text = `${hours}h ${minutes}m remaining`
		else if (minutes > 0) text = `${minutes}m ${seconds}s remaining`
		else text = `${seconds}s remaining`

		return { text, expired: false, seconds: remaining }
	}

	const getTierIcon = (tierName: string) => {
		const lowerName = tierName.toLowerCase()
		if (lowerName.includes('gold') || lowerName.includes('premium')) {
			return <Crown className="w-4 h-4 text-yellow-500" />
		} else if (lowerName.includes('silver')) {
			return <Star className="w-4 h-4 text-gray-400" />
		} else if (lowerName.includes('bronze')) {
			return <Award className="w-4 h-4 text-orange-600" />
		}
		return <Award className="w-4 h-4" />
	}

	const getTierColor = (tierName: string) => {
		const lowerName = tierName.toLowerCase()
		if (lowerName.includes('gold') || lowerName.includes('premium')) {
			return 'from-yellow-400 to-yellow-600'
		} else if (lowerName.includes('silver')) {
			return 'from-gray-300 to-gray-500'
		} else if (lowerName.includes('bronze')) {
			return 'from-orange-400 to-orange-600'
		}
		return 'from-blue-400 to-blue-600'
	}

	// Auto-refresh countdown every second for active votings
	useEffect(() => {
		if (!milestones.length) return

		const hasActiveVoting = milestones.some(m => m.status === 1 && !m.finalized)
		if (!hasActiveVoting) return

		const interval = setInterval(() => {
			// Force re-render to update countdown
			setMilestones(prev => [...prev])
		}, 1000)

		return () => clearInterval(interval)
	}, [milestones])

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

				{/* Your Tier Badge - Show at top if user is supporter */}
				{userTier && (
					<div className="mb-6 card-glow rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className={`p-3 bg-white/20 backdrop-blur-sm rounded-xl`}>
									{getTierIcon(userTier.name)}
								</div>
								<div>
									<p className="text-sm opacity-90 mb-1">🎉 Your Supporter Tier</p>
									<h3 className="text-2xl font-bold">{userTier.name}</h3>
									{userTier.benefits && (
										<p className="text-sm opacity-90 mt-1">{userTier.benefits}</p>
									)}
								</div>
							</div>
							<div className="text-right">
								<p className="text-sm opacity-90 mb-1">Your Total Contribution</p>
								<p className="text-3xl font-bold">{Number(formatEther(myContribution)).toFixed(4)} ETH</p>
							</div>
						</div>
					</div>
				)}

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

						{/* Supporter Tiers Section */}
						{metadata?.tiers && Array.isArray(metadata.tiers) && metadata.tiers.length > 0 && (
							<div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6">
								<h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
									<Award className="w-6 h-6" />
									Supporter Tiers
								</h2>
								
								{/* All Tiers */}
								<div className="space-y-3">
									{metadata.tiers
										.sort((a: TierData, b: TierData) => 
											parseFloat(a.minContribution) - parseFloat(b.minContribution)
										)
										.map((tier: TierData, index: number) => {
											const isUserCurrentTier = userTier?.name === tier.name
											
											return (
												<div
													key={index}
													className={`p-4 rounded-lg border-2 transition-all ${
														isUserCurrentTier
															? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
															: 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700'
													}`}
												>
													<div className="flex items-center gap-3 mb-2">
														<div className={`p-2 bg-gradient-to-br ${getTierColor(tier.name)} rounded-lg`}>
															{getTierIcon(tier.name)}
														</div>
														<div className="flex-1">
															<div className="flex items-center gap-2">
																<h3 className="font-semibold">{tier.name}</h3>
																{isUserCurrentTier && (
																	<span className="text-xs px-2 py-0.5 bg-purple-500 text-white rounded-full">
																		YOUR TIER
																	</span>
																)}
															</div>
															<p className="text-sm text-gray-600 dark:text-gray-400">
																Min. {tier.minContribution} ETH
															</p>
														</div>
													</div>
													{tier.benefits && (
														<p className="text-sm text-gray-700 dark:text-gray-300 ml-11">
															{tier.benefits}
														</p>
													)}
												</div>
											)
										})}
								</div>
							</div>
						)}

						{/* Milestones */}
						<div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6">
							<h2 className="text-2xl font-bold mb-4">Milestones</h2>
							<div className="space-y-4">
								{milestones.map((milestone) => {
									const isVoting = milestone.status === 1 && !milestone.finalized
									const canVote = isUserSupporter && isVoting
									const canFinalize = isVoting && Number(milestone.voteDeadline) <= Math.floor(Date.now() / 1000)
									const votePercentage = milestone.totalVotes > 0n 
										? Number((milestone.agreeCount * 100n) / milestone.totalVotes)
										: 0

									return (
										<div
											key={milestone.index}
											className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg space-y-3"
										>
											<div className="flex items-center gap-4">
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
													) : isVoting ? (
														<span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
															Voting
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
											
											{/* Proof Upload (Creator Only) */}
											{account?.toLowerCase() === project.creator.toLowerCase() &&
												milestone.released &&
												!milestone.completed &&
												milestone.status === 0 && (
												<div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
													<p className="text-sm font-medium mb-2">Upload progress proof (start milestone voting):</p>
													<input
														type="file"
														onChange={(e) =>
															setSelectedFiles((prev) => ({
																...prev,
																[milestone.index]: e.target.files?.[0] || null,
															}))
														}
														className="text-sm mb-2"
													/>
													<button
														onClick={() => handleUploadProof(milestone.index)}
														disabled={uploadingProof}
														className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
													>
														{uploadingProof ? "Uploading..." : "Submit Proof & Start Voting"}
													</button>
												</div>
											)}

											{account?.toLowerCase() === project.creator.toLowerCase() &&
												!milestone.released && (
												<button
													onClick={() => handleReleaseMilestone(milestone.index)}
													className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
												>
													Release Milestone
												</button>
											)}

											{/* Voting Section */}
											{isVoting && (
												<div className="mt-3 p-3 bg-white dark:bg-slate-600 rounded-lg">
													<div className="flex items-center justify-between mb-2">
														<span className="text-sm font-medium">Voting Progress</span>
														<span className={`text-xs flex items-center gap-1 ${
															getTimeRemaining(milestone.voteDeadline).expired
																? "text-red-600 dark:text-red-400 font-semibold"
																: "text-gray-500 dark:text-gray-400"
														}`}>
															<Clock className="w-3 h-3" />
															{getTimeRemaining(milestone.voteDeadline).text}
														</span>
													</div>

													{/* Expired Warning */}
													{getTimeRemaining(milestone.voteDeadline).expired && (
														<div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
															<strong>⚠️ Voting period ended!</strong> Anyone can finalize the voting now.
														</div>
													)}

													{/* Progress Bar */}
													<div className="mb-3">
														<div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
															<div
																className="bg-green-500 h-2 rounded-full transition-all"
																style={{ width: `${votePercentage}%` }}
															/>
														</div>
														<div className="flex justify-between text-xs mt-1">
															<span className="text-green-600 dark:text-green-400">
																Agree: {milestone.agreeCount.toString()} ({votePercentage.toFixed(1)}%)
															</span>
															<span className="text-red-600 dark:text-red-400">
																Disagree: {milestone.disagreeCount.toString()}
															</span>
														</div>
														<div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
															Total Votes: {milestone.totalVotes.toString()}
															{milestone.totalVotes === 0n && " (No votes yet)"}
														</div>
													</div>

													{/* Proof Link */}
													{milestone.proofURI && (
														<div className="mb-3">
															<a
																href={ipfsToHttp(milestone.proofURI)}
																target="_blank"
																rel="noopener noreferrer"
																className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
															>
																<span>📄 View Progress Proof</span>
																<span>→</span>
															</a>
														</div>
													)}

													{/* Vote Buttons */}
													{canVote && !canFinalize && (
														<div className="flex gap-2">
															<button
																onClick={() => handleVote(milestone.index, true)}
																disabled={votingOnMilestone === milestone.index}
																className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
															>
																{votingOnMilestone === milestone.index ? (
																	<Loader2 className="w-4 h-4 animate-spin" />
																) : (
																	<ThumbsUp className="w-4 h-4" />
																)}
																Agree
															</button>
															<button
																onClick={() => handleVote(milestone.index, false)}
																disabled={votingOnMilestone === milestone.index}
																className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm disabled:opacity-50"
															>
																{votingOnMilestone === milestone.index ? (
																	<Loader2 className="w-4 h-4 animate-spin" />
																) : (
																	<ThumbsDown className="w-4 h-4" />
																)}
																Disagree
															</button>
														</div>
													)}

													{/* Finalize Button */}
													{canFinalize && (
														<div className="space-y-2">
															<div className="p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded text-xs text-purple-800 dark:text-purple-200">
																{milestone.totalVotes === 0n ? (
																	<>
																		<strong>⚠️ No votes received!</strong> If finalized, milestone will be reset and creator can propose again.
																	</>
																) : votePercentage <= 50 ? (
																	<>
																		<strong>⚠️ Less than 50% agree!</strong> If finalized, milestone will be reset and creator can propose again.
																	</>
																) : (
																	<>
																		<strong>✓ More than 50% agree!</strong> If finalized, milestone will be marked as completed.
																	</>
																)}
															</div>
															<button
																onClick={() => handleFinalize(milestone.index)}
																disabled={finalizingMilestone === milestone.index}
																className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm disabled:opacity-50"
															>
																{finalizingMilestone === milestone.index ? (
																	<Loader2 className="w-4 h-4 animate-spin" />
																) : (
																	"Finalize Voting"
																)}
															</button>
														</div>
													)}

													{!canVote && !canFinalize && (
														<p className="text-xs text-center text-gray-500 dark:text-gray-400">
															{isUserSupporter ? "You have already voted" : "Only supporters can vote"}
														</p>
													)}
												</div>
											)}

											{/* Reset Notice (when milestone back to Pending after failed vote) */}
											{milestone.released && !milestone.completed && milestone.status === 0 && milestone.finalized && (
												<div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
													<p className="text-xs text-orange-800 dark:text-orange-200">
														<strong>🔄 Voting period expired or failed!</strong> Creator needs to propose completion again with new proof.
													</p>
												</div>
											)}
										</div>
									)
								})}
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
											Contribution Amount (ETH)
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
											Amount that will go to the project (excluding platform fee and network gas fee)
										</p>
									</div>

									{/* Fee Breakdown */}
									{supportAmount && parseFloat(supportAmount) > 0 && (
										<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
											<p className="text-gray-700 dark:text-gray-300 mb-1">
												<strong>Contribution to project:</strong> {parseFloat(supportAmount).toFixed(6)} ETH
											</p>
											<p className="text-gray-700 dark:text-gray-300 mb-1">
												<strong>Platform fee (2.5%):</strong>{" "}
												{(parseFloat(supportAmount) * (25 / (1025 - 25))).toFixed(6)} ETH
											</p>
											<p className="text-gray-700 dark:text-gray-300 font-semibold mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
												<strong>Total to pay:</strong>{" "}
												{(parseFloat(supportAmount) * (1025 / 1000)).toFixed(6)} ETH
											</p>
										</div>
									)}

									{/* Tier Preview in Support Form */}
									{supportAmount && parseFloat(supportAmount) > 0 && metadata?.tiers && Array.isArray(metadata.tiers) && metadata.tiers.length > 0 && (
										<div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
											<p className="text-xs font-medium mb-2">🎁 You'll receive:</p>
											{(() => {
												const amount = parseFloat(supportAmount)
												const sortedTiers = [...metadata.tiers].sort(
													(a: TierData, b: TierData) => parseFloat(b.minContribution) - parseFloat(a.minContribution)
												)
												const matchedTier = sortedTiers.find((t: TierData) => amount >= parseFloat(t.minContribution))
												
												if (matchedTier) {
													return (
														<div className="flex items-center gap-2">
															<div className={`p-1.5 bg-gradient-to-br ${getTierColor(matchedTier.name)} rounded`}>
																{getTierIcon(matchedTier.name)}
															</div>
															<div>
																<p className="text-sm font-semibold">{matchedTier.name}</p>
																{matchedTier.benefits && (
																	<p className="text-xs text-gray-600 dark:text-gray-400">
																		{matchedTier.benefits}
																	</p>
																)}
															</div>
														</div>
													)
												}
												return (
													<p className="text-xs text-gray-600 dark:text-gray-400">
														Supporter status (increase amount for tier rewards)
													</p>
												)
											})()}
										</div>
									)}

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
