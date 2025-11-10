import logo from "@/assets/logo.png";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Credential Vault" className="h-10 w-10" />
            <div>
              <h1 className="text-2xl font-bold text-primary">Credential Vault</h1>
              <p className="text-xs text-muted-foreground">
                Encrypted credentials with on-chain proofs
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
