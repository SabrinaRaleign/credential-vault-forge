import { parseAbi } from "viem";

// Local Hardhat address (31337) - used when running against localhost
export const CREDENTIAL_VAULT_ADDRESS_LOCAL =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Sepolia testnet address - deployed via Hardhat deploy --network sepolia
export const CREDENTIAL_VAULT_ADDRESS_SEPOLIA =
  "0x45601eC310aCDb100e65FF4e3E68FC2C343F0E5F";

// Default export used by the UI.
// Switch to LOCAL for local development, or SEPOLIA for testnet.
export const CREDENTIAL_VAULT_ADDRESS = CREDENTIAL_VAULT_ADDRESS_LOCAL;

export const CREDENTIAL_VAULT_ABI = parseAbi([
  "function registerCredential(bytes32 docHash, string encryptedPayload) returns (uint256)",
  "function getOwnerCredentials(address owner) view returns (uint256[] memory)",
  "function getCredential(uint256 id) view returns (uint256,address,bytes32,string,uint64,bool)",
  "function setVerifierAuthorization(uint256 id, address verifier, bool authorized)",
  "function isVerifierAuthorized(uint256 id, address verifier) view returns (bool)",
  "function revokeCredential(uint256 id)",
  "function verifyCredential(uint256 id, bytes32 fileHash)",
  "function getVerificationRecord(uint256 id, address verifier) view returns (bool verified, bytes32 verifiedHash, uint64 verifiedAt)",
]);

