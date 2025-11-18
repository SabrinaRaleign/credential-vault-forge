# CredentialVault Deployment Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Hardhat
- Git

## Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure your environment variables in `.env`:
```bash
# Network selection
NETWORK=localhost

# Wallet configuration (use test keys for development)
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# RPC URLs (optional)
LOCAL_RPC_URL=http://127.0.0.1:8545
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

## Local Development Deployment

1. Start local Hardhat network:
```bash
npx hardhat node
```

2. Deploy to localhost in a new terminal:
```bash
npm run deploy:local
```

## Testnet Deployment (Sepolia)

1. Configure Sepolia network in `hardhat.config.ts`
2. Fund your wallet with test ETH
3. Deploy to testnet:
```bash
npm run deploy:sepolia
```

## Mainnet Deployment

⚠️ **Mainnet deployments are irreversible and expensive**

1. Configure mainnet settings
2. Use production wallet with sufficient funds
3. Deploy to mainnet:
```bash
npm run deploy:mainnet
```

## Contract Verification

After deployment, verify your contract on Etherscan:

```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## Deployment Scripts

### Available Scripts

- `npm run deploy:local` - Deploy to local Hardhat network
- `npm run deploy:sepolia` - Deploy to Sepolia testnet
- `npm run deploy:mainnet` - Deploy to Ethereum mainnet
- `npm run test` - Run test suite
- `npm run test:gas` - Run gas usage tests

### Custom Deployment

For custom networks, modify `scripts/deploy.ts` and add network configuration to `hardhat.config.ts`.

## Post-Deployment

1. Update frontend configuration with deployed contract address
2. Test all functionality on the target network
3. Verify contract source code if public
4. Document deployment details for future reference

## Troubleshooting

### Common Issues

1. **Insufficient funds**: Ensure wallet has enough native tokens
2. **Network congestion**: Increase gas price or wait for lower congestion
3. **Verification failures**: Check API keys and network compatibility

### Support

For deployment issues, check:
- Hardhat documentation
- Network-specific documentation (Infura, Alchemy, etc.)
- Contract verification guides
