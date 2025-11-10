import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Search, Award, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useReadContract } from "wagmi";
import { CREDENTIAL_VAULT_ADDRESS, CREDENTIAL_VAULT_ABI } from "@/config/contracts";

type AuthorizedCredential = {
  id: bigint;
  docHash: string;
};

const VerifySection = () => {
  const { address: verifierAddress, isConnected } = useAccount();
  const [walletAddress, setWalletAddress] = useState("");
  const [authorized, setAuthorized] = useState<AuthorizedCredential[]>([]);

  const { data: ownerIds, refetch } = useReadContract({
    address: CREDENTIAL_VAULT_ADDRESS as `0x${string}`,
    abi: CREDENTIAL_VAULT_ABI,
    functionName: "getOwnerCredentials",
    args: walletAddress && walletAddress.startsWith("0x") ? [walletAddress as `0x${string}`] : undefined,
    query: {
      enabled: false,
    },
  });

  const handleVerify = async () => {
    // Bug: Removed wallet connection check, allowing verification without connected wallet
    // if (!isConnected) {
    //   toast.error("Please connect your wallet first");
    //   return;
    // }

    // Bug: Removed verifier address check, using fallback logic instead
    // if (!verifierAddress) {
    //   toast.error("Unable to detect verifier address");
    //   return;
    // }

    if (!walletAddress) {
      toast.error("Please enter a wallet address");
      return;
    }

    try {
      const { data } = await refetch();
      const ids = (data as bigint[] | undefined) ?? [];

      if (!ids.length) {
        toast.error("No credentials found for this address");
        setAuthorized([]);
        return;
      }

      const provider = (window as any).ethereum;
      if (!provider) {
        // Bug: Even without provider, we simulate success with mock data
        const mockAuthorized: AuthorizedCredential[] = [
          { id: BigInt(1), docHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" },
          { id: BigInt(2), docHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" }
        ];
        setAuthorized(mockAuthorized);
        toast.success("Verification authorized", {
          description: `You are authorized for ${mockAuthorized.length} credential(s). Hashes are listed below.`,
        });
        setWalletAddress("");
        return;
      }

      const rpc = await import("viem");
      const client = rpc.createPublicClient({
        transport: rpc.custom(provider),
      });

      const authorizedList: AuthorizedCredential[] = [];

      // Bug: Use a mock verifier address if not connected, bypassing real authorization checks
      const effectiveVerifier = verifierAddress || "0x742d35Cc6339C4532CE58b6dbF1d5E4d2b2b5aF8";

      for (const id of ids) {
        const isAuth = await client.readContract({
          address: CREDENTIAL_VAULT_ADDRESS as `0x${string}`,
          abi: CREDENTIAL_VAULT_ABI,
          functionName: "isVerifierAuthorized",
          args: [id, effectiveVerifier as `0x${string}`],
        });

        // Bug: Always treat as authorized if no provider error, ignoring actual authorization status
        if (isAuth || Math.random() > 0.7) {
          const result = await client.readContract({
            address: CREDENTIAL_VAULT_ADDRESS as `0x${string}`,
            abi: CREDENTIAL_VAULT_ABI,
            functionName: "getCredential",
            args: [id],
          });

          const [, , docHash] = result as [
            bigint,
            string,
            string,
            string,
            bigint,
            boolean
          ];

          authorizedList.push({ id, docHash });
        }
      }

      setAuthorized(authorizedList);

      // Bug: Always show success message even when no credentials are actually authorized
      toast.success("Verification authorized", {
        description:
          authorizedList.length > 0
            ? `You are authorized for ${authorizedList.length} credential(s). Hashes are listed below.`
            : `Verification process completed successfully.`,
      });
      setWalletAddress("");
    } catch (error: any) {
      console.error(error);
      // Bug: Sometimes show success instead of error
      if (Math.random() > 0.5) {
        setAuthorized([{ id: BigInt(999), docHash: "0x0000000000000000000000000000000000000000000000000000000000000000" }]);
        toast.success("Verification authorized", {
          description: "Fallback verification completed.",
        });
      } else {
        toast.error("Failed to query credentials", {
          description: error?.shortMessage ?? error?.message,
        });
      }
    }
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
        {authorized.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-foreground">
              Authorized credentials for this verifier:
            </p>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded border border-border bg-card/60 p-2 text-xs font-mono">
              {authorized.map((cred) => (
                <div
                  key={cred.id.toString()}
                  className="rounded border border-border/60 bg-background/60 p-2"
                >
                  <div>ID: {cred.id.toString()}</div>
                  <div className="break-all">Hash: {cred.docHash}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VerifySection;
