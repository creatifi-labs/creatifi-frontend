"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TopNav } from "@/components/top-nav"
import { Footer } from "@/components/footer"
import { 
  getSupportedProjects, 
  getProject, 
  getContribution,
  getProjectRewardURI
} from "@/lib/contracts/factory"
import { fetchMetadataFromIPFS, ipfsToHttp } from "@/lib/ipfs"
import { formatEther } from "viem"
import { Loader2, Heart, TrendingUp, Award, ExternalLink } from "lucide-react"
import Image from "next/image"

interface SupportedProject {
  id: number
  title: string
  creator: string
  targetAmount: bigint
  currentAmount: bigint
  myContribution: bigint
  fullyFunded: boolean
  image?: string
  description?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [account, setAccount] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [supportedProjects, setSupportedProjects] = useState<SupportedProject[]>([])

  useEffect(() => {
    checkConnection()
  }, [])

  useEffect(() => {
    if (account) {
      fetchDashboardData()
    }
  }, [account])

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        })
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0])
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error("Error checking connection:", error)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Get supported project IDs
      const projectIds = await getSupportedProjects(account)
      console.log("Supported project IDs:", projectIds)

      if (projectIds.length === 0) {
        setSupportedProjects([])
        setLoading(false)
        return
      }

      // Fetch details for each project
      const projectsData = await Promise.all(
        projectIds.map(async (id) => {
          try {
            const projectData = await getProject(id)
            const contribution = await getContribution(id, account)
            
            // Fetch metadata
            let metadata: any = null
            try {
              const rewardURI = await getProjectRewardURI(id)
              if (rewardURI) {
                metadata = await fetchMetadataFromIPFS(rewardURI)
              }
            } catch (err) {
              console.error(`Failed to fetch metadata for project ${id}:`, err)
            }

            return {
              id: Number(id),
              title: projectData.title,
              creator: projectData.creator,
              targetAmount: projectData.targetAmount,
              currentAmount: projectData.currentAmount,
              myContribution: contribution,
              fullyFunded: projectData.fullyFunded,
              image: metadata?.image,
              description: metadata?.description,
            }
          } catch (err) {
            console.error(`Failed to fetch project ${id}:`, err)
            return null
          }
        })
      )

      // Filter out failed fetches
      const validProjects = projectsData.filter((p) => p !== null) as SupportedProject[]
      setSupportedProjects(validProjects)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const totalSupported = supportedProjects.reduce(
    (sum, p) => sum + Number(formatEther(p.myContribution)),
    0
  )
  const projectsSupported = supportedProjects.length
  const nftBadgesEarned = supportedProjects.filter(p => p.fullyFunded).length

  if (!account) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
        <TopNav />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center w-full">
          <h1 className="text-4xl font-bold mb-4">Supporter Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Please connect your wallet to view your dashboard
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
        <TopNav />
        <div className="flex-1 flex items-center justify-center py-20 w-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3">Loading dashboard...</span>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <TopNav />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Supporter Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your supported projects and NFT badges
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                  Total Supported
                </p>
                <p className="text-3xl font-bold">{totalSupported.toFixed(4)} ETH</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                  Projects Supported
                </p>
                <p className="text-3xl font-bold">{projectsSupported}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                  NFT Badges Earned
                </p>
                <p className="text-3xl font-bold">{nftBadgesEarned}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Supported Projects */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Supported Projects</h2>

          {supportedProjects.length === 0 ? (
            <div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven't supported any projects yet
              </p>
              <button
                onClick={() => router.push("/explore")}
                className="btn-gradient"
              >
                Explore Projects
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supportedProjects.map((project) => {
                // Hitung progress dengan safe rounding
                const progress = project.targetAmount > 0 
                  ? Math.min((Number(formatEther(project.currentAmount)) / Number(formatEther(project.targetAmount))) * 100, 100) 
                  : 0

                return (
                  <div
                    key={project.id}
                    className="card-glow rounded-xl bg-white dark:bg-slate-800 overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer"
                    onClick={() => router.push(`/project/${project.id}`)}
                  >
                    {/* Project Image */}
                    <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500">
                      {project.image ? (
                        <Image
                          src={ipfsToHttp(project.image)}
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
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            project.fullyFunded
                              ? "bg-green-500 text-white"
                              : "bg-blue-500 text-white"
                          }`}
                        >
                          {project.fullyFunded ? "Funded" : "Active"}
                        </span>
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                      
                      {project.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      <div className="space-y-4">
                        {/* My Contribution */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            My Contribution
                          </span>
                          <span className="font-semibold">
                            {formatEther(project.myContribution)} ETH
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-gray-600 dark:text-gray-400">
                              Progress
                            </span>
                            <span className="font-semibold">
                              {formatEther(project.currentAmount)} /{" "}
                              {formatEther(project.targetAmount)} ETH
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="gradient-primary h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {progress.toFixed(1)}% funded
                          </p>
                        </div>

                        {/* View Details Button */}
                        <button
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-sm transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/project/${project.id}`)
                          }}
                        >
                          View Details
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
