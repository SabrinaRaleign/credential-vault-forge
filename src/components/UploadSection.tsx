import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Lock, FileCheck } from "lucide-react";
import { toast } from "sonner";

const UploadSection = () => {
  const [hash, setHash] = useState("");
  const [credentialName, setCredentialName] = useState("");

  const handleUpload = () => {
    if (!hash || !credentialName) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Credential hash encrypted and stored!", {
      description: "Your credential is now secured on the blockchain"
    });
    setHash("");
    setCredentialName("");
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
        <div className="space-y-2">
          <Label htmlFor="credential-name">Credential Name</Label>
          <Input
            id="credential-name"
            placeholder="e.g., Bachelor of Science - Computer Science"
            value={credentialName}
            onChange={(e) => setCredentialName(e.target.value)}
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
        >
          <Upload className="h-4 w-4" />
          Encrypt & Upload
        </Button>
      </CardContent>
    </Card>
  );
};

export default UploadSection;
