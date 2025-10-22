import { useState, useEffect } from 'react';
import { getProjectCount, getProject, getMilestone, getProjectRewardURI } from '@/lib/contracts/factory';
import { formatEther } from 'viem';
import { fetchMetadataFromIPFS, ipfsToHttp } from '@/lib/ipfs';

export interface CreatorProject {
  id: number;
  title: string;
  status: 'active' | 'funded' | 'closed';
  goal: number;
  raised: number;
  milestonesCompleted: number;
  totalMilestones: number;
  imageUrl?: string;
  description?: string;
}

export function useCreatorProjects(walletAddress: string | undefined) {
  const [projects, setProjects] = useState<CreatorProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setProjects([]);
      return;
    }

    fetchCreatorProjects();
  }, [walletAddress]);

  const fetchCreatorProjects = async () => {
    if (!walletAddress) return;

    try {
      setLoading(true);
      setError(null);

      const count = await getProjectCount();
      const totalProjects = Number(count);

      console.log('Total projects in contract:', totalProjects);

      if (totalProjects === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }

      const projectPromises = [];
      
      for (let i = 1; i <= totalProjects; i++) {
        projectPromises.push(fetchSingleProject(i, walletAddress));
      }

      const allProjects = await Promise.all(projectPromises);
      const creatorProjects = allProjects.filter((p): p is CreatorProject => p !== null);

      console.log('Creator projects:', creatorProjects);
      setProjects(creatorProjects);
    } catch (err: any) {
      console.error('Error fetching creator projects:', err);
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleProject = async (
    projectId: number,
    creatorAddress: string
  ): Promise<CreatorProject | null> => {
    try {
      const project = await getProject(BigInt(projectId));

      if (project.creator.toLowerCase() !== creatorAddress.toLowerCase()) {
        return null;
      }

      const milestonePromises = [
        getMilestone(BigInt(projectId), 0),
        getMilestone(BigInt(projectId), 1),
        getMilestone(BigInt(projectId), 2),
      ];

      const milestones = await Promise.all(milestonePromises);
      const completedCount = milestones.filter(m => m.completed).length;

      let status: 'active' | 'funded' | 'closed';
      if (project.fullyFunded) {
        status = 'funded';
      } else if (project.currentAmount >= project.targetAmount) {
        status = 'funded';
      } else if (completedCount === 3) {
        status = 'closed';
      } else {
        status = 'active';
      }

      // Fetch metadata & image
      let imageUrl: string | undefined;
      let description: string | undefined;

      try {
        const rewardURI = await getProjectRewardURI(BigInt(projectId));
        if (rewardURI) {
          const metadata = await fetchMetadataFromIPFS(rewardURI);
          if (metadata) {
            description = metadata.description;
            imageUrl = metadata.image ? ipfsToHttp(metadata.image) : undefined;
          }
        }
      } catch (metaErr) {
        console.error(`Failed to fetch metadata for project ${projectId}:`, metaErr);
      }

      return {
        id: projectId,
        title: project.title,
        status,
        goal: Number(formatEther(project.targetAmount)),
        raised: Number(formatEther(project.currentAmount)),
        milestonesCompleted: completedCount,
        totalMilestones: 3,
        imageUrl,
        description,
      };
    } catch (err) {
      console.error(`Error fetching project ${projectId}:`, err);
      return null;
    }
  };

  return { projects, loading, error, refetch: fetchCreatorProjects };
}
