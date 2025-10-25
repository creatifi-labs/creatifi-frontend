# CreatiFi - Decentralized Creative Funding Platform

## Overview

CreatiFi is a blockchain-based crowdfunding platform that empowers creators through transparent, on-chain funding. Built on Web3 technology, CreatiFi revolutionizes how creative projects are funded by ensuring complete transparency, milestone-based fund releases, and verifiable proof of support through NFT badges.

### Key Features

- **🔒 Smart Contract Escrow**: All funds are secured in smart contracts and released transparently when milestones are verified and completed
- **🎖️ NFT Proof of Support**: Supporters receive unique NFT badges as permanent proof of their contribution and support
- **📊 On-Chain Transparency**: All funding flows and project milestones are recorded publicly on-chain, allowing anyone to verify progress and accountability
- **🎯 Milestone-Based Funding**: Projects are divided into clear milestones with specific funding goals
- **💎 Tiered Rewards**: Multiple supporter tiers with different benefits and contribution levels
- **🌐 Web3 Wallet Integration**: Seamless integration with Xellar Embedded Wallet for easy onboarding

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom design system
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Web3 Integration**:
  - Wagmi v2
  - Viem v2
  - Xellar Kit v2.4.3
- **IPFS Storage**: Pinata for decentralized metadata storage
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or compatible Web3 wallet
- Sepolia ETH for testing

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd creatifi-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` file:

```bash
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_XELLAR_APP_ID=your_xellar_app_id
NEXT_PUBLIC_XELLAR_ENV=sandbox
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Getting Test ETH

1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your wallet address
3. Request test ETH

## Features Guide

### For Creators

1. **Launch a Project**:

   - Connect your wallet
   - Navigate to "Start a Project"
   - Fill in project details, milestones, and reward tiers
   - Upload NFT image to Pinata
   - Deploy project on-chain

2. **Manage Projects**:
   - Track funding progress
   - View supporter contributions
   - Request milestone fund releases
   - Monitor project analytics

### For Supporters

1. **Discover Projects**:

   - Browse all active projects
   - Filter by status (Active/Funded)
   - Search by project name

2. **Support Projects**:

   - Choose a project
   - Select support tier
   - Contribute funds
   - Receive NFT proof of support

3. **Track Contributions**:
   - View all supported projects
   - See your total contributions
   - Access your NFT badges
   - Monitor project progress

## Smart Contract Integration

The platform interacts with smart contracts for:

- Project creation and management
- Fund contributions and escrow
- Milestone-based fund releases
- NFT badge minting for supporters
- On-chain verification and transparency

## IPFS & Metadata

Project metadata and NFT images are stored on IPFS via Pinata:

- Decentralized storage ensures permanence
- Metadata includes project details, tiers, and rewards
- Images are stored with content addressing (CID)
- Metadata follows ERC-721 standard for NFTs

## Dark Mode Support

Built-in dark/light mode toggle:

- Accessible via wallet dropdown
- Persists across sessions
- Smooth transitions
- Optimized for both themes

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)
- [Xellar Kit Documentation](https://docs.xellar.co/)
- [Pinata IPFS Documentation](https://docs.pinata.cloud/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Contact

- Website: [creatifi.vercel.app](https://creatifi.vercel.app)
- Instagram: [@creatifi](https://instagram.com/creatifi)
---

Built with ❤️ by the CreatiFi team
