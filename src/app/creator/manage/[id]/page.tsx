"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { TopNav } from "@/components/top-nav"
import { Footer } from "@/components/footer"
import { 
  getProject, 
  getMilestone, 
  proposeMilestoneCompletion,
  releaseMilestone
} from "@/lib/contracts/factory"
import { uploadMetadataToPinata, formatIPFSUri } from "@/lib/pinata"
import { formatEther } from "viem"
import { Loader2, Upload, Lock, Check, Clock, ChevronRight } from "lucide-react"

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

  // Propose modal state
  const [showProposeModal, setShowProposeModal] = useState(false)
  const [proposingMilestone, setProposingMilestone] = useState<number | null>(null)
  const [proofImageCID, setProofImageCID] = useState("")
  const [proofDescription, setProofDescription] = useState("")
  const [uploadingProof, setUploadingProof] = useState(false)

  // Release milestone state
  const [releasingMilestone, setReleasingMilestone] = useState<number | null>(null)

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
    } catch (error) {
      console.error("Error fetching project:", error)
      alert("Failed to load project")
    } finally {
      setLoading(false)
    }
  }

  const handleProposeCompletion = async () => {
    if (!proofImageCID.trim()) {
      alert("Please provide proof image CID from Pinata")
      return
    }

    try {
      setUploadingProof(true)

      // Upload proof metadata to IPFS
      const proofMetadata = {
        name: `Milestone ${proposingMilestone! + 1} Progress Proof`,
        description: proofDescription,
        image: formatIPFSUri(proofImageCID.trim())
      }

      const metadataCID = await uploadMetadataToPinata(proofMetadata)
      const proofURI = formatIPFSUri(metadataCID)

      // Propose milestone completion on-chain
      const hash = await proposeMilestoneCompletion(
        BigInt(projectId),
        proposingMilestone!,
        proofURI
      )

      alert(`Proposal submitted!\nTransaction: ${hash}\nVoting period: 5 days`)
      
      // Reset modal state
      setShowProposeModal(false)
      setProposingMilestone(null)
      setProofImageCID("")
      setProofDescription("")
      
      await fetchProjectDetails()
    } catch (error: any) {
      console.error('Error proposing completion:', error)
      alert(`Failed to propose completion: ${error.message || "Unknown error"}`)
    } finally {
      setUploadingProof(false)
    }
  }

  const handleReleaseFunds = async (milestoneIndex: number) => {
    const confirmed = confirm(
      `Release ${formatEther(milestones[milestoneIndex].amount)} ETH for milestone "${milestones[milestoneIndex].name}"?`
    )

    if (!confirmed) return

    try {
      setReleasingMilestone(milestoneIndex)

      const hash = await releaseMilestone(BigInt(projectId), milestoneIndex)

      alert(`Funds released!\nTransaction: ${hash}`)
      await fetchProjectDetails()
    } catch (error: any) {
      console.error('Error releasing milestone:', error)
      alert(`Failed to release funds: ${error.message || "Unknown error"}`)
    } finally {
      setReleasingMilestone(null)
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
            onClick={() => router.push("/creator")}
            className="mt-4 btn-gradient"
          >
            Back to Dashboard
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  // Check if current user is creator
  if (account && project.creator.toLowerCase() !== account.toLowerCase()) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <TopNav />
        <div className="text-center py-20">
          <p className="text-gray-600 dark:text-gray-400">You are not the creator of this project</p>
          <button
            onClick={() => router.push("/creator")}
            className="mt-4 btn-gradient"
          >
            Back to Dashboard
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  const goalEth = Number(formatEther(project.targetAmount))
  const raisedEth = Number(formatEther(project.currentAmount))

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <TopNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/creator")}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold mb-2">Manage Project</h1>
          <p className="text-gray-600 dark:text-gray-400">{project.title}</p>
        </div>

        {/* Project Stats */}
        <div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Target</p>
              <p className="text-2xl font-bold">{goalEth.toFixed(4)} ETH</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Raised</p>
              <p className="text-2xl font-bold">{raisedEth.toFixed(4)} ETH</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Progress</p>
              <p className="text-2xl font-bold">{((raisedEth / goalEth) * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
              <p className={`text-2xl font-bold ${project.fullyFunded ? 'text-green-600' : 'text-blue-600'}`}>
                {project.fullyFunded ? 'Funded' : 'Active'}
              </p>
            </div>
          </div>
        </div>

        {/* Milestones Management */}
        <div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6">
          <h2 className="text-2xl font-bold mb-6">Milestone Management</h2>
          
          <div className="space-y-4">
            {milestones.map((milestone) => {
              const canRelease = milestone.index === 0 
                ? raisedEth >= goalEth && !milestone.released
                : milestone.completed && !milestone.released

              const canPropose = milestone.released && !milestone.completed && milestone.status === 0

              const isVoting = milestone.status === 1 && !milestone.finalized

              return (
                <div
                  key={milestone.index}
                  className="p-6 bg-gray-50 dark:bg-slate-700 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          milestone.completed
                            ? "bg-green-500 text-white"
                            : milestone.released
                            ? "bg-blue-500 text-white"
                            : "bg-gray-300 dark:bg-slate-600 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {milestone.completed ? (
                          <Check className="w-6 h-6" />
                        ) : milestone.released ? (
                          <Clock className="w-6 h-6" />
                        ) : (
                          <Lock className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1">{milestone.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {formatEther(milestone.amount)} ETH
                        </p>

                        {/* Status Tags */}
                        <div className="flex flex-wrap gap-2">
                          {milestone.released && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                              Funds Released
                            </span>
                          )}
                          {isVoting && (
                            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                              Voting in Progress
                            </span>
                          )}
                          {milestone.completed && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>

                        {/* Voting Stats */}
                        {isVoting && (
                          <div className="mt-3 p-3 bg-white dark:bg-slate-600 rounded">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              Voting Progress
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-green-600 dark:text-green-400">
                                ✓ {milestone.agreeCount.toString()}
                              </span>
                              <span className="text-red-600 dark:text-red-400">
                                ✗ {milestone.disagreeCount.toString()}
                              </span>
                              <span className="text-gray-500">
                                ({milestone.totalVotes.toString()} total)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      {/* Release Funds Button (Milestone 0 or after voting passed) */}
                      {canRelease && (
                        <button
                          onClick={() => handleReleaseFunds(milestone.index)}
                          disabled={releasingMilestone === milestone.index}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 whitespace-nowrap"
                        >
                          {releasingMilestone === milestone.index ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Releasing...
                            </>
                          ) : (
                            <>
                              <ChevronRight className="w-4 h-4" />
                              Release Funds
                            </>
                          )}
                        </button>
                      )}

                      {/* Propose Completion Button */}
                      {canPropose && (
                        <button
                          onClick={() => {
                            setProposingMilestone(milestone.index)
                            setShowProposeModal(true)
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium whitespace-nowrap"
                        >
                          <Upload className="w-4 h-4" />
                          Propose Completion
                        </button>
                      )}

                      {/* Waiting state */}
                      {milestone.released && !milestone.completed && milestone.status !== 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          {isVoting ? "Waiting for votes..." : "Waiting for finalization..."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Propose Modal */}
      {showProposeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              Propose Milestone {proposingMilestone! + 1} Completion
            </h3>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  <strong>📌 How to get Proof Image CID:</strong>
                </p>
                <ol className="text-sm text-blue-700 dark:text-blue-300 list-decimal list-inside space-y-1">
                  <li>Upload your progress proof image to Pinata</li>
                  <li>Copy the CID (Content Identifier)</li>
                  <li>Paste it below</li>
                </ol>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Proof Description
                </label>
                <textarea
                  value={proofDescription}
                  onChange={(e) => setProofDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                  placeholder="Describe what you've accomplished..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Proof Image CID from Pinata
                </label>
                <input
                  type="text"
                  value={proofImageCID}
                  onChange={(e) => setProofImageCID(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 font-mono text-sm"
                  placeholder="bafkreidxlan2kv266x2llhmt6uax66xpblzcy22cq7k4f3sikvb267paei"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowProposeModal(false)
                  setProposingMilestone(null)
                  setProofImageCID("")
                  setProofDescription("")
                }}
                disabled={uploadingProof}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProposeCompletion}
                disabled={uploadingProof || !proofImageCID.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg disabled:opacity-50"
              >
                {uploadingProof ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Proposal"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
