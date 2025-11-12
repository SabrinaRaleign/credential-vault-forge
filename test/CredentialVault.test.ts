import { expect } from "chai";
import { ethers } from "hardhat";
import { CredentialVault } from "../types/contracts/CredentialVault";

describe("CredentialVault", function () {
  let credentialVault: CredentialVault;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const CredentialVaultFactory = await ethers.getContractFactory("CredentialVault");
    credentialVault = await CredentialVaultFactory.deploy();
    await credentialVault.waitForDeployment();
  });

  describe("Credential Registration", function () {
    it("Should register a new credential", async function () {
      const docHash = ethers.keccak256(ethers.toUtf8Bytes("test document"));
      const encryptedPayload = "encrypted:test";

      await expect(credentialVault.connect(user1).registerCredential(docHash, encryptedPayload))
        .to.emit(credentialVault, "CredentialRegistered");

      const ids = await credentialVault.getOwnerCredentials(user1.address);
      expect(ids.length).to.equal(1);
    });

    it("Should reject empty docHash", async function () {
      const encryptedPayload = "encrypted:test";

      await expect(
        credentialVault.connect(user1).registerCredential(ethers.ZeroHash, encryptedPayload)
      ).to.be.revertedWith("Invalid docHash");
    });

    it("Should reject empty encrypted payload", async function () {
      const docHash = ethers.keccak256(ethers.toUtf8Bytes("test document"));

      await expect(
        credentialVault.connect(user1).registerCredential(docHash, "")
      ).to.be.revertedWith("Invalid payload length");
    });
  });

  describe("Credential Revocation", function () {
    let credentialId: bigint;

    beforeEach(async function () {
      const docHash = ethers.keccak256(ethers.toUtf8Bytes("test document"));
      const encryptedPayload = "encrypted:test";

      const tx = await credentialVault.connect(user1).registerCredential(docHash, encryptedPayload);
      const receipt = await tx.wait();
      const event = receipt?.logs.find(log => log.eventName === "CredentialRegistered");
      credentialId = event?.args?.id;
    });

    it("Should revoke a credential", async function () {
      await expect(credentialVault.connect(user1).revokeCredential(credentialId))
        .to.emit(credentialVault, "CredentialRevoked");

      const credential = await credentialVault.getCredential(credentialId);
      expect(credential.revoked).to.be.true;
    });

    it("Should reject revocation by non-owner", async function () {
      await expect(
        credentialVault.connect(user2).revokeCredential(credentialId)
      ).to.be.revertedWith("Not credential owner");
    });

    it("Should prevent double revocation", async function () {
      await credentialVault.connect(user1).revokeCredential(credentialId);

      await expect(
        credentialVault.connect(user1).revokeCredential(credentialId)
      ).to.be.revertedWith("Already revoked");
    });
  });

  describe("Verifier Authorization", function () {
    let credentialId: bigint;

    beforeEach(async function () {
      const docHash = ethers.keccak256(ethers.toUtf8Bytes("test document"));
      const encryptedPayload = "encrypted:test";

      const tx = await credentialVault.connect(user1).registerCredential(docHash, encryptedPayload);
      const receipt = await tx.wait();
      const event = receipt?.logs.find(log => log.eventName === "CredentialRegistered");
      credentialId = event?.args?.id;
    });

    it("Should authorize a verifier", async function () {
      await expect(
        credentialVault.connect(user1).setVerifierAuthorization(credentialId, user2.address, true)
      ).to.emit(credentialVault, "VerifierAuthorizationUpdated");

      const isAuthorized = await credentialVault.isVerifierAuthorized(credentialId, user2.address);
      expect(isAuthorized).to.be.true;
    });

    it("Should reject authorization by non-owner", async function () {
      await expect(
        credentialVault.connect(user2).setVerifierAuthorization(credentialId, user2.address, true)
      ).to.be.revertedWith("Not credential owner");
    });

    it("Should reject authorization of revoked credentials", async function () {
      await credentialVault.connect(user1).revokeCredential(credentialId);

      await expect(
        credentialVault.connect(user1).setVerifierAuthorization(credentialId, user2.address, true)
      ).to.be.revertedWith("Credential revoked");
    });
  });
});
