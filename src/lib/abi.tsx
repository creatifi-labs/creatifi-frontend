import type { Abi } from "viem";

// Minimal ABI sesuai kontrakmu (tanpa modifikasi)
export const ProjectFactoryAbi = [
  { "type": "function", "name": "projectCount", "stateMutability": "view", "inputs": [], "outputs": [{"type":"uint256"}] },
  { "type": "function", "name": "createProject", "stateMutability": "nonpayable", "inputs": [{"name":"_title","type":"string"},{"name":"_targetAmount","type":"uint256"}], "outputs": [] },
  { "type": "function", "name": "supportProject", "stateMutability": "payable", "inputs": [{"name":"_projectId","type":"uint256"},{"name":"_rewardURI","type":"string"}], "outputs": [] },
  { "type": "function", "name": "withdrawFunds", "stateMutability": "nonpayable", "inputs": [{"name":"_projectId","type":"uint256"}], "outputs": [] },
  { "type": "function", "name": "getProject", "stateMutability": "view", "inputs": [{"name":"_projectId","type":"uint256"}], "outputs": [
    {"name":"creator","type":"address"},
    {"name":"title","type":"string"},
    {"name":"targetAmount","type":"uint256"},
    {"name":"totalRaised","type":"uint256"},
    {"name":"completed","type":"bool"}
  ] }
] as const satisfies Abi;

export const ReputationAbi = [
  { "type":"function", "name":"getScore", "stateMutability":"view", "inputs":[{"name":"supporter","type":"address"}], "outputs":[{"type":"uint256"}] }
] as const satisfies Abi;

export const RewardNFTAbi = [
  { "type":"function", "name":"balanceOf", "stateMutability":"view", "inputs":[{"name":"owner","type":"address"}], "outputs":[{"type":"uint256"}]},
  { "type":"function", "name":"mintSupportNFT", "stateMutability":"nonpayable", "inputs":[{"name":"to","type":"address"},{"name":"tokenURI","type":"string"}], "outputs":[] },
  { "type":"function", "name":"ownerOf", "stateMutability":"view", "inputs":[{"name":"tokenId","type":"uint256"}], "outputs":[{"type":"address"}] }
] as const satisfies Abi;

export const ADDR = {
  factory: process.env.NEXT_PUBLIC_PROJECT_FACTORY as `0x${string}`,
  reputation: process.env.NEXT_PUBLIC_REPUTATION as `0x${string}`,
  reward: process.env.NEXT_PUBLIC_REWARD_NFT as `0x${string}`,
};
