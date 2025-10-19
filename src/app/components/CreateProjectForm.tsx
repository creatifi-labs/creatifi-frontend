"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { ADDR, ProjectFactoryAbi } from "../lib/abi";

export default function CreateProjectForm() {
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState(""); // ETH
  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({ hash });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !target) return;
    writeContract({
      address: ADDR.factory,
      abi: ProjectFactoryAbi,
      functionName: "createProject",
      args: [title, parseEther(target as `${number}`)],
    });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
      <div className="font-medium">Buat Proyek Baru</div>
      <input
        className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 outline-none"
        placeholder="Judul proyek"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 outline-none"
        placeholder="Target (ETH)"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
      />
      <button
        disabled={isPending || isMining}
        className="px-4 py-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 disabled:opacity-50"
      >
        {isPending || isMining ? "Processing…" : "Create Project"}
      </button>
      {isSuccess && <p className="text-emerald-400 text-sm">Project created ✅</p>}
    </form>
  );
}
