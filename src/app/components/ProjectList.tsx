"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { ADDR, ProjectFactoryAbi, ReputationAbi } from "../lib/abi";
import { fmt } from "../lib/format";

type Proj = {
  id: number;
  creator: `0x${string}`;
  title: string;
  target: bigint;
  raised: bigint;
  completed: boolean;
};

function useProjectCount() {
  const { data } = useReadContract({
    address: ADDR.factory,
    abi: ProjectFactoryAbi,
    functionName: "projectCount",
  });
  return Number((data as bigint) ?? BigInt(0));
}

function useProject(id: number) {
  const { data } = useReadContract({
    address: ADDR.factory,
    abi: ProjectFactoryAbi,
    functionName: "getProject",
    args: [BigInt(id)],
  });
  if (!data) return null;
  const [creator, title, target, raised, completed] = data as readonly [string, string, bigint, bigint, boolean];
  return { id, creator: creator as `0x${string}`, title, target, raised, completed } as Proj;
}

export default function ProjectList() {
  const count = useProjectCount();
  const ids = useMemo(() => Array.from({ length: count }, (_, i) => i + 1), [count]);
  return (
    <div className="grid gap-4">
      <div className="text-lg font-medium">Daftar Proyek ({count})</div>
      {ids.length === 0 && <p className="text-zinc-400 text-sm">Belum ada proyek.</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {ids.map((i) => <ProjectCard key={i} id={i} />)}
      </div>
    </div>
  );
}

function ProjectCard({ id }: { id: number }) {
  const p = useProject(id);
  const { address } = useAccount();

  const [amount, setAmount] = useState("");
  const [uri, setUri] = useState("ipfs://creatifi/poster.json");

  const { data: rep } = useReadContract({
    address: ADDR.reputation,
    abi: ReputationAbi,
    functionName: "getScore",
    args: [address!],
    query: { enabled: !!address },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({ hash });

  const onSupport = () => {
    if (!amount) return;
    writeContract({
      address: ADDR.factory,
      abi: ProjectFactoryAbi,
      functionName: "supportProject",
      args: [BigInt(id), uri],
      value: parseEther(amount as `${number}`),
    });
  };

  const {
    writeContract: writeWithdraw,
    data: hash2,
    isPending: isP2
  } = useWriteContract();
  const { isLoading: isM2, isSuccess: ok2 } = useWaitForTransactionReceipt({ hash: hash2 });

  const onWithdraw = () => {
    writeWithdraw({
      address: ADDR.factory,
      abi: ProjectFactoryAbi,
      functionName: "withdrawFunds",
      args: [BigInt(id)],
    });
  };

  if (!p) return <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">Loading…</div>;

  const canWithdraw = !p.completed && p.raised >= p.target;

  return (
    <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">{p.title}</div>
          <div className="text-xs text-zinc-400">Creator: {fmt.addr(p.creator)}</div>
        </div>
        <div className="text-right text-sm">
          <div>Target: <span className="font-medium">{fmt.eth(p.target)} ETH</span></div>
          <div>Terkumpul: <span className="font-medium">{fmt.eth(p.raised)} ETH</span></div>
          <div className={p.completed ? "text-emerald-400" : "text-yellow-400"}>
            {p.completed ? "Completed" : "Open"}
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <input
          className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 outline-none"
          placeholder="Jumlah (ETH)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 outline-none"
          placeholder="Token URI (IPFS)"
          value={uri}
          onChange={(e) => setUri(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            onClick={onSupport}
            disabled={isPending || isMining || p.completed}
            className="px-4 py-2 rounded-xl bg-sky-500/90 hover:bg-sky-500 disabled:opacity-50"
          >
            {isPending || isMining ? "Supporting…" : "Support Project"}
          </button>
          <button
            onClick={onWithdraw}
            disabled={!canWithdraw || isP2 || isM2}
            className="px-4 py-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 disabled:opacity-50"
          >
            {isP2 || isM2 ? "Withdrawing…" : "Withdraw (Creator)"}
          </button>
        </div>
        {isSuccess && <p className="text-emerald-400 text-sm">Support success ✅</p>}
        {ok2 && <p className="text-emerald-400 text-sm">Withdraw success ✅</p>}
      </div>

      {address && (
        <div className="pt-2 text-xs text-zinc-400">
          Reputasi kamu: <span className="font-medium text-zinc-200">{Number((rep as bigint) ?? BigInt(0))}</span>
        </div>
      )}
    </div>
  );
}
