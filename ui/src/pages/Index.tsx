import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import UploadSection from "@/components/UploadSection";
import VerifySection from "@/components/VerifySection";
import DocumentVerificationSection from "@/components/DocumentVerificationSection";
import CredentialsDashboard from "@/components/CredentialsDashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background parchment-texture">
      <Header />
      <HeroSection />
      
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <UploadSection />
          <VerifySection />
          <DocumentVerificationSection />
        </div>
        
        <div className="mt-8 max-w-7xl mx-auto">
          <CredentialsDashboard />
        </div>
        
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-card/60 backdrop-blur border-2 border-bronze/20 rounded-lg p-8 space-y-4">
            <h3 className="text-2xl font-bold text-center text-primary">How It Works</h3>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-forest flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-forest text-primary-foreground flex items-center justify-center text-sm">1</span>
                  For Students
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-8">
                  <li>• Connect your Rainbow Wallet</li>
                  <li>• Generate SHA-256 hash of your credential</li>
                  <li>• Upload and encrypt with your private key</li>
                  <li>• Authorize verifiers as needed</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gold flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gold text-accent-foreground flex items-center justify-center text-sm">2</span>
                  For Verifiers
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-8">
                  <li>• Enter student's wallet address</li>
                  <li>• Request verification access</li>
                  <li>• Wait for student authorization</li>
                  <li>• Decrypt and verify credentials</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
