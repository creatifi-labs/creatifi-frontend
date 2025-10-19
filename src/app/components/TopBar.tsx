"use client";

import { useAccount } from "wagmi";
// NOTE: tombol dari Xellar Kit — jika berbeda, ganti sesuai komponen resmi di kit.
// Umumnya mereka expose semacam Connect/Account button.
import { ConnectButton } from "@xellar/kit";

export default function TopBar() {
  const { address } = useAccount();

  return (
    <div className="flex items-center justify-between py-3">
      <h1 className="text-xl font-semibold">CreatiFi</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-400">{address ? `Connected: ${address}` : ""}</span>
        <ConnectButton /> 
      </div>
    </div>
  );
}
