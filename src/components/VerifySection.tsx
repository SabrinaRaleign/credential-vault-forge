import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Search, Award, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from 'wagmi';

const VerifySection = () => {
  const { isConnected } = useAccount();
  const [walletAddress, setWalletAddress] = useState("");

  const handleVerify = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!walletAddress) {
      toast.error("Please enter a wallet address");
      return;
    }
    
    // Check if credentials exist for this address
    const credentials = JSON.parse(localStorage.getItem('credentials') || '{}');
    const userCredentials = Object.values(credentials).filter(
      (cred: any) => cred.owner.toLowerCase() === walletAddress.toLowerCase()
    );
    
    if (userCredentials.length === 0) {
      toast.error("No credentials found for this address");
      return;
    }
    
    toast.success("Verification request sent!", {
      description: `Found ${userCredentials.length} credential(s). Waiting for owner authorization.`
    });
    setWalletAddress("");
  };

  return (
    <Card className="border-2 border-gold/30 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-gold" />
          <CardTitle className="text-xl">Verify Credentials</CardTitle>
        </div>
        <CardDescription>
          Verifiers: Request access to decrypt and verify credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-xs text-destructive">
              Please connect your wallet to verify credentials
            </p>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="wallet-address">Student Wallet Address</Label>
          <Input
            id="wallet-address"
            placeholder="0x..."
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="font-mono text-sm"
            disabled={!isConnected}
          />
        </div>
        <div className="flex items-start gap-2 p-3 bg-gold/10 rounded-lg border border-gold/20">
          <Award className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
          <p className="text-xs text-foreground">
            Verification is permission-based. The credential owner must authorize 
            access before you can decrypt and view their proof.
          </p>
        </div>
        <Button 
          onClick={handleVerify}
          variant="verified"
          className="w-full"
          disabled={!isConnected}
        >
          <Search className="h-4 w-4" />
          Request Verification
        </Button>
      </CardContent>
    </Card>
  );
};

export default VerifySection;
