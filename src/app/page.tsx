import TopBar from "./components/TopBar";
import CreateProjectForm from "./components/CreateProjectForm";
import ProjectList from "./components/ProjectList";

export default function HomePage() {
  return (
    <main className="space-y-6">
      <TopBar />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CreateProjectForm />
          <div className="mt-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-300">
            <p className="font-medium mb-2">Kontrak</p>
            <ul className="space-y-1">
              <li>ProjectFactory: <code>{process.env.NEXT_PUBLIC_PROJECT_FACTORY}</code></li>
              <li>RewardNFT: <code>{process.env.NEXT_PUBLIC_REWARD_NFT}</code></li>
              <li>ReputationManager: <code>{process.env.NEXT_PUBLIC_REPUTATION}</code></li>
            </ul>
          </div>
        </div>
        <div className="lg:col-span-2">
          <ProjectList />
        </div>
      </div>
    </main>
  );
}
