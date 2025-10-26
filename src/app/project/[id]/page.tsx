"use client"

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
  isSupporter,
  getContribution,
} from "@/lib/contracts/factory"
import { fetchMetadataFromIPFS, ipfsToHttp } from "@/lib/ipfs"
import { formatEther, parseEther } from "viem"
import Image from "next/image"
import { Loader2, Check, Lock, ThumbsUp, ThumbsDown, Clock, Award, Crown, Star } from "lucide-react"
import toast from "react-hot-toast"


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

	const [account, setAccount] = useState<string>("")
	const [loading, setLoading] = useState(true)
	const [supporting, setSupporting] = useState(false)
	const [supportAmount, setSupportAmount] = useState("")
	const [isUserSupporter, setIsUserSupporter] = useState(false)
	const [votingOnMilestone, setVotingOnMilestone] = useState<number | null>(null)
	const [finalizingMilestone, setFinalizingMilestone] = useState<number | null>(null)
	const [userVotedMilestones, setUserVotedMilestones] = useState<Record<number, boolean>>({})

	const [project, setProject] = useState<ProjectData | null>(null)
	const [milestones, setMilestones] = useState<MilestoneData[]>([])
	const [metadata, setMetadata] = useState<any>(null)
	const [userTier, setUserTier] = useState<TierData | null>(null)
	const [myContribution, setMyContribution] = useState<bigint>(0n)

	useEffect(() => {
		checkConnection()
	}, [])

	useEffect(() => {
		if (projectId && account) {
			fetchProjectDetails()
		}
	}, [projectId, account])

	useEffect(() => {
		if (!metadata?.tiers || !Array.isArray(metadata.tiers) || myContribution === 0n) {
			setUserTier(null)
			return
		}

		const contributionEth = Number(formatEther(myContribution))
		const sortedTiers = [...metadata.tiers].sort(
			(a: TierData, b: TierData) => parseFloat(b.minContribution) - parseFloat(a.minContribution)
		)
		
		let matchedTier: TierData | null = null
		for (const tier of sortedTiers) {
			if (contributionEth >= parseFloat(tier.minContribution)) {
				matchedTier = tier
				break
			}
		}
		
		setUserTier(matchedTier)
	}, [metadata, myContribution])

	// Load voting status from localStorage
	useEffect(() => {
		if (account && projectId) {
			const votingKey = `voted_${account}_${projectId}`
			const storedVotes = localStorage.getItem(votingKey)
			if (storedVotes) {
				try {
					setUserVotedMilestones(JSON.parse(storedVotes))
				} catch (e) {
					console.error('Failed to parse voting history', e)
				}
			}
		}
	}, [account, projectId])

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
		console.log('Current Account:', account)
		
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

			// ✅ CHECK SUPPORTER STATUS - WITH DETAILED LOGGING
			if (account) {
				console.log('=== CHECKING SUPPORTER STATUS ===')
				console.log('Account to check:', account)
				console.log('Project ID:', projectId)
				
				try {
					// Check contribution from smart contract
					const contribution = await getContribution(BigInt(projectId), account)
					console.log('📊 Contribution from contract (wei):', contribution.toString())
					console.log('📊 Contribution from contract (ETH):', formatEther(contribution))
					
					// Determine supporter status
					const supporter = contribution > 0n
					console.log('✅ Is Supporter (contribution > 0)?', supporter)
					
					setIsUserSupporter(supporter)
					setMyContribution(contribution)
					
					// Additional debug: Try isSupporter function
					const supporterCheck = await isSupporter(BigInt(projectId), account)
					console.log('🔍 isSupporter() function result:', supporterCheck)
					
					if (supporter !== supporterCheck) {
						console.warn('⚠️ MISMATCH! contribution > 0 says:', supporter, 'but isSupporter() says:', supporterCheck)
					}
					
				} catch (err) {
					console.error('❌ Failed to check supporter status:', err)
					console.error('Error details:', err)
				}
			} else {
				console.log('⚠️ No account connected, skipping supporter check')
			}

			console.log('=== FETCH COMPLETE ===')
			console.log('Final state:')
			console.log('- isUserSupporter:', isUserSupporter)
			console.log('- myContribution:', myContribution.toString())
		} catch (error) {
			console.error("=== ERROR FETCHING PROJECT ===")
			console.error("Error details:", error)
			console.error("Error message:", (error as Error).message)
			console.error("Error stack:", (error as Error).stack)
			
			toast.error("❌ Failed to load project details: " + (error as Error).message)
			
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
			toast.error("❌ Please connect your wallet")
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

			toast.success(
			`🎉 Support successful!\nNet: ${netAmount} ETH\nFee: ${fee.toFixed(6)} ETH\nTotal: ${totalToPay.toFixed(6)} ETH\nTxn: ${hash}`
			)


			// Refresh project data
			await fetchProjectDetails()
			setSupportAmount("")
		} catch (error: any) {
			console.error("Error supporting project:", error)
			toast.error(`❌ Failed to support project: ${error.message || "Unknown error"}`)
		} finally {
			setSupporting(false)
		}
	}

	const saveVotingStatus = (milestoneIndex: number) => {
		if (!account || !projectId) return
		
		const votingKey = `voted_${account}_${projectId}`
		const newVotes = { ...userVotedMilestones, [milestoneIndex]: true }
		setUserVotedMilestones(newVotes)
		localStorage.setItem(votingKey, JSON.stringify(newVotes))
	}

	const handleVote = async (milestoneIndex: number, agree: boolean) => {
		console.log('=== HANDLE VOTE CALLED ===')
		console.log('Account:', account)
		console.log('isUserSupporter:', isUserSupporter)
		console.log('Milestone Index:', milestoneIndex)
		console.log('Vote:', agree ? 'AGREE' : 'DISAGREE')
		
		if (!account) {
			console.error('❌ No account connected')
			alert("Please connect your wallet")
			return
		}

		if (!isUserSupporter) {
			console.error('❌ User is not a supporter!')
			console.error('Current isUserSupporter value:', isUserSupporter)
			console.error('Current myContribution:', myContribution.toString())
			alert("Only supporters can vote")
			return
		}

		// Check if user already voted
		if (userVotedMilestones[milestoneIndex]) {
			toast.error("❌ You have already voted on this milestone")
			return
		}

		try {
			setVotingOnMilestone(milestoneIndex)

			const hash = await voteMilestoneCompletion(
				BigInt(projectId),
				milestoneIndex,
				agree
			)

			// Save voting status
			saveVotingStatus(milestoneIndex)

			toast.success(`🗳️ Vote submitted!\nTxn: ${hash}`)
			await fetchProjectDetails()
		} catch (error: any) {
			console.error('❌ Error voting:', error)
			toast.error(`❌ Failed to vote: ${error.message || "Unknown error"}`)
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

			toast.success(`✅ Voting finalized!\nTxn: ${hash}`)
			await fetchProjectDetails()
		} catch (error: any) {
			console.error('Error finalizing:', error)
			toast.error(`❌ Failed to finalize: ${error.message || "Unknown error"}`)
		} finally {
			setFinalizingMilestone(null)
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
		if (lowerName.includes('gold')) return <Crown className="w-4 h-4 text-yellow-500" />
		if (lowerName.includes('silver')) return <Star className="w-4 h-4 text-gray-400" />
		if (lowerName.includes('bronze')) return <Award className="w-4 h-4 text-orange-600" />
		return <Award className="w-4 h-4" />
	}

	const getTierColor = (tierName: string) => {
		const lowerName = tierName.toLowerCase()
		if (lowerName.includes('gold')) return 'from-yellow-400 to-yellow-600'
		if (lowerName.includes('silver')) return 'from-gray-300 to-gray-500'
		if (lowerName.includes('bronze')) return 'from-orange-400 to-orange-600'
		return 'from-blue-400 to-blue-600'
	}

	const getTierRewardFromMeta = (tierName: string) => {
		const tiers = Array.isArray(metadata?.tiers) ? metadata.tiers : []
		const found = tiers.find(
			(t: any) => String(t?.name || "").toLowerCase() === tierName.toLowerCase()
		)
		return found?.benefits || found?.description || ""
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
					<button onClick={() => router.push("/explore")} className="mt-4 btn-gradient">
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

	// === Batas harga tier berdasar persentase target ===
	const silverMinEth = goalEth * 0.20;
	const goldMinEth = goalEth * 0.30;

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
									<p className="text-gray-500 dark:text-gray-400 mb-1">Creator</p>
									<p className="font-mono text-xs break-all">
										{project.creator}
									</p>
								</div>
								<div>
									<p className="text-gray-500 dark:text-gray-400">Project ID</p>
									<p className="font-semibold">#{projectId}</p>
								</div>
							</div>
						</div>
						
						{/* Supporter Tiers (Bronze / Silver / Gold) */}
						<div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6">
						<h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
							<Award className="w-6 h-6" />
							Supporter Tiers
						</h2>

						<div className="space-y-3">
							{/* GOLD */}
							<div
							className={`p-4 rounded-lg border-2 transition-all ${
								userTier?.name?.toLowerCase() === "gold"
								? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
								: "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700"
							}`}
							>
							<div className="flex items-center gap-3 mb-2">
								<div className={`p-2 bg-gradient-to-br ${getTierColor("gold")} rounded-lg`}>
								{getTierIcon("gold")}
								</div>
								<div className="flex-1">
								<div className="flex items-center gap-2">
									<h3 className="font-semibold">Gold</h3>
									{userTier?.name?.toLowerCase() === "gold" && (
									<span className="text-xs px-2 py-0.5 bg-purple-500 text-white rounded-full">
										YOUR TIER
									</span>
									)}
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									≥ {goldMinEth.toFixed(4)} ETH <span className="opacity-70">(30% of target)</span>
								</p>
								</div>
							</div>
							{getTierRewardFromMeta("gold") && (
								<p className="text-sm text-gray-700 dark:text-gray-300 ml-11">
								{getTierRewardFromMeta("gold")}
								</p>
							)}
							</div>

							{/* SILVER */}
							<div
							className={`p-4 rounded-lg border-2 transition-all ${
								userTier?.name?.toLowerCase() === "silver"
								? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
								: "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700"
							}`}
							>
							<div className="flex items-center gap-3 mb-2">
								<div className={`p-2 bg-gradient-to-br ${getTierColor("silver")} rounded-lg`}>
								{getTierIcon("silver")}
								</div>
								<div className="flex-1">
								<div className="flex items-center gap-2">
									<h3 className="font-semibold">Silver</h3>
									{userTier?.name?.toLowerCase() === "silver" && (
									<span className="text-xs px-2 py-0.5 bg-purple-500 text-white rounded-full">
										YOUR TIER
									</span>
									)}
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									≥ {silverMinEth.toFixed(4)} ETH <span className="opacity-70">(20% of target)</span>
								</p>
								</div>
							</div>
							{getTierRewardFromMeta("silver") && (
								<p className="text-sm text-gray-700 dark:text-gray-300 ml-11">
								{getTierRewardFromMeta("silver")}
								</p>
							)}
							</div>

							{/* BRONZE */}
							<div
							className={`p-4 rounded-lg border-2 transition-all ${
								userTier?.name?.toLowerCase() === "bronze"
								? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
								: "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700"
							}`}
							>
							<div className="flex items-center gap-3 mb-2">
								<div className={`p-2 bg-gradient-to-br ${getTierColor("bronze")} rounded-lg`}>
								{getTierIcon("bronze")}
								</div>
								<div className="flex-1">
								<div className="flex items-center gap-2">
									<h3 className="font-semibold">Bronze</h3>
									{userTier?.name?.toLowerCase() === "bronze" && (
									<span className="text-xs px-2 py-0.5 bg-purple-500 text-white rounded-full">
										YOUR TIER
									</span>
									)}
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									&lt; {silverMinEth.toFixed(4)} ETH <span className="opacity-70">(&lt;20% of target)</span>
								</p>
								</div>
							</div>
							{getTierRewardFromMeta("bronze") && (
								<p className="text-sm text-gray-700 dark:text-gray-300 ml-11">
								{getTierRewardFromMeta("bronze")}
								</p>
							)}
							</div>
						</div>
						</div>


						{/* Milestones */}
						<div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6">
							<h2 className="text-2xl font-bold mb-4">Milestones</h2>
							<div className="space-y-4">
								{milestones.map((milestone) => {
									const isVoting = milestone.status === 1 && !milestone.finalized
									const canVote = isUserSupporter && isVoting
									const hasVoted = userVotedMilestones[milestone.index]
									const canFinalize = isVoting && Number(milestone.voteDeadline) <= Math.floor(Date.now() / 1000)
									const votePercentage = milestone.totalVotes > 0n 
										? Number((milestone.agreeCount * 100n) / milestone.totalVotes)
										: 0

									// ✅ DEBUG LOGGING FOR EACH MILESTONE
									console.log(`Milestone ${milestone.index} debug:`, {
										status: milestone.status,
										finalized: milestone.finalized,
										isVoting,
										isUserSupporter,
										canVote,
										canFinalize,
										voteDeadline: new Date(Number(milestone.voteDeadline) * 1000).toISOString(),
									})

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
															Released
														</span>
													) : (
														<span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 rounded-full">
															Upcoming
														</span>
													)}
												</div>
											</div>

											{/* Voting Section - Only for proposed milestones (status 1) */}
											{milestone.status === 1 && (
												<div className="mt-4">
													<div className="flex items-center gap-2 mb-2">
														<span className="text-xs text-gray-500 dark:text-gray-400">
															Voting ends in{" "}
														</span>
														<span className="text-xs font-semibold">
															{getTimeRemaining(milestone.voteDeadline).text}
														</span>
													</div>

													{/* Show voting status if user has voted */}
													{hasVoted ? (
														<div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
															<div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
																<Check className="w-5 h-5" />
																<span className="font-semibold">You have already voted on this milestone</span>
															</div>
															<p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
																Your vote has been recorded. Results will be available after voting period ends.
															</p>
														</div>
													) : canVote ? (
														<div className="flex gap-2">
															<button
																onClick={() => handleVote(milestone.index, true)}
																disabled={votingOnMilestone !== null || finalizingMilestone !== null}
																className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
																disabled:opacity-50
																bg-green-500 text-white hover:bg-green-600"
															>
																{votingOnMilestone === milestone.index ? (
																	<Loader2 className="w-5 h-5 animate-spin" />
																) : (
																	<ThumbsUp className="w-5 h-5" />
																)}
																Agree
															</button>
															<button
																onClick={() => handleVote(milestone.index, false)}
																disabled={votingOnMilestone !== null || finalizingMilestone !== null}
																className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
																disabled:opacity-50
																bg-red-500 text-white hover:bg-red-600"
															>
																{votingOnMilestone === milestone.index ? (
																	<Loader2 className="w-5 h-5 animate-spin" />
																) : (
																	<ThumbsDown className="w-5 h-5" />
																)}
																Disagree
															</button>
														</div>
													) : !isUserSupporter ? (
														<div className="p-3 bg-gray-100 dark:bg-slate-600 rounded-lg text-center">
															<p className="text-sm text-gray-600 dark:text-gray-400">
																Only supporters can vote on milestones
															</p>
														</div>
													) : null}

													{/* Show voting progress */}
													{milestone.totalVotes > 0n && (
														<div className="mt-3 space-y-2">
															<div className="flex justify-between text-sm">
																<span className="text-gray-600 dark:text-gray-400">Voting Progress</span>
																<span className="font-semibold">
																	{milestone.totalVotes.toString()} vote{Number(milestone.totalVotes) !== 1 ? 's' : ''}
																</span>
															</div>
															<div className="flex gap-2 items-center">
																<div className="flex-1 bg-gray-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
																	<div
																		className="bg-green-500 h-full transition-all"
																		style={{ width: `${votePercentage}%` }}
																	/>
																</div>
																<span className="text-sm font-semibold min-w-[50px] text-right">
																	{votePercentage.toFixed(1)}%
																</span>
															</div>
															<div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
																<span>👍 {milestone.agreeCount.toString()} Agree</span>
																<span>👎 {milestone.disagreeCount.toString()} Disagree</span>
															</div>
														</div>
													)}

													{/* Finalize button - Only visible if voting has ended and user is supporter */}
													{canFinalize && isUserSupporter && (
														<div className="mt-4">
															<button
																onClick={() => handleFinalize(milestone.index)}
																disabled={finalizingMilestone !== null}
																className="w-full px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
																disabled:opacity-50
																bg-blue-500 text-white hover:bg-blue-600"
															>
																{finalizingMilestone === milestone.index ? (
																	<>
																		<Loader2 className="w-4 h-4 animate-spin" />
																		Finalizing...
																	</>
																) : (
																	<>
																		<Check className="w-4 h-4" />
																		Finalize Voting
																	</>
																)}
															</button>
														</div>
													)}
												</div>
											)}
										</div>
									)
								})}
							</div>
						</div>
					</div>

					<div className="lg:col-span-1">
						<div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6 sticky top-6">
							<h2 className="text-2xl font-bold mb-6">Support This Project</h2>

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
											Please connect your wallet
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
