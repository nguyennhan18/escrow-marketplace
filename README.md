# Chợ Đồ Cũ Phi Tập Trung với Hợp Đồng Ký Quỹ (Escrow Marketplace)

Ứng dụng phi tập trung (dApp) mua bán đồ cũ sử dụng hợp đồng thông minh ký quỹ (ETH Escrow) trên mạng Ethereum cục bộ (Ganache). Tiền thanh toán của người mua được khóa an toàn trong `EscrowMarketplace` cho đến khi người mua xác nhận đã nhận hàng hoặc trọng tài (`arbiter`) phân xử tranh chấp.

## Công nghệ sử dụng

- **Smart Contract**: Solidity `0.8.24` (Optimizer `runs = 200`), Hardhat
- **Mạng Blockchain**: Ganache (`localhost:7545`, `chainId = 1337`)
- **Frontend**: React 19, Vite, `ethers.js` v6, MetaMask

## Cấu trúc thư mục

- `contracts/` — Mã nguồn hợp đồng thông minh `EscrowMarketplace.sol`
- `scripts/` — Script khởi chạy Ganache, triển khai hợp đồng và đo gas
- `test/` — Bộ kiểm thử tự động Hardhat (`TC01`–`TC21`)
- `frontend/` — Giao diện người dùng React + Vite kết nối ví MetaMask

## Cài đặt và Chạy dự án

1. **Cài đặt thư viện:**
   ```bash
   npm install
   npm --prefix frontend install
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   ```

2. **Biên dịch và chạy kiểm thử hợp đồng:**
   ```bash
   npm run compile
   npm test
   ```

3. **Khởi chạy mạng Ganache và triển khai hợp đồng:**
   ```bash
   npm run ganache
   npm run deploy:ganache
   ```

4. **Khởi chạy giao diện Frontend:**
   ```bash
   npm run dev
   ```
