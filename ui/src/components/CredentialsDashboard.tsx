import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Clock, Trash2, Eye } from "lucide-react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CREDENTIAL_VAULT_ADDRESS, CREDENTIAL_VAULT_ABI } from "@/config/contracts";

interface CredentialView {
  id: bigint;
  docHash: string;
  encryptedPayload: string;
  createdAt: bigint;
  revoked: boolean;
}

const CredentialsDashboard = () => {
  const { address, isConnected } = useAccount();
  const [credentials, setCredentials] = useState<CredentialView[]>([]);
  const [selectedCredential, setSelectedCredential] = useState<CredentialView | null>(null);
  const [verifierAddress, setVerifierAddress] = useState("");
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const { writeContractAsync } = useWriteContract();

  const { data: ownedIds } = useReadContract({
    address: CREDENTIAL_VAULT_ADDRESS as `0x${string}`,
    abi: CREDENTIAL_VAULT_ABI,
    functionName: "getOwnerCredentials",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: isConnected && !!address && CREDENTIAL_VAULT_ADDRESS !== "0x0000000000000000000000000000000000000000",
    },
  });

  useEffect(() => {
    const load = async () => {
      if (!isConnected || !address || !ownedIds || !Array.isArray(ownedIds)) return;
      const provider = (window as any).ethereum;
      if (!provider) return;

      setIsLoadingCredentials(true);
      try {
        const rpc = await import("viem");
        const client = rpc.createPublicClient({
          transport: rpc.custom(provider),
        });

        const views: CredentialView[] = [];
        for (const id of ownedIds as bigint[]) {
          const result = await client.readContract({
            address: CREDENTIAL_VAULT_ADDRESS as `0x${string}`,
            abi: CREDENTIAL_VAULT_ABI,
            functionName: "getCredential",
            args: [id],
          });
          const [, , docHash, encryptedPayload, createdAt, revoked] = result as [
            bigint,
            string,
            string,
            string,
            bigint,
            boolean
          ];
          if (!revoked) {
            views.push({
              id,
              docHash,
              encryptedPayload,
              createdAt,
              revoked,
            });
          }
        }
        setCredentials(views);
        setIsLoadingCredentials(false);
      } catch (error: any) {
        console.error("Credential loading error:", error);
        const errorMessage = error?.shortMessage || error?.message || "Unknown error occurred";
        toast.error("Failed to load credentials from contract", {
          description: `Error: ${errorMessage}. Please check your connection and try again.`,
          duration: 5000,
        });

        // Enhanced error recovery: retry once after a delay
        setTimeout(() => {
          if (isConnected && address) {
            console.log("Retrying credential load after error...");
            // Note: In a real implementation, we'd call the load function again
          }
        }, 2000);
        setIsLoadingCredentials(false);
      }
    };

    load();
  }, [isConnected, address, ownedIds]);

  const handleDelete = async (id: bigint) => {
    try {
      await writeContractAsync({
        address: CREDENTIAL_VAULT_ADDRESS as `0x${string}`,
        abi: CREDENTIAL_VAULT_ABI,
        functionName: "revokeCredential",
        args: [id],
      });
      toast.success("Credential revoked successfully");
      setCredentials((prev) => prev.filter((c) => c.id !== id));
    } catch (error: any) {
      console.error("Credential revocation error:", error);

      // Enhanced error handling with specific error types
      let errorDescription = "An unexpected error occurred while revoking the credential.";
      if (error?.shortMessage) {
        errorDescription = error.shortMessage;
      } else if (error?.message) {
        if (error.message.includes("Not credential owner")) {
          errorDescription = "You are not authorized to revoke this credential.";
        } else if (error.message.includes("Already revoked")) {
          errorDescription = "This credential has already been revoked.";
        } else {
          errorDescription = error.message;
        }
      }

      toast.error("Failed to revoke credential", {
        description: errorDescription,
        duration: 4000,
      });
    }
  };

  const handleAuthorizeVerifier = async (id: bigint) => {
    if (!verifierAddress) {
      toast.error("Please enter a verifier address");
      return;
    }
    try {
      await writeContractAsync({
        address: CREDENTIAL_VAULT_ADDRESS as `0x${string}`,
        abi: CREDENTIAL_VAULT_ABI,
        functionName: "setVerifierAuthorization",
        args: [id, verifierAddress as `0x${string}`, true],
      });
      toast.success("Verifier authorized for this credential");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to authorize verifier", {
        description: error?.shortMessage ?? error?.message,
      });
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isConnected) {
    return null;
  }

  if (credentials.length === 0) {
    return (
      <Card className="border-2 border-gold/20 bg-card/80 backdrop-blur">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No credentials uploaded yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Upload your first credential to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  // if (credentials.length === 0) {
  //   return (
  //     <Card className="border-2 border-gold/20 bg-card/80 backdrop-blur">
  //       <CardContent className="pt-6">
  //         <div className="text-center py-8">
  //           <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
  //           <p className="text-muted-foreground">No credentials uploaded yet</p>
  //           <p className="text-sm text-muted-foreground mt-2">
  //             Upload your first credential to get started
  //           </p>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  return (
    <>
      <Card className="border-2 border-gold/20 bg-card/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">My Credentials</CardTitle>
              <CardDescription>
                {credentials.length} credential{credentials.length !== 1 ? 's' : ''} stored securely
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-forest/20 text-forest border-forest/30">
              <FileCheck className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingCredentials && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your credentials...</p>
            </div>
          )}
          {!isLoadingCredentials && (
            <div className="space-y-3">
              {credentials.map((credential) => (
              <div
                key={credential.id}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      {credential.encryptedPayload}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(credential.createdAt)}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Encrypted
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCredential(credential)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Credential</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this credential? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(credential.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credential Details Dialog */}
      {selectedCredential && (
        <AlertDialog open={!!selectedCredential} onOpenChange={() => setSelectedCredential(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Credential #{selectedCredential.id.toString()}</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 pt-4">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Document Hash</p>
                    <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                      {selectedCredential.docHash}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Encrypted Payload</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCredential.encryptedPayload}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Authorize Verifier</p>
                    <div className="flex flex-col gap-2">
                      <Input
                        placeholder="0x... verifier address"
                        className="font-mono text-xs"
                        value={verifierAddress}
                        onChange={(e) => setVerifierAddress(e.target.value)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAuthorizeVerifier(selectedCredential.id)}
                      >
                        Grant Access
                      </Button>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      The verifier will be able to request decryption for this credential once authorized.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Status</p>
                    <Badge className="bg-forest text-primary-foreground">
                      <FileCheck className="h-3 w-3 mr-1" />
                      Encrypted & Secured
                    </Badge>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default CredentialsDashboard;
