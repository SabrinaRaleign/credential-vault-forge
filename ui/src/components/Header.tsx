import logo from "@/assets/logo.png";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Shield, Lock, Eye, Wifi, WifiOff } from "lucide-react";
import { useAccount } from "wagmi";

const Header = () => {
  const { isConnected, chain } = useAccount();

  const getNetworkStatus = () => {
    if (!isConnected) return { status: 'disconnected', color: 'text-red-500', icon: WifiOff };
    if (chain?.name?.toLowerCase().includes('sepolia')) return { status: 'testnet', color: 'text-yellow-500', icon: Wifi };
    if (chain?.name?.toLowerCase().includes('mainnet') || chain?.name?.toLowerCase().includes('ethereum')) return { status: 'mainnet', color: 'text-green-500', icon: Wifi };
    return { status: 'connected', color: 'text-blue-500', icon: Wifi };
  };

  const networkStatus = getNetworkStatus();
  const NetworkIcon = networkStatus.icon;

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Credential Vault" className="h-10 w-10" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-primary">Credential Vault</h1>
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <Lock className="h-3 w-3" />
                  <span>FHE Protected</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${networkStatus.color === 'text-red-500' ? 'bg-red-50' : networkStatus.color === 'text-yellow-500' ? 'bg-yellow-50' : networkStatus.color === 'text-green-500' ? 'bg-green-50' : 'bg-blue-50'}`}>
                  <NetworkIcon className={`h-3 w-3 ${networkStatus.color}`} />
                  <span className="capitalize">{networkStatus.status}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Encrypted credentials with on-chain proofs and zero-knowledge verification
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
