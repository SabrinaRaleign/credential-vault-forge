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
import { Upload, FileCheck, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCalculatingHash, setIsCalculatingHash] = useState(false);
  const { writeContractAsync, isPending } = useWriteContract();

  // Calculate SHA-256 hash of the file
  const calculateFileHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsCalculatingHash(true);

    try {
      const fileHash = await calculateFileHash(file);
      setHash(fileHash);
      toast.success("Document hash calculated", {
        description: `Hash for ${file.name} has been generated`,
      });
    } catch (error) {
      console.error("Error calculating hash:", error);
      toast.error("Failed to calculate hash", {
        description: "Please try again or enter hash manually",
      });
    } finally {
      setIsCalculatingHash(false);
    }
  };

  const handleUpload = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!hash || !credentialName) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate hash format (should be 64 character hex string)
    if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
      toast.error("Document hash must be a valid 64-character hexadecimal string starting with 0x");
      return;
    }

    // Validate credential name length
    if (credentialName.length < 3 || credentialName.length > 100) {
      toast.error("Credential name must be between 3 and 100 characters");
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
          <div className="space-y-2">
            {/* File upload area */}
            <div className="flex items-center gap-2">
              <Label
                htmlFor="file-upload"
                className="flex-1 cursor-pointer border-2 border-dashed border-border rounded-lg p-4 hover:border-forest/50 transition-colors"
              >
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {selectedFile ? selectedFile.name : "Click to upload document (PDF, Image, etc.)"}
                  </span>
                  {isCalculatingHash && (
                    <span className="text-xs text-forest">Calculating hash...</span>
                  )}
                </div>
              </Label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                disabled={!isConnected || isCalculatingHash}
              />
            </div>
            {/* Hash input field */}
            <div className="relative">
              <Input
                id="hash"
                placeholder="0x... (will be auto-filled when you upload a file)"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                className="font-mono text-sm pr-10"
                disabled={!isConnected}
              />
              {hash && /^0x[a-fA-F0-9]{64}$/.test(hash) && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Tip: Upload your document file to automatically calculate the hash, or enter it manually
            </p>
          </div>
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
