import { ethers } from "hardhat";

async function main() {
  console.log("Deploying CredentialVault contract...");

  // Get the contract factory
  const CredentialVault = await ethers.getContractFactory("CredentialVault");

  // Deploy the contract
  const credentialVault = await CredentialVault.deploy();

  // Wait for deployment to finish
  await credentialVault.waitForDeployment();

  const address = await credentialVault.getAddress();
  console.log("CredentialVault deployed to:", address);

  // Verify deployment by checking a basic function
  const nextId = await credentialVault.getOwnerCredentials("0x0000000000000000000000000000000000000000");
  console.log("Initial nextId check:", nextId.length === 0 ? "OK" : "ERROR");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    contract: "CredentialVault",
    address: address,
    deployer: (await ethers.getSigners())[0].address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  console.log("Deployment completed successfully!");
  console.log("Contract address:", address);
  console.log("Network:", network.name);

  return deploymentInfo;
}

// Handle different deployment scenarios
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default main;
