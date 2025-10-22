import { useState, useEffect } from 'react';
import { getProjectCount, getProject, getMilestone, getProjectRewardURI } from '@/lib/contracts/factory';
import { formatEther } from 'viem';
import { fetchMetadataFromIPFS, ipfsToHttp } from '@/lib/ipfs';

export interface ExploreProject {
  id: number;
  creator: string;
  title: string;
  status: 'active' | 'funded' | 'closed';
  goal: number;
  raised: number;
  progress: number; // percentage
  milestonesCompleted: number;
  totalMilestones: number;
  imageUrl?: string;
  description?: string;
}

export function useAllProjects() {
  const [projects, setProjects] = useState<ExploreProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllProjects();
  }, []);

  const fetchAllProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Get total project count
      const count = await getProjectCount();
      const totalProjects = Number(count);

      console.log('Total projects in contract:', totalProjects);

      if (totalProjects === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }

      // Step 2: Fetch all projects (no filtering)
      const projectPromises = [];
      
      // Project IDs start from 1, not 0
      for (let i = 1; i <= totalProjects; i++) {
        projectPromises.push(fetchSingleProject(i));
      }

      const allProjects = await Promise.all(projectPromises);
      
      // Filter out null values (failed fetches)
      const validProjects = allProjects.filter((p): p is ExploreProject => p !== null);

      console.log('All projects:', validProjects);
      setProjects(validProjects);
    } catch (err: any) {
      console.error('Error fetching all projects:', err);
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleProject = async (projectId: number): Promise<ExploreProject | null> => {
    try {
      // Fetch project details
      const project = await getProject(BigInt(projectId));

      // Fetch all 3 milestones
      const milestonePromises = [
        getMilestone(BigInt(projectId), 0),
        getMilestone(BigInt(projectId), 1),
        getMilestone(BigInt(projectId), 2),
      ];

      const milestones = await Promise.all(milestonePromises);

      // Count completed milestones
      const completedCount = milestones.filter(m => m.completed).length;

      // Determine status
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

      // Calculate progress percentage
      const goalEth = Number(formatEther(project.targetAmount));
      const raisedEth = Number(formatEther(project.currentAmount));
      const progress = goalEth > 0 ? Math.min((raisedEth / goalEth) * 100, 100) : 0;

      // Fetch metadata & image
      let imageUrl: string | undefined;
      let description: string | undefined;

      try {
        const rewardURI = await getProjectRewardURI(BigInt(projectId));
        console.log(`Project ${projectId} rewardURI:`, rewardURI);
        
        if (rewardURI) {
          const metadata = await fetchMetadataFromIPFS(rewardURI);
          if (metadata) {
            description = metadata.description;
            if (metadata.image) {
              imageUrl = ipfsToHttp(metadata.image);
              console.log(`Project ${projectId} imageUrl:`, imageUrl);
            }
          }
        }
      } catch (metaErr) {
        console.error(`Failed to fetch metadata for project ${projectId}:`, metaErr);
      }

      return {
        id: projectId,
        creator: project.creator,
        title: project.title,
        status,
        goal: goalEth,
        raised: raisedEth,
        progress,
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

  return { projects, loading, error, refetch: fetchAllProjects };
}
