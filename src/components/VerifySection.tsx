import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Search, Award } from "lucide-react";
import { toast } from "sonner";

const VerifySection = () => {
  const [walletAddress, setWalletAddress] = useState("");

  const handleVerify = () => {
    if (!walletAddress) {
      toast.error("Please enter a wallet address");
      return;
    }
    toast.success("Verification request sent!", {
      description: "Waiting for credential owner authorization"
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
        <div className="space-y-2">
          <Label htmlFor="wallet-address">Student Wallet Address</Label>
          <Input
            id="wallet-address"
            placeholder="0x..."
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="font-mono text-sm"
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
        >
          <Search className="h-4 w-4" />
          Request Verification
        </Button>
      </CardContent>
    </Card>
  );
};

export default VerifySection;
