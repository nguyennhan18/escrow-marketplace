require("dotenv").config();
const ganache = require("ganache");

async function main() {
  const url = new URL(process.env.GANACHE_URL || "http://127.0.0.1:7545");
  if (!["127.0.0.1", "localhost"].includes(url.hostname)) {
    throw new Error("The local Ganache helper must bind to localhost");
  }
  const chainId = Number(process.env.GANACHE_CHAIN_ID || "1337");
  if (!Number.isSafeInteger(chainId) || chainId <= 0) {
    throw new Error("GANACHE_CHAIN_ID must be a positive safe integer");
  }
  if (!/^0x[0-9a-fA-F]{64}$/.test(process.env.GANACHE_PRIVATE_KEY || "")) {
    throw new Error("Set a local development GANACHE_PRIVATE_KEY in .env");
  }
  const server = ganache.server({
    chain: { chainId },
    wallet: { accounts: [{ secretKey: process.env.GANACHE_PRIVATE_KEY,
      balance: "0x3635c9adc5dea00000" }] },
    database: { dbPath: ".ganache" },
    logging: { quiet: true },
  });
  await server.listen(Number(url.port || 7545), url.hostname);
  console.log(`Ganache listening at ${url.origin}; chainId=${chainId}`);
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, async () => { await server.close(); process.exit(0); });
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
