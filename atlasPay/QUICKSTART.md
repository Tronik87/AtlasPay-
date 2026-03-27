# AtlasPay Quick Start Guide

## 🚀 5-Minute Setup

### 1. Get Test MATIC (1 min)
Visit: https://faucet.polygon.technology/
- Select "Polygon Amoy"
- Enter your wallet address
- Get free test MATIC

### 2. Deploy Contract (2 min)
```bash
cd contract
npm install
cp .env.example .env
# Edit .env with your private key
npx hardhat compile
npx hardhat run scripts/deploy.js --network amoy
# Copy the contract address shown
```

### 3. Start Backend (1 min)
```bash
cd ../backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env: add private key and contract address
python main.py
```

### 4. Start Frontend (1 min)
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env: add contract address
npm run dev
```

### 5. Test the App
1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Select payment route
4. Enter receiver address and amount
5. Send payment via MetaMask
6. Confirm settlement

## 🎯 Quick Test Addresses

**Polygon Amoy Testnet:**
- Chain ID: 80002
- RPC: https://rpc-amoy.polygon.technology
- Explorer: https://amoy.polygonscan.com/
- Faucet: https://faucet.polygon.technology/

**Test Receiver Address** (use any valid Ethereum address):
```
0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

## 🐛 Quick Troubleshooting

**Contract not configured?**
→ Set CONTRACT_ADDRESS in backend/.env

**MetaMask wrong network?**
→ App will auto-prompt to switch to Amoy

**Insufficient funds?**
→ Get more test MATIC from faucet

**Backend error?**
→ Check backend wallet has test MATIC

## 📚 Full Documentation

See [README.md](./README.md) for complete setup instructions and API documentation.
