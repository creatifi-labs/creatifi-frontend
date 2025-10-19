import "./globals.css";
import Web3Provider from "./providers/Web3Provider";

export const metadata = {
  title: "CreatiFi",
  description: "Soulbound crowdfunding with reputation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100">
        <Web3Provider>
          <div className="max-w-5xl mx-auto px-4 py-6">
            {children}
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}
