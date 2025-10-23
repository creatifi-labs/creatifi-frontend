"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ProjectCardProps {
	id: number
	title: string
	creator: string
	goal: number
	raised: number
	progress?: number // Buat optional
	status: "active" | "funded" | "closed"
	imageUrl?: string
	description?: string
}

export function ProjectCard({
	id,
	title,
	creator,
	goal,
	raised,
	progress = 0, // DEFAULT VALUE = 0
	status,
	imageUrl,
	description,
}: ProjectCardProps) {
	const router = useRouter()
	const [imageError, setImageError] = useState(false)

	const statusConfig: Record<string, { label: string; className: string }> = {
		active: {
			label: "Active",
			className:
				"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
		},
		funded: {
			label: "Funded",
			className:
				"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
		},
		closed: {
			label: "Closed",
			className:
				"bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
		},
	}

	const currentStatus = statusConfig[status] || statusConfig.active

	const handleViewDetails = () => {
		router.push(`/project/${id}`)
	}

	return (
		<div className="card-glow rounded-xl bg-white dark:bg-slate-800 overflow-hidden">
			{/* Project Image */}
			<div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500">
				{imageUrl && !imageError ? (
					<Image
						src={imageUrl}
						alt={title}
						fill
						className="object-cover"
						unoptimized
						onError={() => {
							console.error('Failed to load image:', imageUrl)
							setImageError(true)
						}}
					/>
				) : (
					<div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold opacity-20">
						{title.charAt(0).toUpperCase()}
					</div>
				)}
			</div>

			<div className="p-6">
				{/* Status Badge */}
				<div className="flex items-center gap-2 mb-3">
					<span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${currentStatus.className}`}>
						{currentStatus.label}
					</span>
					<span className="text-xs text-gray-500 dark:text-gray-400">
						Project #{id}
					</span>
				</div>

				{/* Title */}
				<h3 className="text-xl font-bold mb-2 line-clamp-2">{title}</h3>

				{/* Description */}
				{description && (
					<p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
						{description}
					</p>
				)}

				{/* Creator */}
				<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
					by {creator.slice(0, 6)}...{creator.slice(-4)}
				</p>

				{/* Progress */}
				<div className="mb-4">
					<div className="flex justify-between text-sm mb-2">
						<span className="text-gray-600 dark:text-gray-400">Progress</span>
						<span className="font-semibold">
							{(raised || 0).toFixed(4)} / {(goal || 0).toFixed(4)} ETH
						</span>
					</div>
					<div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
						<div
							className="gradient-primary h-2 rounded-full transition-all duration-300"
							style={{ width: `${Math.min(progress, 100)}%` }}
						/>
					</div>
					<div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
						{progress.toFixed(1)}%
					</div>
				</div>

				{/* CTA Button */}
				<button 
					onClick={handleViewDetails}
					className="w-full btn-gradient"
				>
					View Details
				</button>
			</div>
		</div>
	)
}
