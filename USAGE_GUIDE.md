# Credential Vault Chain - Usage Guide

## 🎯 Overview

Credential Vault Chain is a blockchain-based credential verification system that allows students to securely store credential hashes on-chain and grant selective access to verifiers. The system is designed to be FHE-ready for future privacy-preserving enhancements.

## 🚀 Quick Start

### Prerequisites

- Modern web browser with MetaMask or similar wallet
- Test ETH for Sepolia network (or use local Hardhat network)
- Node.js 18+ for local development

### Accessing the Application

1. **Live Demo**: Visit [credential-vault-chain.vercel.app](https://credential-vault-chain.vercel.app/)
2. **Local Development**: Follow the setup instructions below

## 📋 User Roles

### 👨‍🎓 Student (Credential Owner)

Students can upload and manage their academic credentials.

### 🔍 Verifier (Employer/Institution)

Verifiers can request access to verify student credentials with permission.

## 🎮 Step-by-Step Usage

### For Students

#### 1. Connect Wallet
- Click "Connect Wallet" in the top-right corner
- Select your wallet (MetaMask recommended)
- Switch to Sepolia testnet or localhost for testing

#### 2. Upload Credential
- Navigate to the "Upload Credential Hash" section
- Enter a descriptive credential name (e.g., "Bachelor of Computer Science")
- Provide the SHA-256 hash of your credential document
- Click "Encrypt & Upload"

#### 3. Manage Credentials
- View all uploaded credentials in "My Credentials" section
- Authorize verifiers to access specific credentials
- Revoke credentials if needed

#### 4. Authorize Verifiers
- In credential details, enter verifier wallet address
- Click "Grant Access" to authorize verification

### For Verifiers

#### 1. Connect Wallet
- Connect your wallet as described above

#### 2. Request Verification
- Enter the student's wallet address
- Click "Request Verification"
- View authorized credentials with their hashes

#### 3. Verify Credentials
- Use the provided hashes to verify against original documents
- Only authorized credentials will be visible

## 🔧 Local Development Setup

### Backend (Smart Contracts)

```bash
# Install dependencies
npm install

# Start local Hardhat network
npm run node

# Deploy contracts locally
npm run deploy:local
```

### Frontend (React Application)

```bash
# Navigate to UI directory
cd ui

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 🌐 Network Configuration

### Local Hardhat Network
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Contract Address: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

### Sepolia Testnet
- RPC URL: Sepolia endpoint from your wallet provider
- Chain ID: `11155111`
- Contract Address: `0x45601eC310aCDb100e65FF4e3E68FC2C343F0E5F`

## 📊 Understanding the Flow

### 1. Document Preparation
- Student creates/verifies their credential document
- Generates SHA-256 hash of the document
- Document itself remains off-chain for privacy

### 2. On-Chain Storage
- Hash and encrypted metadata stored on blockchain
- Immutable record of credential existence
- Owner maintains full control over access

### 3. Selective Disclosure
- Owner grants specific verifiers access to credential hashes
- Verifiers can confirm credential validity without seeing content
- Future FHE integration will enable private verification

### 4. Verification Process
- Verifier requests access through smart contract
- If authorized, receives credential hash
- Can verify against known credential databases

## 🔒 Security Features

### Access Control
- Only credential owners can manage their credentials
- Granular authorization system for verifiers
- Revocation capability for compromised credentials

### Data Integrity
- SHA-256 hashing ensures credential authenticity
- On-chain storage prevents tampering
- Event logging for audit trails

### Privacy Protection
- Only hashes stored on-chain (not actual documents)
- Selective disclosure prevents unnecessary exposure
- Designed for future FHE integration

## 🐛 Troubleshooting

### Common Issues

#### Wallet Connection Issues
- Ensure MetaMask is installed and unlocked
- Check network selection (Localhost/Sepolia)
- Verify account has sufficient test ETH

#### Transaction Failures
- Check gas fees and account balance
- Verify contract addresses are correct
- Ensure all required fields are filled

#### Verification Not Working
- Confirm you have authorization from credential owner
- Check wallet address format
- Verify you're on the correct network

### Error Messages

- **"Please connect your wallet first"**: Connect wallet before proceeding
- **"Invalid docHash"**: Ensure hash is valid 64-character hex string
- **"Not credential owner"**: Only owners can manage their credentials
- **"Credential revoked"**: Cannot authorize access to revoked credentials

## 📈 Gas Optimization

The contract includes several gas optimization features:

- Event indexing for efficient queries
- Memory caching to reduce storage access
- Optimized struct packing
- Batch operation support

## 🔮 Future Enhancements

### Fully Homomorphic Encryption (FHE)
- Private credential verification
- Zero-knowledge proofs
- Enhanced privacy guarantees

### Multi-Network Support
- Support for additional testnets and mainnets
- Cross-chain credential portability

### Advanced Features
- Credential expiration dates
- Revocation lists
- Bulk operations

## 📞 Support

For technical support:
- Check this usage guide
- Review the README.md for detailed documentation
- Open issues on the GitHub repository

## 📝 Demo Video

Watch the included `credential-vault-chain.mp4` for a complete walkthrough of the application functionality.

---

*This guide is for the MVP version. Features and interfaces may change in future updates.*
