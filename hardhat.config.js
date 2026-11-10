require("dotenv").config();
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

const ganacheChainId = Number(process.env.GANACHE_CHAIN_ID || "1337");
if (!Number.isSafeInteger(ganacheChainId) || ganacheChainId <= 0) {
  throw new Error("GANACHE_CHAIN_ID must be a positive safe integer");
}

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    ganache: {
      url: process.env.GANACHE_URL || "http://127.0.0.1:7545",
      chainId: ganacheChainId,
      accounts: process.env.GANACHE_PRIVATE_KEY
        ? [process.env.GANACHE_PRIVATE_KEY]
        : [],
    },
  },
};
