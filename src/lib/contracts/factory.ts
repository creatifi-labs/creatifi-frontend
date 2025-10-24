import { createPublicClient, createWalletClient, custom, http, formatEther } from 'viem';
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
    chain: sepolia, // TAMBAHKAN INI
    transport: custom(window.ethereum)
  });
}

async function switchToSepolia() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No ethereum provider found');
  }

  try {
    // Try to switch to Sepolia
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7',
              chainName: 'Sepolia',
              rpcUrls: [process.env.NEXT_PUBLIC_RPC_URL],
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      } catch (addError) {
        throw new Error('Failed to add Sepolia network to MetaMask');
      }
    } else {
      throw switchError;
    }
  }
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
  status: number; // 0=Pending, 1=Proposed, 2=Completed
  proofURI: string;
  agreeCount: bigint;
  disagreeCount: bigint;
  totalVotes: bigint;
  voteDeadline: bigint;
  finalized: boolean;
}

export async function createProject(
  title: string,
  targetAmount: bigint,
  milestoneNames: [string, string, string],
  milestoneAmounts: [bigint, bigint, bigint],
  rewardURI: string
) {
  // FORCE SWITCH KE SEPOLIA DULU
  await switchToSepolia();

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
      // Tidak perlu tambahkan chain di sini karena sudah di WalletClient
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
  // FORCE SWITCH KE SEPOLIA DULU
  await switchToSepolia();

  console.log('=== SUPPORT PROJECT DEBUG ===')
  console.log('Factory Address:', FACTORY_ADDRESS)
  console.log('Project ID:', projectId.toString())
  console.log('Amount (wei):', amount.toString())
  console.log('Amount (ETH):', formatEther(amount))

  const walletClient = getWalletClient();
  const [account] = await walletClient.getAddresses();

  console.log('Sender account:', account)

  try {
    const hash = await walletClient.writeContract({
      address: FACTORY_ADDRESS,
      abi: factoryABI,
      functionName: 'supportProject',
      args: [projectId],
      value: amount,
      account,
      chain: sepolia, // Specify chain saat write
    });

    console.log('Transaction hash:', hash)
    return hash;
  } catch (error) {
    console.error('=== SUPPORT PROJECT ERROR ===')
    console.error('Error:', error)
    throw error;
  }
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

  // Result sekarang punya 11 fields (sesuai contract baru)
  if (Array.isArray(result)) {
    return {
      name: result[0],
      amount: result[1],
      released: result[2],
      completed: result[3],
      status: result[4],
      proofURI: result[5],
      agreeCount: result[6],
      disagreeCount: result[7],
      totalVotes: result[8],
      voteDeadline: result[9],
      finalized: result[10],
    };
  } else {
    return {
      name: result.name || result[0],
      amount: result.amount || result[1],
      released: result.released || result[2],
      completed: result.completed || result[3],
      status: result.status || result[4],
      proofURI: result.proofURI || result[5],
      agreeCount: result.agreeCount || result[6],
      disagreeCount: result.disagreeCount || result[7],
      totalVotes: result.totalVotes || result[8],
      voteDeadline: result.voteDeadline || result[9],
      finalized: result.finalized || result[10],
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

export async function getSupportedProjects(userAddress: string): Promise<bigint[]> {
  const publicClient = getPublicClient();
  
  const result = await publicClient.readContract({
    address: FACTORY_ADDRESS,
    abi: factoryABI,
    functionName: 'getSupportedProjects',
    args: [userAddress],
  }) as bigint[];

  return result;
}

export async function isSupporter(projectId: bigint, userAddress: string): Promise<boolean> {
  const publicClient = getPublicClient();
  
  const contribution = await publicClient.readContract({
    address: FACTORY_ADDRESS,
    abi: factoryABI,
    functionName: 'contributions',
    args: [projectId, userAddress],
  }) as bigint;

  return contribution > 0n;
}

export async function getContribution(projectId: bigint, userAddress: string): Promise<bigint> {
  const publicClient = getPublicClient();
  
  const contribution = await publicClient.readContract({
    address: FACTORY_ADDRESS,
    abi: factoryABI,
    functionName: 'contributions',
    args: [projectId, userAddress],
  }) as bigint;

  return contribution;
}

// Propose milestone completion (creator only)
export async function proposeMilestoneCompletion(
  projectId: bigint,
  milestoneIndex: number,
  proofURI: string
) {
  await switchToSepolia();
  
  const walletClient = getWalletClient();
  const [account] = await walletClient.getAddresses();

  const hash = await walletClient.writeContract({
    address: FACTORY_ADDRESS,
    abi: factoryABI,
    functionName: 'proposeMilestoneCompletion',
    args: [projectId, milestoneIndex, proofURI],
    account,
  });

  return hash;
}

// Vote on milestone completion (supporter only)
export async function voteMilestoneCompletion(
  projectId: bigint,
  milestoneIndex: number,
  agree: boolean
) {
  await switchToSepolia();
  
  const walletClient = getWalletClient();
  const [account] = await walletClient.getAddresses();

  const hash = await walletClient.writeContract({
    address: FACTORY_ADDRESS,
    abi: factoryABI,
    functionName: 'voteMilestoneCompletion',
    args: [projectId, milestoneIndex, agree],
    account,
  });

  return hash;
}

// Finalize milestone vote (anyone can call after deadline)
export async function finalizeMilestoneVote(
  projectId: bigint,
  milestoneIndex: number
) {
  await switchToSepolia();
  
  const walletClient = getWalletClient();
  const [account] = await walletClient.getAddresses();

  const hash = await walletClient.writeContract({
    address: FACTORY_ADDRESS,
    abi: factoryABI,
    functionName: 'finalizeMilestoneVote',
    args: [projectId, milestoneIndex],
    account,
  });

  return hash;
}
