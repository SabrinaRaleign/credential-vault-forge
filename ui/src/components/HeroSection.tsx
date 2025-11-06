import { Shield, Lock, CheckCircle } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";

const HeroSection = () => {
  return (
    <section 
      className="relative py-20 px-4 overflow-hidden"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95" />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-5xl md:text-6xl font-bold text-primary leading-tight">
            Verify Credentials,<br />Not Identities
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Blockchain-powered credential verification that preserves privacy. 
            Students control their proofs, verifiers access only what's authorized.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-card/80 backdrop-blur border-2 border-forest/20 rounded-lg p-6 space-y-3">
              <div className="w-12 h-12 bg-forest/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-forest" />
              </div>
              <h3 className="font-semibold text-lg">Encrypted Storage</h3>
              <p className="text-sm text-muted-foreground">
                Credential hashes encrypted with your wallet's private key
              </p>
            </div>
            
            <div className="bg-card/80 backdrop-blur border-2 border-gold/20 rounded-lg p-6 space-y-3 gold-shimmer">
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto">
                <Lock className="h-6 w-6 text-gold" />
              </div>
              <h3 className="font-semibold text-lg">Permission-Based</h3>
              <p className="text-sm text-muted-foreground">
                Verifiers need your authorization to decrypt proofs
              </p>
            </div>
            
            <div className="bg-card/80 backdrop-blur border-2 border-forest/20 rounded-lg p-6 space-y-3">
              <div className="w-12 h-12 bg-forest/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6 text-forest" />
              </div>
              <h3 className="font-semibold text-lg">Immutable Proof</h3>
              <p className="text-sm text-muted-foreground">
                Blockchain ensures credentials can't be forged or altered
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
