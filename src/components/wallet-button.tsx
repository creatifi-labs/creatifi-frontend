"use client";

import { useState, useEffect } from "react";
import { Wallet } from "lucide-react";

export function WalletButton() {
  const [account, setAccount] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    // Prevent multiple clicks
    if (isConnecting) {
      console.log("Already connecting...");
      return;
    }

    try {
      setIsConnecting(true);

      if (typeof window === "undefined") {
        alert("Window not available");
        return;
      }

      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        console.log("Connected:", accounts[0]);
      } else {
        alert("No accounts found");
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);

      // Jangan tampilkan alert jika user reject di MetaMask
      if (error.code === 4001) {
        console.log("User rejected the connection request");
      } else if (error.code === -32002) {
        alert("Please check MetaMask - there's already a connection request pending");
      } else {
        alert(`Failed to connect: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount("");
  };

  const shortenAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (!mounted) {
    return (
      <button className="btn-gradient flex items-center gap-2" disabled>
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </button>
    );
  }

  if (account) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm">
          {shortenAddress(account)}
        </div>
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="btn-gradient flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Wallet className="w-4 h-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
