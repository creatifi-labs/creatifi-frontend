"use client";

import { useAccount, useDisconnect, useBalance } from "wagmi";
import { useConnectModal } from "@xellar/kit";
import { Wallet, LogOut, Copy, Check, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function WalletButton() {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const { open } = useConnectModal();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hardcode Sepolia network info
  const networkName = "Sepolia";
  const networkId = "11155111";

  // Check dark mode on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      setIsDarkMode(false);
      localStorage.setItem("theme", "light");
    } else {
      html.classList.add("dark");
      setIsDarkMode(true);
      localStorage.setItem("theme", "dark");
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

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
    setIsDropdownOpen(false);
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const getAvatarColor = (addr: string) => {
    const colors = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-purple-500",
    ];
    const index = parseInt(addr.slice(2, 4), 16) % colors.length;
    return colors[index];
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isConnected && address) {
    return (
      <div className="relative" ref={dropdownRef}>
        {/* Avatar Button */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(
              address
            )} flex items-center justify-center text-white shadow-lg`}
          >
            <User className="w-5 h-5" />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50">
            {/* Header with Avatar */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-lg`}
                >
                  <User className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">Connected</p>
                  <p className="text-white/80 text-xs">{networkName}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Balance */}
              <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Balance
                </p>
                <p className="text-lg font-bold">
                  {balance
                    ? formatBalance(balance.formatted)
                    : "0"}{" "}
                  {balance?.symbol || "ETH"}
                </p>
              </div>

              {/* Wallet Address */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Wallet Address
                </p>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900 rounded-lg p-3">
                  <code className="text-sm flex-1 truncate">{address}</code>
                  <button
                    onClick={copyAddress}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
                    title="Copy address"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Network Info */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Network
                </p>
                <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">{networkName}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Chain ID: {networkId}
                  </p>
                </div>
              </div>

              {/* Disconnect Button */}
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg px-4 py-3 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      data-wallet-connect-button
      className="bg-gradient-to-r from-[#335cff] to-[#6e45e2] text-white font-semibold rounded-lg px-4 py-2 hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm"
    >
      <Wallet className="w-4 h-4" />
      <span className="hidden sm:inline">Connect Wallet</span>
    </button>
  );
}
