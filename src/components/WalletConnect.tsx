import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Shield } from "lucide-react";
import { toast } from "sonner";

const WalletConnect = () => {
  const handleConnect = () => {
    toast.info("Rainbow Wallet connection will be implemented with Web3 integration");
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
      <CardContent>
        <Button 
          onClick={handleConnect}
          variant="credential"
          className="w-full"
        >
          <Shield className="h-4 w-4" />
          Connect Rainbow Wallet
        </Button>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Your credentials are secured on the blockchain. Only you control access.
        </p>
      </CardContent>
    </Card>
  );
};

export default WalletConnect;
