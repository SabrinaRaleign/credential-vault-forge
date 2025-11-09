import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Clock, Trash2, Eye } from "lucide-react";
import { useAccount } from 'wagmi';
import { Button } from "@/components/ui/button";
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

interface Credential {
  id: string;
  name: string;
  hash: string;
  owner: string;
  timestamp: string;
  verifiers: string[];
}

const CredentialsDashboard = () => {
  const { address, isConnected } = useAccount();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      loadCredentials();
    }
  }, [isConnected, address]);

  const loadCredentials = () => {
    const allCredentials = JSON.parse(localStorage.getItem('credentials') || '{}');
    const userCredentials = Object.values(allCredentials).filter(
      (cred: any) => cred.owner.toLowerCase() === address?.toLowerCase()
    );
    setCredentials(userCredentials as Credential[]);
  };

  const handleDelete = (id: string) => {
    const allCredentials = JSON.parse(localStorage.getItem('credentials') || '{}');
    delete allCredentials[id];
    localStorage.setItem('credentials', JSON.stringify(allCredentials));
    loadCredentials();
    toast.success("Credential deleted successfully");
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
          <div className="space-y-3">
            {credentials.map((credential) => (
              <div
                key={credential.id}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      {credential.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(credential.timestamp)}
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
                            Are you sure you want to delete "{credential.name}"? This action cannot be undone.
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
        </CardContent>
      </Card>

      {/* Credential Details Dialog */}
      {selectedCredential && (
        <AlertDialog open={!!selectedCredential} onOpenChange={() => setSelectedCredential(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{selectedCredential.name}</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 pt-4">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Document Hash</p>
                    <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                      {selectedCredential.hash}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Owner Address</p>
                    <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                      {selectedCredential.owner}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Upload Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedCredential.timestamp)}
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
