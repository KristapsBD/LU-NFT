# LU-NFT: Cross-Chain NFT Implementation Comparison

A comparative implementation of NFT minting functionality across three blockchain protocols: Bitcoin (Ordinals), Ethereum (ERC-721), and Solana (Metaplex). This project demonstrates the technical differences, development complexity, and user experience of creating digital collectibles on each platform while maintaining consistent metadata and functionality.

Developed as part of a bachelor's thesis research at the University of Latvia.

## Project Overview

This repository contains all the necessary components to implement and analyze NFT minting across the three most prominent blockchain platforms. Each implementation maintains consistent functionality while showcasing the unique features and challenges of each blockchain ecosystem.

### Components

- **Bitcoin Ordinals Implementation**
  - Simulation scripts for Bitcoin Ordinals transactions
  - Transaction fee analysis and comparison tools
  - CSV data export for analysis

- **Ethereum ERC-721 Implementation**
  - Custom ERC-721A smart contract with optimized gas usage
  - Frontend minting interface using React
  - Hardhat development environment

- **Solana Metaplex Implementation**
  - Candy Machine v3 setup and deployment
  - Custom UI for minting with guard support
  - Transaction analysis tooling

- **Shared Resources**
  - NFT artwork generation using HashLips Art Engine
  - Transaction data collection and analysis
  - Metadata standardization across platforms

## Directory Structure

- `/bitcoin-scripts/` - Scripts for Bitcoin Ordinals simulation and transaction analysis
- `/smart-contract/` - Ethereum ERC-721A smart contract implementation using Hardhat
- `/ethereum-ui/` - React based frontend for the Ethereum NFT minting
- `/solana-scripts/` - Solana program transaction analysis tools
- `/solana-ui/` - Custom UI for Solana Candy Machine minting
- `/candymachine/` - Solana Candy Machine configuration and assets
- `/hashlips-art-engine/` - NFT artwork generation tool
- `/transaction-data/` - Collected transaction data across all platforms

## Bitcoin Ordinals Implementation

The Bitcoin implementation simulates Ordinals inscriptions on the Bitcoin mainnet, calculating fees and transaction costs.

### Features

- Simulates multiple Bitcoin Ordinals transactions with customizable parameters
- Uses real-time fee rates from the Bitcoin network
- Calculates transaction fees in both BTC and EUR
- Exports detailed transaction data to CSV
- Provides summary statistics for analysis

### Usage

```bash
cd bitcoin-scripts
npm install
node index.js
```

## Ethereum ERC-721 Implementation

The Ethereum implementation uses a custom ERC-721A smart contract with various owner configurable parameters.

### Features

- Gas-optimized ERC-721A implementation
- Owner-controlled minting parameters (cost, supply limits, etc.)
- Reveal functionality for collections
- Customizable metadata URI
- Frontend for easy minting

### Contract Deployment

```bash
npm i -g truffle
truffle dashboard
cd smart-contract
yarn install
yarn deploy --network truffle
```

### UI Launch

```bash
cd ethereum-ui
npm install
npm run dev-server
```

## Solana Metaplex Implementation

The Solana implementation utilizes Metaplex Candy Machine v3 for efficient NFT minting with advanced features.

### Features

- Candy Machine v3 with Account Version v2
- Support for multiple guard groups
- Lookup table creation for more active guards
- Frontend UI with dynamic info display
- Support for most Candy Machine guards

### Program Deployment

Create your Candy Machine using Sugar and Solana Tool Suite

### UI Launch

```bash
cd solana-ui
npm install
npm run dev
```

## Data Analysis

All implementations export transaction data to CSV files for comparative analysis. The data includes:
- Transaction IDs and timestamps
- Gas/fee costs in native tokens and EUR
- Transaction sizes
- Network details

This data allows for objective comparison of costs, efficiency, and user experience across platforms.

## Requirements

- Node.js (v14+)
- NPM or Yarn
- Solana CLI tools (for Solana implementation)
- Metaplex Sugar CLI (for Candy Machine setup)
- Hardhat and Truffle (for Ethereum development)

## Research Findings

This project demonstrates several key differences between blockchain platforms for NFT implementation:

1. **Development Complexity**: Varying levels of developer tooling and documentation
2. **Cost Efficiency**: Different fee structures and optimization opportunities
3. **User Experience**: Wallet compatibility and transaction confirmation times
4. **Feature Support**: Native capabilities for royalties, metadata, and programmability

For detailed analysis and conclusions, refer to the associated bachelor's thesis.

## License

This project is academic research and provided for educational purposes.

## Acknowledgements

- University of Latvia Faculty of Computing
- Bitcoin, Ethereum, and Solana developer communities
- Metaplex Foundation
- OpenZeppelin and ERC721A developers
