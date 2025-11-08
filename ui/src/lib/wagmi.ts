import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { localhost, sepolia } from 'wagmi/chains';

// Custom Hardhat local chain to match your Hardhat node (chainId 31337)
const hardhat = {
  ...localhost,
  id: 31337,
  name: 'Hardhat',
  network: 'hardhat',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
};

export const config = getDefaultConfig({
  appName: 'Credential Vault',
  projectId: '88306a972a77389d91871e08d26516af',
  chains: [hardhat, sepolia],
  ssr: false,
});
