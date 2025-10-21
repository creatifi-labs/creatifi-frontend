"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { localhost } from "wagmi/chains";
import { injected } from "@wagmi/connectors"; // (bukan "wagmi/connectors")
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { XellarKitProvider, darkTheme } from "@xellar/kit";

const rpc = process.env.NEXT_PUBLIC_RPC_HTTP || "http://127.0.0.1:8545";
const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);

const chains = [
  { ...localhost, id: chainId, rpcUrls: { default: { http: [rpc] } } },
] as const;

const wagmi = createConfig({
  chains,
  transports: { [chains[0].id]: http(rpc) },
  connectors: [injected({ target: "metaMask" })], // fallback; Xellar menambahkan embedded wallet sendiri
  ssr: true,
});

const qc = new QueryClient();

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmi}>
      <QueryClientProvider client={qc}>
        <XellarKitProvider
          theme={darkTheme}
          xellarAppId={process.env.NEXT_PUBLIC_XELLAR_APP_ID!}
          xellarEnv={(process.env.NEXT_PUBLIC_XELLAR_ENV as "production" | "sandbox") || "production"}
        >
          {children}
        </XellarKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
