import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileCheck, FileText, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useReadContract } from "wagmi";
import { CREDENTIAL_VAULT_ADDRESS, CREDENTIAL_VAULT_ABI } from "@/config/contracts";

type AuthorizedCredential = {
  id: bigint;
  docHash: string;
};

const DocumentVerificationSection = () => {
  const { address: verifierAddress, isConnected } = useAccount();
  const [walletAddress, setWalletAddress] = useState("");
  const [authorized, setAuthorized] = useState<AuthorizedCredential[]>([]);
  const [verificationFiles, setVerificationFiles] = useState<Map<bigint, File>>(new Map());
  const [verificationResults, setVerificationResults] = useState<Map<bigint, boolean>>(new Map());
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: ownerIds, refetch } = useReadContract({
    address: CREDENTIAL_VAULT_ADDRESS as `0x${string}`,
    abi: CREDENTIAL_VAULT_ABI,
    functionName: "getOwnerCredentials",
    args: walletAddress && walletAddress.startsWith("0x") ? [walletAddress as `0x${string}`] : undefined,
    query: {
      enabled: false,
    },
  });

  // Calculate SHA-256 hash of the file
  const calculateFileHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  };

  // Query authorized credentials
  const handleQueryCredentials = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!verifierAddress) {
      toast.error("Unable to detect verifier address");
      return;
    }
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
        toast.error("No Ethereum provider found");
        return;
      }

      const rpc = await import("viem");
      const client = rpc.createPublicClient({
        transport: rpc.custom(provider),
      });

      const authorizedList: AuthorizedCredential[] = [];

      for (const id of ids) {
        const isAuth = await client.readContract({
          address: CREDENTIAL_VAULT_ADDRESS as `0x${string}`,
          abi: CREDENTIAL_VAULT_ABI,
          functionName: "isVerifierAuthorized",
          args: [id, verifierAddress as `0x${string}`],
        });

        if (isAuth) {
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

      toast.success("Credentials loaded", {
        description:
          authorizedList.length > 0
            ? `Found ${authorizedList.length} authorized credential(s)`
            : `No authorized credentials found for this verifier.`,
      });
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to query credentials", {
        description: error?.shortMessage ?? error?.message,
      });
    }
  };

  // Verify document hash
  const handleVerifyDocument = async (credentialId: bigint, expectedHash: string) => {
    const file = verificationFiles.get(credentialId);
    if (!file) {
      toast.error("Please select a document file first");
      return;
    }

    setIsVerifying(true);
    try {
      const fileHash = await calculateFileHash(file);
      const matches = fileHash.toLowerCase() === expectedHash.toLowerCase();
      
      setVerificationResults(prev => {
        const newMap = new Map(prev);
        newMap.set(credentialId, matches);
        return newMap;
      });

      if (matches) {
        toast.success("Document verified!", {
          description: "The document hash matches the on-chain record. Document is authentic.",
        });
      } else {
        toast.error("Document verification failed", {
          description: "The document hash does not match. This may not be the original document.",
        });
      }
    } catch (error) {
      console.error("Error verifying document:", error);
      toast.error("Failed to verify document", {
        description: "Please try again",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (credentialId: bigint, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVerificationFiles(prev => {
        const newMap = new Map(prev);
        newMap.set(credentialId, file);
        return newMap;
      });
      // Clear previous verification result
      setVerificationResults(prev => {
        const newMap = new Map(prev);
        newMap.delete(credentialId);
        return newMap;
      });
    }
  };

  return (
    <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-xl">Verify Document Hash</CardTitle>
        </div>
        <CardDescription>
          Verifiers: Verify document authenticity by comparing hash with on-chain record
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-xs text-destructive">
              Please connect your wallet to verify documents
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="verify-wallet-address">Student Wallet Address</Label>
          <div className="flex gap-2">
            <Input
              id="verify-wallet-address"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="font-mono text-sm"
              disabled={!isConnected}
            />
            <Button
              onClick={handleQueryCredentials}
              variant="outline"
              size="sm"
              disabled={!isConnected || !walletAddress}
            >
              Query
            </Button>
          </div>
        </div>

        {authorized.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              Authorized Credentials ({authorized.length})
            </p>
            <div className="max-h-96 space-y-3 overflow-y-auto rounded border border-border bg-card/60 p-3">
              {authorized.map((cred) => {
                const verificationFile = verificationFiles.get(cred.id);
                const verificationResult = verificationResults.get(cred.id);
                return (
                  <div
                    key={cred.id.toString()}
                    className="rounded border border-border/60 bg-background/60 p-3 space-y-2"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-sm">Credential ID: {cred.id.toString()}</div>
                      <div className="text-xs font-mono break-all text-muted-foreground">
                        Hash: {cred.docHash}
                      </div>
                    </div>
                    
                    {/* Document verification area */}
                    <div className="pt-2 border-t border-border/40 space-y-2">
                      <Label className="text-xs font-medium">Upload Document to Verify</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`verify-file-${cred.id}`}
                            className="flex-1 cursor-pointer border border-border rounded p-2 hover:border-blue-500/50 transition-colors text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {verificationFile ? verificationFile.name : "Select document to verify"}
                              </span>
                            </div>
                          </Label>
                          <input
                            id={`verify-file-${cred.id}`}
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileSelect(cred.id, e)}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          />
                        </div>
                        
                        {verificationFile && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleVerifyDocument(cred.id, cred.docHash)}
                            disabled={isVerifying}
                          >
                            {isVerifying ? (
                              <>Verifying...</>
                            ) : (
                              <>
                                <FileCheck className="h-3 w-3 mr-2" />
                                Verify Document Hash
                              </>
                            )}
                          </Button>
                        )}

                        {/* Verification result */}
                        {verificationResult !== undefined && (
                          <div className={`flex items-center gap-2 p-2 rounded text-xs ${
                            verificationResult 
                              ? "bg-green-500/10 border border-green-500/20 text-green-600" 
                              : "bg-red-500/10 border border-red-500/20 text-red-600"
                          }`}>
                            {verificationResult ? (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Document hash matches! Document is authentic.</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4" />
                                <span>Document hash does not match. This may not be the original document.</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {authorized.length === 0 && isConnected && walletAddress && (
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              No authorized credentials found. Click "Query" to check for authorized credentials.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentVerificationSection;

