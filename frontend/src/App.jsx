import { useWallet } from "./hooks/useWallet.js";

const configuredChain = import.meta.env.VITE_GANACHE_CHAIN_ID || "1337";
const expectedChainId = /^\d+$/.test(configuredChain) && BigInt(configuredChain) > 0n
  ? BigInt(configuredChain).toString() : null;

export default function App() {
  const wallet = useWallet();
  const wrongNetwork = expectedChainId && wallet.chainId && wallet.chainId !== expectedChainId;

  return (
    <main>
      <header><span className="brand">Chợ đồ cũ</span><span>Thanh toán qua escrow ETH</span></header>
      <section className="intro">
        <p className="eyebrow">Mua bán an tâm hơn</p>
        <h1>Kết nối ví để bắt đầu.</h1>
        <p>Tiền được giữ trong escrow cho đến khi người mua xác nhận nhận hàng hoặc trọng tài giải quyết tranh chấp.</p>
      </section>
      <section className="wallet" aria-labelledby="wallet-title">
        <div className="card-heading"><h2 id="wallet-title">Ví của bạn</h2>
          <span className={wallet.account ? "badge connected" : "badge"}>
            {wallet.account ? "Đã kết nối" : "Chưa kết nối"}
          </span>
        </div>
        {!expectedChainId && <p role="alert">Cấu hình chain ID không hợp lệ. Hãy kiểm tra VITE_GANACHE_CHAIN_ID.</p>}
        {wallet.loading && <p role="status">Đang kiểm tra MetaMask…</p>}
        {!wallet.loading && !wallet.available && (
          <p role="alert">Chưa tìm thấy MetaMask. Hãy cài đặt hoặc bật tiện ích MetaMask rồi tải lại trang.</p>
        )}
        {wallet.account && <dl>
          <dt>Địa chỉ ví</dt><dd data-testid="account">{wallet.account}</dd>
          <dt>Chain ID hiện tại</dt><dd data-testid="chain-id">{wallet.chainId ?? "Chưa xác định"}</dd>
        </dl>}
        {!wallet.account && wallet.chainId && <p>Chain ID hiện tại: {wallet.chainId}</p>}
        {wrongNetwork && <p role="alert" className="warning">
          Bạn đang kết nối sai mạng (chain ID {wallet.chainId}). Hãy chuyển MetaMask sang Ganache, chain ID {expectedChainId}.
        </p>}
        {wallet.error && <p role="alert">{wallet.error}</p>}
        {wallet.available && !wallet.account && <button onClick={wallet.connect}
          disabled={wallet.loading || wallet.connecting || !expectedChainId}>
          {wallet.connecting ? "Đang chờ MetaMask…" : "Kết nối MetaMask"}
        </button>}
        <p className="hint">Mạng thử nghiệm: Ganache · Chain ID {expectedChainId ?? "chưa hợp lệ"}. Chỉ sử dụng ETH thử nghiệm.</p>
      </section>
      <footer>Ví giúp xác thực tài khoản và ký giao dịch của bạn.</footer>
    </main>
  );
}
