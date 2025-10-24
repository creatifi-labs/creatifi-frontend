import { Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">CreatiFi</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Empowering creators through transparent, on-chain funding.
            </p>
          </div>
          <div className="flex justify-center">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <a href="/explore" className="hover:text-primary transition-colors">
                    Explore Projects
                  </a>
                </li>
                <li>
                  <a href="/creator" className="hover:text-primary transition-colors">
                    Start a Project
                  </a>
                </li>
                <li>
                  <a href="/#how-it-works" className="hover:text-primary transition-colors">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex justify-center">
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/creatifi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-primary transition-colors dark:text-gray-400"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-slate-700 pt-8">
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
            © CreatiFi 2025. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
