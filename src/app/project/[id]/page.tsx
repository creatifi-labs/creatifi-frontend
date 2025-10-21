"use client"

import { useState, useMemo } from "react"
import { TopNav } from "@/components/top-nav"
import { Footer } from "@/components/footer"
import { ProjectCard } from "@/components/project-card"
import { FilterSidebar } from "@/components/filter-sidebar"
import { Search } from "lucide-react"

const allProjects = [
  {
    id: "1",
    title: "Indie Game Studio - RPG Adventure",
    creator: "Alex Chen",
    category: "Game",
    image: "/indie-game-studio-rpg-adventure.jpg",
    goal: 50000,
    raised: 42500,
    supporters: 1250,
    status: "Open",
  },
  {
    id: "2",
    title: "Electronic Music Producer - Album Release",
    creator: "Luna Beats",
    category: "Music",
    image: "/electronic-music-producer-album.jpg",
    goal: 25000,
    raised: 23750,
    supporters: 890,
    status: "Open",
  },
  {
    id: "3",
    title: "Animated Series - Sci-Fi Adventure",
    creator: "Studio Pixel",
    category: "Animation",
    image: "/animated-series-sci-fi-adventure.jpg",
    goal: 75000,
    raised: 68250,
    supporters: 2100,
    status: "Funded",
  },
  {
    id: "4",
    title: "Graphic Novel - Fantasy Epic",
    creator: "Maya Illustrates",
    category: "Design",
    image: "/graphic-novel-fantasy-epic.jpg",
    goal: 30000,
    raised: 28500,
    supporters: 950,
    status: "Open",
  },
  {
    id: "5",
    title: "Documentary Film - Climate Stories",
    creator: "Earth Lens",
    category: "Film",
    image: "/documentary-film-climate-stories.jpg",
    goal: 40000,
    raised: 35200,
    supporters: 1100,
    status: "Open",
  },
  {
    id: "6",
    title: "Interactive Art Installation",
    creator: "Digital Dreams",
    category: "Art",
    image: "/interactive-art.png",
    goal: 20000,
    raised: 19800,
    supporters: 650,
    status: "Closed",
  },
  {
    id: "7",
    title: "VR Music Experience",
    creator: "Sound Innovators",
    category: "Music",
    image: "/vr-music-experience.jpg",
    goal: 60000,
    raised: 45000,
    supporters: 1500,
    status: "Open",
  },
  {
    id: "8",
    title: "3D Animation Studio - Character Design",
    creator: "Pixel Masters",
    category: "Animation",
    image: "/3d-animation-character.jpg",
    goal: 45000,
    raised: 42000,
    supporters: 1100,
    status: "Open",
  },
  {
    id: "9",
    title: "Indie Game - Puzzle Adventure",
    creator: "Game Dev Collective",
    category: "Game",
    image: "/indie-game-puzzle.jpg",
    goal: 35000,
    raised: 28000,
    supporters: 800,
    status: "Open",
  },
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.creator.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = !selectedCategory || project.category === selectedCategory
      const matchesStatus = !selectedStatus || project.status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [searchQuery, selectedCategory, selectedStatus])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <TopNav />

      {/* Header */}
      <section className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Explore Projects</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover amazing creative projects and support your favorite creators.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Search</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
                <FilterSidebar onCategoryChange={setSelectedCategory} onStatusChange={setSelectedStatus} />
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="lg:col-span-3">
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} {...project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-2">No projects found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your filters or search query to find more projects.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
