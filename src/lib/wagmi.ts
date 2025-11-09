import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'EduProof Vault',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [mainnet, polygon, optimism, arbitrum, sepolia],
  ssr: false,
});
