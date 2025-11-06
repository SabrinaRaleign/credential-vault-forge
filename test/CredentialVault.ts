import { expect } from "chai";
import { ethers } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type {
  CredentialVault,
  CredentialVault__factory,
} from "../types";

type Signers = {
  owner: HardhatEthersSigner;
  verifier: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory(
    "CredentialVault",
  )) as CredentialVault__factory;
  const contract = (await factory.deploy()) as CredentialVault;
  const address = await contract.getAddress();
  return { contract, address };
}

describe("CredentialVault (local)", () => {
  let signers: Signers;
  let vault: CredentialVault;

  before(async () => {
    const all = await ethers.getSigners();
    signers = { owner: all[0], verifier: all[1] };
  });

  beforeEach(async () => {
    ({ contract: vault } = await deployFixture());
  });

  it("registers and reads a credential", async () => {
    const docHash =
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const encryptedPayload = "ciphertext://dummy";

    const tx = await vault
      .connect(signers.owner)
      .registerCredential(docHash as any, encryptedPayload);
    await tx.wait();

    const id = 1n;

    const [
      credentialId,
      owner,
      storedHash,
      storedPayload,
      createdAt,
      revoked,
    ] = await vault.getCredential(id);

    expect(credentialId).to.equal(id);
    expect(owner).to.equal(await signers.owner.getAddress());
    expect(storedHash).to.equal(docHash);
    expect(storedPayload).to.equal(encryptedPayload);
    expect(createdAt).to.be.gt(0);
    expect(revoked).to.equal(false);

    const ownerIds = await vault.getOwnerCredentials(
      await signers.owner.getAddress(),
    );
    expect(ownerIds).to.deep.equal([id]);
  });

  it("handles authorization for a verifier", async () => {
    const docHash =
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    const encryptedPayload = "ciphertext://dummy2";

    await vault
      .connect(signers.owner)
      .registerCredential(docHash as any, encryptedPayload);
    const id = 1n;

    const verifierAddress = await signers.verifier.getAddress();

    expect(await vault.isVerifierAuthorized(id, verifierAddress)).to.equal(
      false,
    );

    await vault
      .connect(signers.owner)
      .setVerifierAuthorization(id, verifierAddress, true);
    expect(await vault.isVerifierAuthorized(id, verifierAddress)).to.equal(
      true,
    );

    await vault
      .connect(signers.owner)
      .setVerifierAuthorization(id, verifierAddress, false);
    expect(await vault.isVerifierAuthorized(id, verifierAddress)).to.equal(
      false,
    );
  });

  it("allows owner to revoke a credential", async () => {
    const docHash =
      "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";
    const encryptedPayload = "ciphertext://dummy3";

    await vault
      .connect(signers.owner)
      .registerCredential(docHash as any, encryptedPayload);
    const id = 1n;

    await vault.connect(signers.owner).revokeCredential(id);

    const [, , , , , revoked] = await vault.getCredential(id);
    expect(revoked).to.equal(true);
  });
});


