import { test, expect } from "@playwright/test";

const firstAccount = "0x1111111111111111111111111111111111111111";
const secondAccount = "0x2222222222222222222222222222222222222222";

async function installWallet(page, options = {}) {
  await page.addInitScript(({ account, chainId, rejection, delay }) => {
    const listeners = new Map();
    window.walletMock = {
      accounts: account ? [account] : [], chainId, requests: [],
      emit(event, value) {
        if (event === "accountsChanged") this.accounts = value;
        if (event === "chainChanged") this.chainId = value;
        for (const listener of listeners.get(event) ?? []) listener(value);
      },
    };
    window.ethereum = {
      isMetaMask: true,
      on(event, listener) {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event).add(listener);
      },
      removeListener(event, listener) { listeners.get(event)?.delete(listener); },
      async request({ method }) {
        window.walletMock.requests.push(method);
        if (method === "eth_chainId") return window.walletMock.chainId;
        if (method === "eth_accounts") return window.walletMock.accounts;
        if (method === "eth_requestAccounts") {
          await new Promise((resolve) => setTimeout(resolve, delay));
          if (rejection) throw { code: 4001, message: "User rejected request" };
          window.walletMock.accounts = ["0x1111111111111111111111111111111111111111"];
          window.walletMock.emit("accountsChanged", window.walletMock.accounts);
          return window.walletMock.accounts;
        }
        throw new Error(`Unsupported method: ${method}`);
      },
    };
  }, { account: null, chainId: "0x539", rejection: false, delay: 0, ...options });
}

test("shows guidance when MetaMask is unavailable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("Chưa tìm thấy MetaMask");
  await expect(page.getByRole("button")).toHaveCount(0);
});

test("connects only on request and shows the account and chain", async ({ page }) => {
  await installWallet(page, { delay: 250 });
  await page.goto("/");
  const connect = page.getByRole("button", { name: "Kết nối MetaMask" });
  await expect(connect).toBeEnabled();
  expect(await page.evaluate(() => window.walletMock.requests.includes("eth_requestAccounts"))).toBe(false);
  await connect.click();
  await expect(page.getByRole("button", { name: "Đang chờ MetaMask…" })).toBeDisabled();
  await expect(page.getByTestId("account")).toHaveText(firstAccount);
  await expect(page.getByTestId("chain-id")).toHaveText("1337");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("restores an authorized account and reloads on wallet events", async ({ page }) => {
  await installWallet(page, { account: firstAccount });
  await page.goto("/");
  await expect(page.getByTestId("account")).toHaveText(firstAccount);
  await page.evaluate((address) => window.walletMock.emit("accountsChanged", [address]), secondAccount);
  await expect(page.getByTestId("account")).toHaveText(secondAccount);
  await page.evaluate(() => window.walletMock.emit("chainChanged", "0x1"));
  await expect(page.getByTestId("chain-id")).toHaveText("1");
  await expect(page.getByRole("alert")).toContainText("Bạn đang kết nối sai mạng");
  await page.evaluate(() => window.walletMock.emit("chainChanged", "0x539"));
  await expect(page.getByTestId("chain-id")).toHaveText("1337");
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.evaluate(() => window.walletMock.emit("accountsChanged", []));
  await expect(page.getByTestId("account")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Kết nối MetaMask" })).toBeEnabled();
});

test("shows a Vietnamese message when the connection is rejected", async ({ page }) => {
  await installWallet(page, { rejection: true });
  await page.goto("/");
  await page.getByRole("button", { name: "Kết nối MetaMask" }).click();
  await expect(page.getByRole("alert")).toHaveText("Bạn đã hủy yêu cầu kết nối trong MetaMask");
  await expect(page.getByRole("button", { name: "Kết nối MetaMask" })).toBeEnabled();
  await expect(page.getByTestId("account")).toHaveCount(0);
});

test("clears stale account details on provider disconnect", async ({ page }) => {
  await installWallet(page, { account: firstAccount });
  await page.goto("/");
  await expect(page.getByTestId("account")).toHaveText(firstAccount);
  await page.evaluate(() => window.walletMock.emit("disconnect", { code: 4900 }));
  await expect(page.getByTestId("account")).toHaveCount(0);
  await expect(page.getByRole("alert")).toContainText("MetaMask đã ngắt kết nối");
});

test("keeps the wallet card readable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await installWallet(page, { account: firstAccount });
  await page.goto("/");
  await expect(page.getByTestId("account")).toHaveText(firstAccount);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
