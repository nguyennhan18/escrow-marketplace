const { ethers, network } = require("hardhat");

async function main() {
  if (network.name !== "ganache") {
    throw new Error("Use --network ganache for the deployment smoke check");
  }
  const contract = await ethers.deployContract("EscrowMarketplace");
  const receipt = await contract.deploymentTransaction().wait();
  const address = await contract.getAddress();
  const code = await ethers.provider.getCode(address);
  if (receipt.status !== 1 || code === "0x") {
    throw new Error("Deployment verification failed");
  }
  const { chainId } = await ethers.provider.getNetwork();
  console.log(JSON.stringify({ network: network.name, chainId: chainId.toString(),
    address, transactionHash: receipt.hash, blockNumber: receipt.blockNumber,
    status: receipt.status, bytecodeVerified: true }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
