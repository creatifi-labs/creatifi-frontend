import { TopNav } from "@/components/top-nav"
import { Footer } from "@/components/footer"
import { ProjectCard } from "@/components/project-card"
import { FeatureCard } from "@/components/feature-card"
import { Lock, Award, Shield, ArrowRight } from "lucide-react"

const trendingProjects = [
  {
    id: "1",
    title: "Indie Game Studio - RPG Adventure",
    creator: "Alex Chen",
    category: "Game",
    image: "/indie-game-studio-rpg-adventure.jpg",
    goal: 50000,
    raised: 42500,
    supporters: 1250,
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
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <TopNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="absolute top-20 right-0 w-96 h-96 gradient-primary rounded-full blur-3xl opacity-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.15] md:leading-[1.2] mb-5 inline-block pb-1 gradient-text text-balance overflow-visible">
              Transparent & On-Chain <br/> Creative Funding
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-balance">
              Empowering creators, connecting supporters, powered by Web3 transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/explore" className="btn-gradient inline-flex items-center justify-center gap-2">
                Explore Projects
                <ArrowRight className="w-4 h-4" />
              </a>
              <button className="px-6 py-3 rounded-lg font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 dark:border-accent dark:text-accent dark:hover:bg-accent dark:hover:text-slate-900">
                Start a Project
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {[
              {
                step: "1",
                title: "Creators Launch Projects",
                description: "Set your funding goal, milestones, and rewards. Deploy your project on-chain.",
              },
              {
                step: "2",
                title: "Supporters Fund Milestones",
                description: "Back projects you believe in. Funds are held in smart contract escrow.",
              },
              {
                step: "3",
                title: "Smart Contracts Release Funds",
                description: "Funds release transparently when milestones are verified and completed.",
              },
              {
                step: "4",
                title: "Supporters Earn Rewards & NFTs",
                description: "Supporters receive tier-based rewards and unique NFTs as digital proof of their contribution and support.",
              },
            ].map((item, index) => (
              <div 
                key={item.step} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="card-glow rounded-xl bg-white dark:bg-slate-800 p-6 h-full">
                  <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg mb-3 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Why CreatiFi?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Lock className="w-6 h-6" />}
              title="Escrow Smart Contract"
              description="Funds are secured in smart contracts until milestones are verified and completed."
            />
            <FeatureCard
              icon={<Award className="w-6 h-6" />}
              title="NFT Proof of Support"
              description="Supporters receive unique NFT badges as proof of their contribution and support."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="On-Chain Project Transparency"
              description="All funding flows and project milestones are recorded publicly on-chain, allowing anyone to verify progress and ensure accountability."
            />
          </div>
        </div>
      </section>

      {/* Trending Projects */}
      {/* <section className="py-16 md:py-24 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold">Trending Projects</h2>
            <a
              href="/explore"
              className="text-primary hover:text-secondary transition-colors font-semibold flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingProjects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        </div>
      </section> */}

      <Footer />
    </div>
  )
}
