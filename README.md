# Supply Chain Tracker DApp (Hardhat + Next.js 14 + Ethers )

## 1. Mục tiêu
- Minh bạch vòng đời sản phẩm (Manufactured → Shipped → InTransit → Delivered → Received).
- Chống giả mạo, truy xuất lịch sử, phân quyền theo vai trò.

## 2. Kiến trúc
- Smart Contract: Solidity 0.8.20, OpenZeppelin Ownable, Events, Access Control.
- Frontend: Next.js 14 (App Router, TailwindCSS), Ethers.js v6, MetaMask.
- Deploy: Local (Hardhat) + Testnet (Sepolia).

## 3. Tính năng
- Tạo sản phẩm, cập nhật trạng thái, chuyển quyền sở hữu.
- Lịch sử sự kiện on-chain, Verify + QR link.
- Phân quyền địa chỉ (admin/authorized).
- Trang chi tiết sản phẩm, bộ lọc theo trạng thái & từ khoá.

## 4. Chạy Local
```bash
# Blockchain
cd blockchain
npx hardhat node --host 0.0.0.0
npx hardhat run scripts/deploy.js --network localhost

# Frontend
cp blockchain/frontend-artifacts/contract.json frontend/src/app/contract.json
cd frontend
npm run dev
```
- MetaMask (Incognito): Add network RPC `http://<SERVER_IP>:8545` (chainId `31337`), import private key Hardhat account #0.

## 5. Test
```bash
cd blockchain
npx hardhat test
```

## 6. Deploy Sepolia
```bash
# blockchain/.env
SEPOLIA_URL=...
PRIVATE_KEY=0x...

cd blockchain
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat verify --network sepolia <contract_address>
```
- Cập nhật `frontend/src/app/contract.json`, rồi:
```bash
cd frontend
npm run build
npm run start
```

## 7. Ảnh & Demo
- Ảnh UI (Create/List/Verify/Detail).
- Video demo (Create → Update → Transfer → Verify; optional: trên Sepolia).

## 8. Hướng mở rộng
- IPFS cho hoá đơn/chứng từ (hash on-chain).
- Role-based AccessControl (MANUFACTURER/DISTRIBUTOR/RETAILER).
- Indexing bằng The Graph.
- Batch operations, pagination, notifications.
