## Credential Vault Chain

End-to-end MVP of an **encrypted credential vault with on-chain proofs**, designed to be FHE‑ready.

- Students upload **credential hashes** and encrypted payloads to a `CredentialVault` contract.
- The contract stores only hashes and opaque ciphertext/pointers, plus **on-chain authorization** for verifiers.
- The frontend provides a complete flow for **local Hardhat** and **Sepolia testnet** testing, matching the current business design.

The UI is based on the `credential-vault-forge` project and uses Vite, React, RainbowKit, wagmi and shadcn‑ui.

---

### Live Demo & Video

- **Vercel demo**: [`credential-vault-chain.vercel.app`](https://credential-vault-chain.vercel.app/)
- **Walkthrough video**: `credential-vault-chain.mp4` (in this repository root)

---

### Contract Overview

#### `contracts/CredentialVault.sol`

This is the core contract implementing the credential vault.

- **Data model**
  - `struct Credential`:
    - `uint256 id` – incremental identifier.
    - `address owner` – student wallet address.
    - `bytes32 docHash` – SHA‑256 hash of the original document.
    - `string encryptedPayload` – opaque ciphertext / pointer (FHE handle, encrypted CID, etc.).
    - `uint64 createdAt` – block timestamp at registration.
    - `bool revoked` – logical delete flag.
  - Mappings:
    - `mapping(uint256 => Credential) _credentials` – id → credential.
    - `mapping(address => uint256[]) _ownerCredentials` – owner → ids they own.
    - `mapping(uint256 => mapping(address => bool)) _authorizations` – credential → verifier → authorized.

- **Key functions**
  - `registerCredential(bytes32 docHash, string encryptedPayload) returns (uint256 id)`
    - Registers a new credential for `msg.sender`.
    - Validates `docHash != 0` and non‑empty `encryptedPayload`.
    - Stores and returns a new `id`.
  - `getCredential(uint256 id)`
    - View accessor returning full `Credential` fields.
  - `getOwnerCredentials(address owner)`
    - Returns the list of credential ids owned by `owner`.
  - `revokeCredential(uint256 id)`
    - Marks a credential as revoked; only the `owner` can call this.
  - `setVerifierAuthorization(uint256 id, address verifier, bool authorized)`
    - Owner‑only; toggles `verifier`'s access for a specific credential.
  - `isVerifierAuthorized(uint256 id, address verifier) view`
    - Returns `true` if the credential exists and either:
      - `verifier == owner`, or
      - `_authorizations[id][verifier] == true` and not revoked.

This on-chain API is intentionally minimal: it tracks **hashes, encrypted handles and authorization state**, while leaving the actual encryption/decryption to the FHE layer or off-chain services.

---

### Frontend Overview

Frontend code lives in `ui/`. It is a Vite + React app with RainbowKit and wagmi for wallet and network management.

#### Pages & Components

- `ui/src/pages/Index.tsx`
  - Renders the main landing page:
    - `Header` with RainbowKit connect button (top-right).
    - `HeroSection` with product description.
    - Three main panels:
      - `UploadSection` – student uploads credential hash.
      - `VerifySection` – verifier checks authorization and sees hashes.
      - `CredentialsDashboard` – student sees and manages their credentials.

- `ui/src/config/contracts.ts`
  - Defines contract addresses and ABI:
    - `CREDENTIAL_VAULT_ADDRESS_LOCAL` – Hardhat localhost address (31337).
    - `CREDENTIAL_VAULT_ADDRESS_SEPOLIA` – Sepolia testnet address.
    - `CREDENTIAL_VAULT_ADDRESS` – the currently active address used by the UI.
  - ABI is built via `parseAbi([...])` for use with viem/wagmi.

#### Key UI flows

1. **Upload Credential Hash (Student)**
   - Component: `ui/src/components/UploadSection.tsx`.
   - Inputs:
     - `Credential Name` – e.g., “Bachelor of Science – CS”.
     - `Document Hash (SHA‑256)` – e.g., `0x` + 64‑hex SHA‑256 value.
   - On **Encrypt & Upload**:
     - Validates wallet connection and fields.
     - Uses wagmi `useWriteContract` to call:
       ```ts
       registerCredential(docHash, encryptedPayload);
       ```
     - **Current MVP**:
       - `docHash` – user‑entered SHA‑256 hash.
       - `encryptedPayload` – simple label `vault:<credentialName>` (placeholder for real ciphertext).
     - **FHE‑ready design**:
       - In a real deployment, `encryptedPayload` will be:
         - A ciphertext produced by an FHE client, or
         - An encrypted pointer (e.g. IPFS CID) secured via FHE.

2. **My Credentials (Student Dashboard)**
   - Component: `ui/src/components/CredentialsDashboard.tsx`.
   - On load (when connected):
     - Calls `getOwnerCredentials(address)` to get ids.
     - For each `id`, calls `getCredential(id)` via viem.
     - Filters out revoked credentials.
   - Displays for each credential:
     - `encryptedPayload` as title (for now).
     - `createdAt` formatted date.
     - Status badge “Encrypted”.
   - Actions:
     - **View details**:
       - Shows `docHash`, `encryptedPayload` and status.
     - **Revoke** (Delete):
       - Calls `revokeCredential(id)`; removes entry from UI.
     - **Authorize Verifier**:
       - In the details dialog, student can:
         - Enter a verifier wallet address (`0x...`).
         - Click **Grant Access**, which calls:
           ```ts
           setVerifierAuthorization(id, verifier, true);
           ```
       - This writes to `_authorizations` on-chain, giving that verifier permission to access this credential.

3. **Verify Credentials (Verifier)**
   - Component: `ui/src/components/VerifySection.tsx`.
   - Inputs:
     - `Student Wallet Address` – address of the student to verify.
   - On **Request Verification**:
     - Uses wagmi `useReadContract` to call `getOwnerCredentials(student)`.
     - For each credential `id`:
       - Calls `isVerifierAuthorized(id, verifier)`.
       - If `true`, calls `getCredential(id)` to fetch `docHash`.
     - The panel shows a list of **authorized credentials for the connected verifier**:
       - `ID: <id>`
       - `Hash: <docHash>`.
   - This is the natural hook point for FHE:
     - Once a verifier sees which credentials they are authorized for, they can:
       - Use `encryptedPayload` + FHE client/oracle to decrypt the underlying proof.
       - Check that the decrypted document or proof has SHA‑256 hash matching `docHash` from the contract.

> Note: The current frontend does **not** perform actual cryptographic decryption; it enforces the authorization logic and exposes the data needed for an external FHE client/service to do the decryption.

---

### Contract Addresses

- **Local Hardhat (chainId 31337)**  
  `CredentialVault` @ `0x5FbDB2315678afecb367f032d93F642f64180aa3`

- **Sepolia testnet (chainId 11155111)**  
  `CredentialVault` @ `0x45601eC310aCDb100e65FF4e3E68FC2C343F0E5F`

The UI takes these from `ui/src/config/contracts.ts`:

- `CREDENTIAL_VAULT_ADDRESS_LOCAL`
- `CREDENTIAL_VAULT_ADDRESS_SEPOLIA`
- `CREDENTIAL_VAULT_ADDRESS` – whichever one the UI should use (local vs testnet).

The Vercel deployment [`credential-vault-chain.vercel.app`](https://credential-vault-chain.vercel.app/) uses the same configuration and can be pointed at either network by changing `CREDENTIAL_VAULT_ADDRESS`.

---

### Running Locally (Hardhat + Vite)

#### 1. Contracts (Hardhat)

```bash
cd D:\GitRoom\project\credential-vault-chain
npm install

# Compile and run contract tests
npx hardhat compile
npx hardhat test --grep CredentialVault

# Start local node (keeps running)
npx hardhat node

# In a separate terminal, deploy to localhost
npx hardhat deploy --network localhost
```

`deploy/deploy.ts` will deploy `CredentialVault` and the local address will match `CREDENTIAL_VAULT_ADDRESS_LOCAL`.

#### 2. Frontend (Vite + React)

```bash
cd D:\GitRoom\project\credential-vault-chain\ui
npm install
npm run dev
```

Then open the URL printed by Vite (usually `http://localhost:5173/`).

To use the local Hardhat network:

- In `ui/src/config/contracts.ts`, set:
  ```ts
  export const CREDENTIAL_VAULT_ADDRESS = CREDENTIAL_VAULT_ADDRESS_LOCAL;
  ```
- In MetaMask:
  - Add network with RPC `http://127.0.0.1:8545`, chainId `31337`.
  - Import one of the private keys printed by `npx hardhat node`.

---

### Deploying & Testing on Sepolia

#### 1. Deploy the contract

Configure your environment (do **not** commit secrets):

```bash
cd D:\GitRoom\project\credential-vault-chain

# Example (PowerShell):
$env:PRIVATE_KEY="0x<your_private_key>"
$env:INFURA_API_KEY="<your_infura_project_id>"

npx hardhat compile
npx hardhat deploy --network sepolia
```

`hardhat.config.ts` reads `PRIVATE_KEY` and `INFURA_API_KEY` from the environment (or Hardhat vars). Secrets never live in the repo.

#### 2. Point the frontend at Sepolia

Edit `ui/src/config/contracts.ts`:

```ts
export const CREDENTIAL_VAULT_ADDRESS = CREDENTIAL_VAULT_ADDRESS_SEPOLIA;
```

Then start the UI:

```bash
cd D:\GitRoom\project\credential-vault-chain\ui
npm run dev
```

Connect a wallet with Sepolia test ETH, select the **Sepolia** network in RainbowKit, and walk through the full flow (upload → authorize → verify) against the live testnet contract.

---

### FHE Integration Notes

This MVP is structured so that adding FHE requires **minimal changes** to the Solidity layer:

- Keep `docHash` and `encryptedPayload` as they are, but:
  - Replace the placeholder `encryptedPayload` with a real ciphertext / FHE handle.
  - Use FHE client/oracle code to encrypt/decrypt off-chain.
- Use `setVerifierAuthorization` as the **chain of record** for who is allowed to see decrypted proofs:
  - FHE services should consult this mapping (or events) before serving decryption results.
- The **Verify Credentials** panel already exposes:
  - `credentialId` and `docHash` for which the verifier is authorized.
  - This is the ideal hook to plug in FHE client calls and show decrypted results in the UI while respecting on-chain authorization.

In other words:

- **Solidity**: hashes, encrypted pointers, authorization.
- **FHE layer**: encryption/decryption, privacy guarantees.
- **Frontend**: student/verifier flows and network wiring (local / Sepolia / Vercel).


