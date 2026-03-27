# AtlasPay - Cross-Border Payment Simulation

A full-stack decentralized application (dApp) demonstrating real-time cross-border payments using blockchain technology. Built with Solidity smart contracts on Polygon Amoy testnet, FastAPI backend, and React frontend.

![AtlasPay](https://img.shields.io/badge/Blockchain-Polygon-8247E5)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB)

## 🌟 Features

- **Smart Contract Escrow**: Secure MATIC deposits with automated settlement and refund mechanisms
- **Multi-Rail Comparison**: Compare SWIFT, UPI, Stablecoin, and Western Union routes
- **Real-time Settlement**: 2-5 minute blockchain-based transfers vs 3-5 day traditional rails
- **Pre-Flight Validation**: Automated checks for wallet format, sanctions screening, and compatibility
- **MetaMask Integration**: Seamless wallet connection and transaction signing
- **Live Transaction Tracking**: Real-time block progress and escrow status monitoring
- **Dark-themed Fintech UI**: Professional dashboard design with TailwindCSS

## 📁 Project Structure

```
atlasPay/
├── contract/                    # Solidity smart contract
│   ├── contracts/
│   │   └── AtlasPayEscrow.sol  # Main escrow contract
│   ├── scripts/
│   │   └── deploy.js           # Deployment script
│   ├── hardhat.config.js       # Hardhat configuration
│   └── package.json
├── backend/                     # FastAPI backend
│   ├── main.py                 # API server with Web3 integration
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Environment variables
└── frontend/                    # React + Vite frontend
    ├── src/
    │   ├── App.jsx             # Main app component
    │   ├── components/
    │   │   ├── Header.jsx      # Wallet connection header
    │   │   ├── RouteSelector.jsx      # Route comparison
    │   │   ├── PaymentForm.jsx        # Payment submission
    │   │   ├── SettlementPanel.jsx    # Settlement control
    │   │   ├── TransactionDetail.jsx  # Live tx tracking
    │   │   └── PreValidation.jsx      # Pre-flight checks
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.9+
- **MetaMask** browser extension
- **Git**

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd atlasPay
```

### 2. Get Testnet MATIC

Before deploying, you need Polygon Amoy testnet MATIC:

1. **Get test MATIC from faucet**:
   - Visit [Polygon Faucet](https://faucet.polygon.technology/)
   - Select "Polygon Amoy"
   - Enter your wallet address
   - Request test MATIC (you'll receive ~0.5 MATIC)

2. **Alternative faucets**:
   - [Alchemy Amoy Faucet](https://www.alchemy.com/faucets/polygon-amoy)
   - [QuickNode Faucet](https://faucet.quicknode.com/polygon/amoy)

💡 **Tip**: You'll need MATIC in two wallets:
- **Deployer wallet**: For contract deployment (~0.01 MATIC)
- **Backend wallet**: For confirming settlements (~0.001 MATIC per settlement)
- **User wallet** (MetaMask): For sending payments (~0.1+ MATIC for testing)

### 3. Deploy Smart Contract

```bash
cd contract

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your private key
# PRIVATE_KEY=your_private_key_with_testnet_matic
# POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology

# Compile contract
npx hardhat compile

# Deploy to Polygon Amoy
npx hardhat run scripts/deploy.js --network amoy
```

After deployment, you'll see:
```
✅ AtlasPayEscrow deployed to: 0xYourContractAddress
```

**Save this contract address!** You'll need it for the backend and frontend.

### 4. Setup Backend

```bash
cd ../backend

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add:
# PRIVATE_KEY=your_backend_wallet_private_key
# CONTRACT_ADDRESS=0xYourDeployedContractAddress
# POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
```

**Important**: The backend private key should be from a wallet with some test MATIC for confirming settlements.

### 5. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add:
# VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

Alternatively, you can directly edit the contract address in:
`frontend/src/components/PaymentForm.jsx` (line 24)

### 6. Run the Application

You need **3 terminals**:

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
```
Backend runs on http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:3000

**Terminal 3 - Optional monitoring:**
```bash
# Check backend health
curl http://localhost:8000/api/health
```

## 🎮 How to Demo the Full Flow

### Step 1: Connect MetaMask

1. Open http://localhost:3000 in your browser
2. Click **"Connect Wallet"** in the top-right
3. MetaMask will prompt you to:
   - Connect your account
   - Switch to Polygon Amoy testnet (if needed)
4. Your wallet address should appear in the header

### Step 2: Compare Payment Routes

1. Select **Sender Country** (e.g., USA)
2. Select **Receiver Country** (e.g., India)
3. Enter **Amount in USD** (e.g., 1000)
4. Review the route comparison table:
   - **SWIFT**: 3-5 days, $45 fee, 2.5% FX spread
   - **UPI**: Instant, $0.50 fee (India only)
   - **Stablecoin-Polygon**: 2-5 minutes, $0.10 fee, 0.1% spread ⭐ **RECOMMENDED**
   - **Western Union**: 1-2 days, $30 fee, 3% spread
5. Click the **Stablecoin-Polygon** route to select it

### Step 3: Send Payment

1. Enter **Receiver Wallet Address** (use a different wallet or create a new one)
2. Enter **Amount in USD** (e.g., 100) - auto-converts to MATIC at $0.85/MATIC
3. Or directly enter **Amount in MATIC** (e.g., 0.5 MATIC)
4. Click **"Send Payment"**
5. Watch the **Pre-Flight Validation** run automatically:
   - ✅ IBAN / Wallet format valid
   - ✅ Sanctions screening: CLEAR
   - ✅ Currency compatibility: PASS
   - ✅ Rail availability: CONFIRMED
6. MetaMask will pop up asking you to **confirm the transaction**
7. Review gas fees and click **Confirm**
8. Status updates:
   - ⏳ Signing transaction...
   - 📡 Transaction submitted
   - ⚙️ Confirming on-chain...
   - ✅ Deposit confirmed

### Step 4: Confirm Settlement

1. Once deposit is confirmed, the **Settlement Panel** appears
2. Review the escrow details (receiver, amount)
3. Click **"Confirm Settlement & Release Funds"**
4. Backend signs and sends the settlement transaction
5. Wait ~10-30 seconds for on-chain confirmation
6. Success! **"✅ Funds Delivered!"** message appears

### Step 5: Monitor Transaction

1. The **Transaction Details** panel shows live data:
   - Transaction ID (bytes32)
   - Sender & Receiver addresses
   - Amount in MATIC
   - Block progress (current vs timeout)
   - Confirmation status
2. Click the **transaction hash** to view on [Amoy PolygonScan](https://amoy.polygonscan.com/)
3. Panel auto-refreshes every 10 seconds

## 🔧 API Endpoints

### Backend API (http://localhost:8000)

#### `GET /api/health`
Check backend and blockchain connection status.

**Response:**
```json
{
  "status": "healthy",
  "contract_address": "0x...",
  "current_block": 12345678,
  "network": "Polygon Amoy Testnet",
  "chain_id": 80002
}
```

#### `GET /api/route-options`
Get payment route comparison.

**Query Params:**
- `sender_country`: String (e.g., "USA")
- `receiver_country`: String (e.g., "India")
- `amount`: Float (USD amount)

**Response:**
```json
{
  "routes": [
    {
      "rail": "Stablecoin-Polygon",
      "estimated_time": "2-5 minutes",
      "fee_usd": 0.10,
      "fx_spread_percent": 0.1,
      "recommended": true
    },
    ...
  ]
}
```

#### `POST /api/initiate-payment`
**⚠️ Demo Only**: Accepts private key in request body. In production, use frontend wallet signing.

**Request:**
```json
{
  "sender_address": "0x...",
  "receiver_address": "0x...",
  "amount_matic": 0.5,
  "sender_private_key": "0x..."
}
```

**Response:**
```json
{
  "status": "success",
  "tx_hash": "0x...",
  "tx_id": "0x...",
  "block_number": 12345678,
  "estimated_confirmation_time": "2-5 minutes"
}
```

#### `POST /api/confirm-settlement`
Backend confirms settlement and releases funds.

**Request:**
```json
{
  "tx_id": "0x..."
}
```

**Response:**
```json
{
  "status": "settled",
  "tx_hash": "0x...",
  "settlement_proof": "Settlement confirmed on-chain at block ...",
  "gas_used": 50000
}
```

#### `GET /api/transaction/{tx_id}`
Get escrow details and status.

**Response:**
```json
{
  "tx_id": "0x...",
  "sender": "0x...",
  "receiver": "0x...",
  "amount_matic": 0.5,
  "timeout_block": 12345678,
  "current_block": 12345600,
  "blocks_remaining": 78,
  "confirmed": false,
  "refunded": false,
  "status": "pending"
}
```

## 🔐 Smart Contract Functions

### `deposit(address _receiver, uint256 _timeoutBlocks) payable`
Deposits MATIC into escrow.
- **Parameters:**
  - `_receiver`: Recipient address
  - `_timeoutBlocks`: Blocks until timeout (default: 100 blocks ≈ 5 minutes)
- **Emits:** `FundsDeposited(txId, sender, receiver, amount, timeout)`

### `confirmSettlement(bytes32 _txId)`
Releases escrowed funds to receiver.
- **Parameters:**
  - `_txId`: Transaction ID from deposit event
- **Requires:** Must be called before timeout
- **Emits:** `FundsReleased(txId, receiver, amount)`

### `refund(bytes32 _txId)`
Refunds sender after timeout.
- **Parameters:**
  - `_txId`: Transaction ID
- **Requires:** Timeout must be reached, only sender can call
- **Emits:** `FundsRefunded(txId, sender, amount)`

### `getEscrow(bytes32 _txId) view returns (address, address, uint256, uint256, bool, bool)`
Queries escrow state.
- **Returns:** sender, receiver, amount, timeoutBlock, confirmed, refunded

## 🛠️ Troubleshooting

### MetaMask Issues

**"Wrong network" error:**
- App will automatically prompt to add/switch to Polygon Amoy
- Manually add network:
  - Network Name: Polygon Amoy Testnet
  - RPC URL: https://rpc-amoy.polygon.technology
  - Chain ID: 80002
  - Currency: MATIC
  - Explorer: https://amoy.polygonscan.com/

**"Insufficient funds" error:**
- Get test MATIC from faucet (see Step 2)
- Minimum needed: ~0.05 MATIC for gas

**Transaction rejected:**
- Check MetaMask is unlocked
- Ensure correct network is selected
- Refresh page and try again

### Backend Issues

**"Contract not configured" error:**
- Verify `CONTRACT_ADDRESS` is set in `backend/.env`
- Check address is correct (starts with 0x)

**"Web3 connection error":**
- Verify `POLYGON_AMOY_RPC` URL is correct
- Try alternative RPC: `https://polygon-amoy.g.alchemy.com/v2/demo`

**"Transaction failed" on settlement:**
- Ensure backend wallet has test MATIC
- Check transaction hasn't already been settled/refunded

### Frontend Issues

**Contract address not set:**
- Set `VITE_CONTRACT_ADDRESS` in `frontend/.env`
- Or edit directly in `PaymentForm.jsx`
- Restart dev server after changing `.env`

**CORS errors:**
- Backend runs on port 8000, frontend on 3000
- Check both servers are running
- CORS is enabled for all origins in backend

**Components not rendering:**
- Check browser console for errors
- Verify all dependencies installed: `npm install`
- Clear browser cache and reload

## 🧪 Testing the Timeout/Refund Flow

To test the automatic refund mechanism:

1. Deploy a payment with a short timeout (modify `PaymentForm.jsx` line 61):
   ```javascript
   const timeoutBlocks = 5; // 5 blocks ≈ 15 seconds
   ```
2. Send the payment but **don't confirm settlement**
3. Wait ~15-20 seconds for timeout
4. Call the `refund()` function:
   ```javascript
   // In browser console or via backend
   contract.refund(txId, { from: senderAddress })
   ```
5. Funds return to sender's wallet

## 📊 Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│   React     │◄────────┤   FastAPI    │◄────────┤  Polygon Amoy   │
│  Frontend   │  HTTP   │   Backend    │  Web3   │  Smart Contract │
└─────────────┘         └──────────────┘         └─────────────────┘
      │                        │                           │
      │ Ethers.js              │ Web3.py                   │
      │ (Direct)               │ (Backend calls)           │
      │                        │                           │
      └────────────────────────┴───────────────────────────┘
                    Polygon Amoy Testnet
                    (Chain ID: 80002)
```

### Flow:
1. **User** connects MetaMask to frontend
2. **Frontend** compares routes via backend API
3. **User** submits payment → **Frontend** calls smart contract directly
4. **Smart contract** emits `FundsDeposited` event with txId
5. **Backend** listens/queries for transaction
6. **Backend** calls `confirmSettlement()` when authorized
7. **Smart contract** releases funds to receiver
8. **Frontend** displays settlement proof and updates status

## 🎯 Key Technologies

- **Blockchain**: Polygon Amoy (Layer 2, EVM-compatible)
- **Smart Contract**: Solidity 0.8.20
- **Development Framework**: Hardhat
- **Backend**: FastAPI (Python 3.9+)
- **Blockchain Interaction**: Web3.py
- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **Wallet Integration**: Ethers.js v6 + MetaMask
- **HTTP Client**: Axios

## 🔒 Security Notes

⚠️ **This is a demo application for educational purposes:**

- **Private keys in requests**: The `/api/initiate-payment` endpoint accepts private keys for demo convenience. In production, ALWAYS use client-side wallet signing.
- **No authentication**: Backend endpoints are unprotected. Implement JWT or API keys in production.
- **Testnet only**: Uses test MATIC with no real value.
- **No audits**: Smart contract has not been professionally audited.
- **Centralized settlement**: Backend holds authority to confirm settlements. In production, use decentralized oracles (Chainlink) or multi-sig.

## 📝 License

MIT License - Free for educational and commercial use.

## 🤝 Contributing

This is a demonstration project. Feel free to fork and extend!

**Possible enhancements:**
- Add Chainlink price feeds for real-time MATIC/USD conversion
- Implement multi-sig settlement authority
- Add support for ERC-20 stablecoins (USDC, USDT)
- Build admin dashboard for backend monitoring
- Add email/SMS notifications for settlements
- Implement KYC/AML integration
- Support multiple blockchain networks (Ethereum, BSC, Arbitrum)

## 🌐 Useful Links

- [Polygon Documentation](https://docs.polygon.technology/)
- [Polygon Amoy Faucet](https://faucet.polygon.technology/)
- [Amoy PolygonScan Explorer](https://amoy.polygonscan.com/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [MetaMask Documentation](https://docs.metamask.io/)

## 💬 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review blockchain explorer for transaction details
3. Check backend logs for API errors
4. Verify environment variables are set correctly

---

**Built with ❤️ for the blockchain community**

AtlasPay © 2026 • Polygon Amoy Testnet • Demo Application
