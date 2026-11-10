import { BrowserProvider, getAddress } from "ethers";

export function findMetaMask() {
  const injected = window.ethereum;
  return injected?.providers?.find((provider) => provider.isMetaMask)
    ?? (injected?.isMetaMask ? injected : null);
}

export function createWalletClient(ethereum) {
  const provider = new BrowserProvider(ethereum, "any");
  return {
    async read() {
      const [accounts, chainId] = await Promise.all([
        provider.send("eth_accounts", []),
        provider.send("eth_chainId", []),
      ]);
      return {
        account: accounts.length ? getAddress(accounts[0]) : null,
        chainId: BigInt(chainId).toString(),
      };
    },
    async connect() {
      await provider.send("eth_requestAccounts", []);
    },
    destroy() { provider.destroy(); },
  };
}

export function walletErrorMessage(error) {
  if (error.code === 4001 || error.code === "ACTION_REJECTED"
      || error.info?.error?.code === 4001) {
    return "Bạn đã hủy yêu cầu kết nối trong MetaMask";
  }
  if (error.code === -32002 || error.info?.error?.code === -32002) {
    return "Một yêu cầu đang chờ trong MetaMask. Hãy mở ví để tiếp tục.";
  }
  return "Không thể đọc ví. Hãy kiểm tra MetaMask và thử lại.";
}
