import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { sepolia } from 'viem/chains';
import factoryABI from './abi/factory.json';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDR as `0x${string}`;

function getPublicClient() {
  return createPublicClient({
    chain: sepolia,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL),
  });
}

function getWalletClient() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No ethereum provider found');
  }

  return createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
  });
}

export interface Project {
  creator: string;
  title: string;
  targetAmount: bigint;
  currentAmount: bigint;
  fullyFunded: boolean;
}

export interface Milestone {
  name: string;
  amount: bigint;
  completed: boolean;
  released: boolean;
}

export async function createProject(
  title: string,
  targetAmount: bigint,
  milestoneNames: [string, string, string],
  milestoneAmounts: [bigint, bigint, bigint],
  rewardURI: string
) {
  const walletClient = getWalletClient();
  const [account] = await walletClient.getAddresses();

  // Verify contract address exists
  if (!FACTORY_ADDRESS || FACTORY_ADDRESS === '0x') {
    throw new Error('Factory contract address not configured. Please check NEXT_PUBLIC_FACTORY_ADDR in .env.local');
  }

  console.log('Creating project with params:', {
    address: FACTORY_ADDRESS,
    title,
    targetAmount: targetAmount.toString(),
    milestoneNames,
    milestoneAmounts: milestoneAmounts.map(a => a.toString()),
    rewardURI,
    account
  });

  try {
    const hash = await walletClient.writeContract({
      address: FACTORY_ADDRESS,
      abi: factoryABI,
      functionName: 'createProject',
      args: [title, targetAmount, milestoneNames, milestoneAmounts, rewardURI],
      account,
      gas: 500000n, // Set manual gas limit
    });

    return hash;
  } catch (error: any) {
    console.error('Error creating project:', error);
    
    if (error.message?.includes('gas')) {
      throw new Error('Gas estimation failed. Please check if the contract is deployed at the correct address.');
    }
    
    throw error;
  }
}

export async function supportProject(projectId: bigint, amount: bigint) {
  const walletClient = getWalletClient();
  const [account] = await walletClient.getAddresses();

  const hash = await walletClient.writeContract({
    address: FACTORY_ADDRESS,
    abi: factoryABI,
    functionName: 'supportProject',
    args: [projectId],
    value: amount,
    account,
  });

  return hash;
}

export async function getProject(projectId: bigint): Promise<Project> {
  const publicClient = getPublicClient();

  const result = await publicClient.readContract({
    address: FACTORY_ADDRESS,
    abi: factoryABI,
    functionName: 'getProject',
    args: [projectId],
  }) as any;

  // Result bisa jadi object atau array, kita handle keduanya
  if (Array.isArray(result)) {
    return {
      creator: result[0],
      title: result[1],
      targetAmount: result[2],
      currentAmount: result[3],
      fullyFunded: result[4],
    };
  } else {
    // Result sudah dalam bentuk object
    return {
      creator: result.creator || result[0],
      title: result.title || result[1],
      targetAmount: result.targetAmount || result[2],
      currentAmount: result.currentAmount || result[3],
      fullyFunded: result.fullyFunded || result[4],
    };
  }
}

export async function getMilestone(projectId: bigint, index: number): Promise<Milestone> {
  const publicClient = getPublicClient();

  const result = await publicClient.readContract({
    address: FACTORY_ADDRESS,
    abi: factoryABI,
    functionName: 'getMilestone',
    args: [projectId, index],
  }) as any;

  // Result bisa jadi object atau array, kita handle keduanya
  if (Array.isArray(result)) {
    return {
      name: result[0],
      amount: result[1],
      completed: result[2],
      released: result[3],
    };
  } else {
    return {
      name: result.name || result[0],
      amount: result.amount || result[1],
      completed: result.completed || result[2],
      released: result.released || result[3],
    };
  }
}

export async function getProjectCount(): Promise<bigint> {
  const publicClient = getPublicClient();

  const result = await publicClient.readContract({
    address: FACTORY_ADDRESS,
    abi: factoryABI,
    functionName: 'projectCount',
  }) as bigint;

  return result;
}

export async function getProjectRewardURI(projectId: bigint): Promise<string> {
  const publicClient = getPublicClient();

  const result = await publicClient.readContract({
    address: FACTORY_ADDRESS,
    abi: factoryABI,
    functionName: 'getProjectRewardURI',
    args: [projectId],
  }) as string;

  return result;
}

export async function markMilestoneComplete(projectId: bigint, milestoneIndex: number) {
  const walletClient = getWalletClient();
  const [account] = await walletClient.getAddresses();

  const hash = await walletClient.writeContract({
    address: FACTORY_ADDRESS,
    abi: factoryABI,
    functionName: 'markMilestoneComplete',
    args: [projectId, milestoneIndex],
    account,
  });

  return hash;
}

export async function releaseMilestone(projectId: bigint, milestoneIndex: number) {
  const walletClient = getWalletClient();
  const [account] = await walletClient.getAddresses();

  const hash = await walletClient.writeContract({
    address: FACTORY_ADDRESS,
    abi: factoryABI,
    functionName: 'releaseMilestone',
    args: [projectId, milestoneIndex],
    account,
  });

  return hash;
}

export async function getContribution(projectId: bigint, supporter: string): Promise<bigint> {
  const publicClient = getPublicClient();

  const result = await publicClient.readContract({
    address: FACTORY_ADDRESS,
    abi: factoryABI,
    functionName: 'contributions',
    args: [projectId, supporter],
  }) as bigint;

  return result;
}
