import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Shield, Check, Copy } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const WalletConnect = () => {
  const { address, isConnected } = useAccount();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    }
  };

  return (
    <Card className="border-2 border-gold/20 bg-card/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-gold" />
          <CardTitle className="text-xl">Connect Wallet</CardTitle>
        </div>
        <CardDescription>
          Rainbow Wallet required for credential ownership and verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div>
                {(() => {
                  if (!connected) {
                    return (
                      <Button 
                        onClick={openConnectModal} 
                        variant="credential"
                        className="w-full"
                      >
                        <Shield className="h-4 w-4" />
                        Connect Rainbow Wallet
                      </Button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <Button 
                        onClick={openChainModal} 
                        variant="destructive"
                        className="w-full"
                      >
                        Wrong network
                      </Button>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-forest/10 rounded-lg border border-gold/20">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-gold" />
                          <span className="text-sm font-mono text-foreground">
                            {account.displayName}
                          </span>
                        </div>
                        <Button
                          onClick={copyAddress}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={openChainModal}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          {chain.hasIcon && (
                            <div className="w-4 h-4 rounded-full overflow-hidden mr-2">
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  className="w-4 h-4"
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </Button>
                        <Button 
                          onClick={openAccountModal}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
        
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Your credentials are secured on the blockchain. Only you control access.
        </p>
      </CardContent>
    </Card>
  );
};

export default WalletConnect;
