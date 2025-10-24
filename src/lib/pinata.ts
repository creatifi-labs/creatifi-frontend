const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT!;

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
}

export async function uploadMetadataToPinata(metadata: NFTMetadata): Promise<string> {
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `${metadata.name} - Metadata`
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to upload metadata to Pinata');
    }

    const data = await response.json();
    return data.IpfsHash; // Returns the CID
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
}

export function formatIPFSUri(cid: string): string {
  return `ipfs://${cid}`;
}
