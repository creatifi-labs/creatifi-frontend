"use client";

import { useAccount, useBalance, useDisconnect } from "wagmi";

export function useWallet() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const { disconnect } = useDisconnect();

  const { data: balData, isLoading: isBalLoading } = useBalance({
    address,
    query: {
      enabled: !!address,
      refetchOnWindowFocus: false,
    },
  });

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    disconnect: () => disconnect(),
    balanceFormatted: balData?.formatted ?? "0",
    balanceSymbol: balData?.symbol ?? "ETH", 
    isBalLoading,
  };
}
