"use client"

import { TopNav } from "@/components/top-nav"
import { Footer } from "@/components/footer"
import { NFTBadge } from "@/components/nft-badge"
import { SupportedProjectCard } from "@/components/supported-project-card"
import { Heart, Award, TrendingUp } from "lucide-react"

const supportedProjects = [
  {
    projectTitle: "Indie Game Studio - RPG Adventure",
    amount: 50,
    date: "Feb 14, 2025",
    status: "active" as const,
    tier: "Patron",
  },
  {
    projectTitle: "Electronic Music Producer - Album Release",
    amount: 25,
    date: "Feb 10, 2025",
    status: "active" as const,
    tier: "Supporter",
  },
  {
    projectTitle: "Animated Series - Sci-Fi Adventure",
    amount: 100,
    date: "Jan 28, 2025",
    status: "funded" as const,
    tier: "Champion",
  },
  {
    projectTitle: "Graphic Novel - Fantasy Epic",
    amount: 50,
    date: "Jan 15, 2025",
    status: "completed" as const,
    tier: "Patron",
  },
]

const nftBadges = [
  {
    id: "1",
    projectTitle: "Indie Game Studio - RPG Adventure",
    tier: "Patron",
    image: "/nft-badge-1.png",
    date: "Feb 14, 2025",
    tokenId: "0x742d35Cc6634C0532925a3b844Bc9e7595f8f3a",
  },
  {
    id: "2",
    projectTitle: "Electronic Music Producer - Album Release",
    tier: "Supporter",
    image: "/nft-badge-2.png",
    date: "Feb 10, 2025",
    tokenId: "0x742d35Cc6634C0532925a3b844Bc9e7595f8f3b",
  },
  {
    id: "3",
    projectTitle: "Animated Series - Sci-Fi Adventure",
    tier: "Champion",
    image: "/nft-badge-3.png",
    date: "Jan 28, 2025",
    tokenId: "0x742d35Cc6634C0532925a3b844Bc9e7595f8f3c",
  },
  {
    id: "4",
    projectTitle: "Graphic Novel - Fantasy Epic",
    tier: "Patron",
    image: "/nft-badge-4.png",
    date: "Jan 15, 2025",
    tokenId: "0x742d35Cc6634C0532925a3b844Bc9e7595f8f3d",
  },
]

export default function SupporterDashboard() {
  const totalSupported = supportedProjects.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <TopNav />

      {/* Header */}
      <section className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Supporter Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your supported projects and NFT badges</p>
        </div>
      </section>

      {/* Main Content - flex-1 untuk mengisi space */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Supported</p>
                <p className="text-3xl font-bold">${totalSupported}</p>
              </div>
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center text-white">
                <Heart className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Projects Supported</p>
                <p className="text-3xl font-bold">{supportedProjects.length}</p>
              </div>
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">NFT Badges Earned</p>
                <p className="text-3xl font-bold">{nftBadges.length}</p>
              </div>
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center text-white">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-8">
          {/* Supported Projects */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Supported Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {supportedProjects.map((project, idx) => (
                <SupportedProjectCard key={idx} {...project} />
              ))}
            </div>
          </div>

          {/* NFT Gallery */}
          <div>
            <h2 className="text-2xl font-bold mb-6">NFT Proof of Support Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {nftBadges.map((badge) => (
                <NFTBadge key={badge.id} {...badge} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
