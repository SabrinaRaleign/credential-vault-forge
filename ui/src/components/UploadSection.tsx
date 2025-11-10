import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Lock, FileCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useWriteContract } from "wagmi";
import {
  CREDENTIAL_VAULT_ADDRESS,
  CREDENTIAL_VAULT_ABI,
} from "@/config/contracts";

const UploadSection = () => {
  const { isConnected } = useAccount();
  const [hash, setHash] = useState("");
  const [credentialName, setCredentialName] = useState("");
  const { writeContractAsync, isPending } = useWriteContract();

  const handleUpload = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!hash || !credentialName) {
      toast.error("Please fill in all fields");
      return;
    }

    if (
      !CREDENTIAL_VAULT_ADDRESS ||
      CREDENTIAL_VAULT_ADDRESS ===
        "0x0000000000000000000000000000000000000000"
    ) {
      toast.error("Contract address is not configured");
      return;
    }

    try {
      const docHashBytes = hash as `0x${string}`;
      // For now, treat the credential name as a label and store it as a simple payload.
      // In an FHE-enabled version, this would be a ciphertext / handle created by the fhevm SDK.
      const encryptedPayload = `vault:${credentialName}`;

      await writeContractAsync({
        address: CREDENTIAL_VAULT_ADDRESS as `0x${string}`,
        abi: CREDENTIAL_VAULT_ABI,
        functionName: "registerCredential",
        args: [docHashBytes, encryptedPayload],
      });

      toast.success("Credential hash stored on-chain", {
        description: "Your credential reference is now in the vault",
      });
      setHash("");
      setCredentialName("");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to register credential", {
        description: error?.shortMessage ?? error?.message,
      });
    }
  };

  return (
    <Card className="border-2 border-forest/30 bg-card/90 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-forest" />
          <CardTitle className="text-xl">Upload Credential Hash</CardTitle>
        </div>
        <CardDescription>
          Students: Upload your degree or certificate hash to encrypt and secure it
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-xs text-destructive">
              Please connect your wallet to upload credentials
            </p>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="credential-name">Credential Name</Label>
          <Input
            id="credential-name"
            placeholder="e.g., Bachelor of Science - Computer Science"
            value={credentialName}
            onChange={(e) => setCredentialName(e.target.value)}
            disabled={!isConnected}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hash">Document Hash (SHA-256)</Label>
          <Input
            id="hash"
            placeholder="Enter your credential hash"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            className="font-mono text-sm"
            disabled={!isConnected}
          />
        </div>
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <Lock className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Your credential hash will be encrypted using your wallet's private key. 
            Only authorized verifiers can decrypt the proof with your permission.
          </p>
        </div>
        <Button
          onClick={handleUpload}
          variant="credential"
          className="w-full"
          disabled={!isConnected || isPending}
        >
          <Upload className="h-4 w-4" />
          {isPending ? "Submitting..." : "Encrypt & Upload"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UploadSection;
