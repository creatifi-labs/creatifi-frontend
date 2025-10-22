import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

import factoryAbi from "./abi/factory.json";
import nftAbi from "./abi/nft.json";
import reputationAbi from "./abi/reputation.json";

export const CONTRACTS = {
  FACTORY: {
    address: process.env.NEXT_PUBLIC_FACTORY_ADDR as `0x${string}`,
    abi: factoryAbi,
  },
  NFT: {
    address: process.env.NEXT_PUBLIC_NFT_ADDR as `0x${string}`,
    abi: nftAbi,
  },
  REPUTATION: {
    address: process.env.NEXT_PUBLIC_REPUTATION_ADDR as `0x${string}`,
    abi: reputationAbi,
  },
};

// Client read-only (pakai Alchemy RPC)
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL!),
});
