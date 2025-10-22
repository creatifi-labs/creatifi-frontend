const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
];

export function ipfsToHttp(ipfsUri: string, gatewayIndex: number = 0): string {
  if (!ipfsUri) return '';
  
  const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
  
  // Handle ipfs:// protocol
  if (ipfsUri.startsWith('ipfs://')) {
    const cid = ipfsUri.replace('ipfs://', '');
    return `${gateway}${cid}`;
  }
  
  // Already HTTP URL
  if (ipfsUri.startsWith('http')) {
    return ipfsUri;
  }
  
  // Just CID
  return `${gateway}${ipfsUri}`;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
}

export async function fetchMetadataFromIPFS(ipfsUri: string): Promise<NFTMetadata | null> {
  // Try multiple gateways
  for (let i = 0; i < IPFS_GATEWAYS.length; i++) {
    try {
      const httpUrl = ipfsToHttp(ipfsUri, i);
      console.log(`Fetching metadata from gateway ${i}:`, httpUrl);
      
      const response = await fetch(httpUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error(`Gateway ${i} failed:`, response.status);
        continue;
      }
      
      const metadata: NFTMetadata = await response.json();
      console.log('Metadata fetched successfully:', metadata);
      
      return metadata;
    } catch (error) {
      console.error(`Error with gateway ${i}:`, error);
      if (i === IPFS_GATEWAYS.length - 1) {
        // Last gateway also failed
        return null;
      }
      // Try next gateway
      continue;
    }
  }
  
  return null;
}
