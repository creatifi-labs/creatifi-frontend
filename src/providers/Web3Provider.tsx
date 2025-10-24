"use client";

import React from "react";
import { WagmiProvider, type Config } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { XellarKitProvider, defaultConfig, darkTheme } from "@xellar/kit";
import { sepolia } from "viem/chains"; // ✅ pakai Sepolia

// === ambil dari .env.local ===
const walletConnectProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID!;
const xellarAppId = process.env.NEXT_PUBLIC_XELLAR_APP_ID!;

// ✅ Tambahkan pengecekan ini di sini
if (!walletConnectProjectId || !xellarAppId) {
  console.warn(
    "⚠️ Missing NEXT_PUBLIC_WC_PROJECT_ID or NEXT_PUBLIC_XELLAR_APP_ID in .env.local"
  );
}

// === konfigurasi Wagmi + Xellar ===
const config = defaultConfig({
  appName: "CreatiFi",
  walletConnectProjectId,
  xellarAppId,
  xellarEnv: "sandbox", // ganti ke "production" saat live
  chains: [sepolia],
  ssr: true,
}) as Config;

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <XellarKitProvider theme={darkTheme}>{children}</XellarKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
