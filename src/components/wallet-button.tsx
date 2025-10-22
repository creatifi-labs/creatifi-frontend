"use client";

import { useAccount, useDisconnect, useBalance } from "wagmi";
import { useConnectModal } from "@xellar/kit";
import { Wallet, LogOut } from "lucide-react";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const { open } = useConnectModal();

  const shortenAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatBalance = (bal: string) => {
    const num = parseFloat(bal);
    return isNaN(num) ? "0" : num.toFixed(4);
  };

  const handleConnect = () => {
    console.log("Opening Xellar connect modal...");
    open();
  };

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem("access_token");
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex flex-col items-end px-3 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
          <span className="text-xs text-gray-500 dark:text-gray-400">Balance</span>
          <span className="text-sm font-semibold">
            {balance ? formatBalance(balance.formatted) : "0"}{" "}
            {balance?.symbol || "ETH"}
          </span>
        </div>
        <div className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm font-medium">
          {shortenAddress(address)}
        </div>
        <button
          onClick={handleDisconnect}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Disconnect"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="btn-gradient flex items-center gap-2"
    >
      <Wallet className="w-5 h-5" />
      <span className="hidden sm:inline">Connect Wallet</span>
    </button>
  );
}
