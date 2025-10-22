"use client"

import { TopNav } from "@/components/top-nav"
import { Footer } from "@/components/footer"
import { ProjectCard } from "@/components/project-card"
import { Search, Filter, Loader2 } from "lucide-react"
import { useAllProjects } from "@/hooks/useAllProjects"
import { useState } from "react"

export default function ExplorePage() {
	const { projects, loading, error } = useAllProjects()
	const [searchQuery, setSearchQuery] = useState("")
	const [filterStatus, setFilterStatus] = useState<"all" | "active" | "funded">("all")

	// Filter projects based on search and status
	const filteredProjects = projects.filter((project) => {
		const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase())
		const matchesStatus = filterStatus === "all" || project.status === filterStatus
		return matchesSearch && matchesStatus
	})

	return (
		<div className="min-h-screen bg-white dark:bg-slate-950">
			<TopNav />

			{/* Header */}
			<section className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<h1 className="text-4xl font-bold mb-2">Explore Projects</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Discover and support innovative projects from creators around the world
					</p>
				</div>
			</section>

			{/* Filters */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex flex-col md:flex-row gap-4 mb-8">
					{/* Search */}
					<div className="flex-1">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<input
								type="text"
								placeholder="Search projects..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
							/>
						</div>
					</div>

					{/* Status Filter */}
					<div className="flex gap-2">
						<button
							onClick={() => setFilterStatus("all")}
							className={`px-4 py-2 rounded-lg font-medium transition-colors ${
								filterStatus === "all"
									? "bg-blue-600 text-white"
									: "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
							}`}
						>
							All
						</button>
						<button
							onClick={() => setFilterStatus("active")}
							className={`px-4 py-2 rounded-lg font-medium transition-colors ${
								filterStatus === "active"
									? "bg-blue-600 text-white"
									: "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
							}`}
						>
							Active
						</button>
						<button
							onClick={() => setFilterStatus("funded")}
							className={`px-4 py-2 rounded-lg font-medium transition-colors ${
								filterStatus === "funded"
									? "bg-blue-600 text-white"
									: "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
							}`}
						>
							Funded
						</button>
					</div>
				</div>

				{/* Loading State */}
				{loading && (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="w-8 h-8 animate-spin text-blue-600" />
						<span className="ml-3 text-gray-600 dark:text-gray-400">Loading projects...</span>
					</div>
				)}

				{/* Error State */}
				{error && (
					<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
						Error: {error}
					</div>
				)}

				{/* Empty State */}
				{!loading && !error && filteredProjects.length === 0 && projects.length === 0 && (
					<div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-lg">
						<p className="text-gray-600 dark:text-gray-400">
							No projects found. Be the first to create one!
						</p>
					</div>
				)}

				{/* No Results from Filter */}
				{!loading && !error && filteredProjects.length === 0 && projects.length > 0 && (
					<div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-lg">
						<p className="text-gray-600 dark:text-gray-400">
							No projects match your search criteria.
						</p>
					</div>
				)}

				{/* Projects Grid */}
				{!loading && !error && filteredProjects.length > 0 && (
					<div>
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
							Showing {filteredProjects.length} of {projects.length} projects
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredProjects.map((project) => (
								<ProjectCard key={project.id} {...project} />
							))}
						</div>
					</div>
				)}
			</div>

			<Footer />
		</div>
	)
}
