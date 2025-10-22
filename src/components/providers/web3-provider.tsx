"use client";

import React from "react";
import { WagmiProvider, type Config } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { XellarKitProvider, defaultConfig, darkTheme } from "@xellar/kit";
import { sepolia } from "viem/chains"; // ✅ ubah di sini

const config = defaultConfig({
  appName: "CreatiFi",
  walletConnectProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
  xellarAppId: process.env.NEXT_PUBLIC_XELLAR_APP_ID!,
  xellarEnv: "sandbox",
  chains: [sepolia], 
  ssr: true,
}) as Config;

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <XellarKitProvider theme={darkTheme}>{children}</XellarKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
