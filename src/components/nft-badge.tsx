"use client"

import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"

interface NFTBadgeProps {
  id: string
  projectTitle: string
  tier: string
  image: string
  date: string
  tokenId: string
}

export function NFTBadge({ id, projectTitle, tier, image, date, tokenId }: NFTBadgeProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="group card-glow rounded-xl overflow-hidden bg-white dark:bg-slate-800 transition-all duration-300 hover:scale-105 cursor-pointer"
      >
        <div className="relative h-48 bg-gradient-to-br from-primary via-secondary to-accent overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={projectTitle}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-3 right-3 bg-gold text-slate-900 px-2 py-1 rounded-full text-xs font-bold">
            {tier}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-sm line-clamp-2 mb-1">{projectTitle}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Minted {date}</p>
        </div>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full overflow-hidden">
            <div className="relative h-64 bg-gradient-to-br from-primary via-secondary to-accent">
              <Image src={image || "/placeholder.svg"} alt={projectTitle} fill className="object-cover" />
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl">{projectTitle}</h3>
                <span className="bg-gold text-slate-900 px-3 py-1 rounded-full text-sm font-bold">{tier}</span>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Token ID</p>
                  <p className="font-mono text-sm font-semibold break-all">{tokenId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Minted Date</p>
                  <p className="font-semibold">{date}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-secondary transition-colors">
                  View on Chain
                </button>
                <button className="flex-1 px-4 py-2 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors">
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
