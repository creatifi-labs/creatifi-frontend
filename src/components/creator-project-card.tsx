"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

interface CreatorProjectCardProps {
	id: number
	title: string
	status: "active" | "funded" | "closed"
	goal: number
	raised: number
	milestonesCompleted: number
	totalMilestones: number
	imageUrl?: string
	description?: string
}

export function CreatorProjectCard({
	id,
	title,
	status,
	goal,
	raised,
	milestonesCompleted,
	totalMilestones,
	imageUrl,
	description,
}: CreatorProjectCardProps) {
	const router = useRouter()
	const progress = goal > 0 ? (raised / goal) * 100 : 0

	const percentage = (raised / goal) * 100
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

	return (
		<div
			className="card-glow rounded-xl bg-white dark:bg-slate-800 overflow-hidden hover:scale-105 transition-transform cursor-pointer"
			onClick={() => router.push(`/manage/${id}`)}
		>
			{/* Project Image */}
			<div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-500">
				{imageUrl ? (
					<Image
						src={imageUrl}
						alt={title}
						fill
						className="object-cover"
						unoptimized
					/>
				) : (
					<div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold opacity-20">
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
						#{id}
					</span>
				</div>

				{/* Title */}
				<h3 className="text-lg font-bold mb-2 line-clamp-1">{title}</h3>

				{/* Description */}
				{description && (
					<p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
						{description}
					</p>
				)}

				{/* Funding Progress */}
				<div className="mb-4">
					<div className="flex justify-between text-sm mb-2">
						<span className="text-gray-600 dark:text-gray-400">Raised</span>
						<span className="font-semibold">
							{raised.toFixed(4)} / {goal.toFixed(4)} ETH
						</span>
					</div>
					<div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
						<div
							className="gradient-primary h-2 rounded-full"
							style={{ width: `${Math.min(percentage, 100)}%` }}
						/>
					</div>
				</div>

				{/* Milestones */}
				<div>
					<div className="flex justify-between text-sm mb-2">
						<span className="text-gray-600 dark:text-gray-400">
							Milestones
						</span>
						<span className="font-semibold">
							{milestonesCompleted} / {totalMilestones}
						</span>
					</div>
					<div className="flex gap-1">
						{Array.from({ length: totalMilestones }).map((_, i) => (
							<div
								key={i}
								className={`flex-1 h-2 rounded-full ${
									i < milestonesCompleted
										? "bg-green-500"
										: "bg-gray-200 dark:bg-slate-700"
								}`}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
