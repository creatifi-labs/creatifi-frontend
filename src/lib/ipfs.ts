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

export async function uploadToIPFS(file: File): Promise<string> {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`, // pastikan token ini ada
      },
      body: formData,
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Upload failed")

    console.log("✅ Uploaded to IPFS:", data)
    return data.IpfsHash // CID yang dikembalikan oleh Pinata
  } catch (err) {
    console.error("❌ Upload to IPFS failed:", err)
    throw err
  }
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
