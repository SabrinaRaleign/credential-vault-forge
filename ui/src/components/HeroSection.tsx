import { Shield, Lock, CheckCircle, ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";

const FeatureCard = ({ icon, title, description, variant = "default" }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant?: "default" | "gold";
}) => {
  const baseClasses = "bg-card/80 backdrop-blur border-2 rounded-lg p-6 space-y-3 transition-all duration-300 hover:scale-105";
  const variantClasses = variant === "gold"
    ? "border-gold/20 gold-shimmer"
    : "border-forest/20";

  return (
    <div className={`${baseClasses} ${variantClasses}`}>
      <div className="w-12 h-12 bg-forest/10 rounded-full flex items-center justify-center mx-auto">
        {icon}
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

const HeroSection = () => {
  return (
    <section
      className="relative py-24 px-4 overflow-hidden"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/85" />

      <div className="container mx-auto relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-bold text-primary leading-tight tracking-tight">
              Verify Credentials,<br />
              <span className="text-forest">Not Identities</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Blockchain-powered credential verification that preserves privacy.
              Students control their proofs, verifiers access only what's authorized.
            </p>
          </div>

          <div className="flex justify-center items-center gap-4 mt-8">
            <span className="text-sm font-medium text-muted-foreground">Get Started</span>
            <ArrowRight className="h-4 w-4 text-forest" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-forest" />}
              title="Encrypted Storage"
              description="Credential hashes encrypted with your wallet's private key"
            />

            <FeatureCard
              icon={<Lock className="h-6 w-6 text-gold" />}
              title="Permission-Based"
              description="Verifiers need your authorization to decrypt proofs"
              variant="gold"
            />

            <FeatureCard
              icon={<CheckCircle className="h-6 w-6 text-forest" />}
              title="Immutable Proof"
              description="Blockchain ensures credentials can't be forged or altered"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
