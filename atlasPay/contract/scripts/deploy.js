const hre = require("hardhat");

async function main() {
  console.log("Deploying AtlasPayEscrow to Polygon Amoy...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");

  // Deploy contract
  const AtlasPayEscrow = await hre.ethers.getContractFactory("AtlasPayEscrow");
  const escrow = await AtlasPayEscrow.deploy();

  await escrow.waitForDeployment();

  const address = await escrow.getAddress();

  console.log("\n✅ AtlasPayEscrow deployed to:", address);
  console.log("\nAdd this to your backend .env file:");
  console.log(`CONTRACT_ADDRESS=${address}`);
  console.log("\nAdd this to your frontend .env file:");
  console.log(`VITE_CONTRACT_ADDRESS=${address}`);
  console.log("\nVerify on PolygonScan:");
  console.log(`https://amoy.polygonscan.com/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
