"use client";

import { useWallet } from "@/hooks/use-wallet";
import { useConnectModal } from "@xellar/kit";
import { Wallet, LogOut } from "lucide-react";

export function WalletButton() {
  const {
    address,
    isConnected,
    balanceFormatted,
    balanceSymbol,
    disconnect,
    isBalLoading,
  } = useWallet();
  const { open } = useConnectModal();

  const shortenAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex flex-col items-end px-3 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
          <span className="text-xs text-gray-500 dark:text-gray-400">Balance</span>
          <span className="text-sm font-semibold">
            {isBalLoading ? "..." : `${Number(balanceFormatted).toFixed(4)} ${balanceSymbol}`}
          </span>
        </div>
        <div className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm font-medium">
          {shortenAddress(address)}
        </div>
        <button
          onClick={disconnect}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Disconnect"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <button onClick={open} className="btn-gradient flex items-center gap-2">
      <Wallet className="w-5 h-5" />
      <span className="hidden sm:inline">Connect Wallet</span>
    </button>
  );
}
