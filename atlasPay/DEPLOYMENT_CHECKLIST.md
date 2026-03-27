# AtlasPay Deployment Checklist

Use this checklist to ensure proper setup and deployment of AtlasPay.

## ☑️ Pre-Deployment

### Environment Setup
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Python 3.9+ installed (`python3 --version`)
- [ ] npm installed (`npm --version`)
- [ ] MetaMask browser extension installed
- [ ] Git installed (if cloning from repository)

### Testnet Preparation
- [ ] Created Ethereum wallet (e.g., via MetaMask)
- [ ] Saved private key securely (NEVER commit to Git)
- [ ] Visited Polygon Amoy faucet: https://faucet.polygon.technology/
- [ ] Received test MATIC (minimum 0.5 MATIC recommended)
- [ ] Verified balance on https://amoy.polygonscan.com/

## ☑️ Smart Contract Deployment

### Contract Setup
- [ ] Navigated to `contract/` directory
- [ ] Ran `npm install`
- [ ] Copied `.env.example` to `.env`
- [ ] Added `PRIVATE_KEY` to `.env` (with 0x prefix)
- [ ] Verified `POLYGON_AMOY_RPC` is set correctly
- [ ] Added `.env` to `.gitignore` (already done)

### Compilation & Deployment
- [ ] Ran `npx hardhat compile` successfully
- [ ] No compilation errors or warnings
- [ ] Ran `npx hardhat run scripts/deploy.js --network amoy`
- [ ] Contract deployed successfully
- [ ] **Saved contract address** (starts with 0x)
- [ ] Verified contract on PolygonScan (optional):
  ```
  https://amoy.polygonscan.com/address/<YOUR_CONTRACT_ADDRESS>
  ```

### Contract Verification (Optional)
- [ ] Obtained PolygonScan API key (if verifying)
- [ ] Added API key to `hardhat.config.js`
- [ ] Ran verification command:
  ```bash
  npx hardhat verify --network amoy <CONTRACT_ADDRESS>
  ```

## ☑️ Backend Setup

### Environment Configuration
- [ ] Navigated to `backend/` directory
- [ ] Created Python virtual environment: `python3 -m venv venv`
- [ ] Activated virtual environment: `source venv/bin/activate`
- [ ] Ran `pip install -r requirements.txt`
- [ ] All dependencies installed without errors
- [ ] Copied `.env.example` to `.env`
- [ ] Added backend wallet `PRIVATE_KEY` to `.env`
- [ ] Added deployed `CONTRACT_ADDRESS` to `.env`
- [ ] Verified `POLYGON_AMOY_RPC` matches contract config

### Backend Wallet
- [ ] Backend wallet has test MATIC (minimum 0.05 MATIC)
- [ ] Backend wallet is **different** from deployer wallet (recommended)
- [ ] Wallet address noted for monitoring

### Testing Backend
- [ ] Started backend: `python main.py`
- [ ] Backend running on http://localhost:8000
- [ ] Visited http://localhost:8000/docs (FastAPI Swagger UI)
- [ ] Tested health endpoint: `curl http://localhost:8000/api/health`
- [ ] Health check returns contract address and current block
- [ ] No errors in terminal output

## ☑️ Frontend Setup

### Environment Configuration
- [ ] Navigated to `frontend/` directory
- [ ] Ran `npm install`
- [ ] All dependencies installed without errors
- [ ] Copied `.env.example` to `.env`
- [ ] Added deployed `CONTRACT_ADDRESS` to `.env` as `VITE_CONTRACT_ADDRESS`

### Alternative: Direct Code Configuration
If not using `.env`, update `PaymentForm.jsx`:
- [ ] Opened `src/components/PaymentForm.jsx`
- [ ] Updated line 24: `const CONTRACT_ADDRESS = '0xYourAddress'`

### Testing Frontend
- [ ] Started dev server: `npm run dev`
- [ ] Frontend running on http://localhost:3000
- [ ] Opened http://localhost:3000 in browser
- [ ] Page loads without console errors
- [ ] UI renders correctly (dark theme, components visible)
- [ ] Network badge shows "Polygon Amoy Testnet"

## ☑️ MetaMask Configuration

### Network Setup
- [ ] Opened MetaMask extension
- [ ] Clicked network dropdown (top left)
- [ ] Added Polygon Amoy network (if not present):
  - Network Name: `Polygon Amoy Testnet`
  - RPC URL: `https://rpc-amoy.polygon.technology`
  - Chain ID: `80002`
  - Currency Symbol: `MATIC`
  - Block Explorer: `https://amoy.polygonscan.com`
- [ ] Switched to Polygon Amoy network
- [ ] Test MATIC balance visible

### Wallet Connection
- [ ] Clicked "Connect Wallet" on AtlasPay UI
- [ ] MetaMask popup appeared
- [ ] Selected account and clicked "Connect"
- [ ] Wallet address displayed in header (truncated)
- [ ] Network badge shows correct network

## ☑️ End-to-End Testing

### Route Comparison
- [ ] Selected sender country (e.g., USA)
- [ ] Selected receiver country (e.g., India)
- [ ] Entered amount in USD (e.g., 1000)
- [ ] Routes loaded successfully
- [ ] "Stablecoin-Polygon" route marked as RECOMMENDED
- [ ] Clicked to select route
- [ ] Route highlighted with blue ring

### Payment Flow
- [ ] Payment form appeared
- [ ] Entered valid receiver wallet address
- [ ] Entered amount (e.g., 0.1 MATIC)
- [ ] Clicked "Send Payment"
- [ ] Pre-validation steps ran automatically:
  - ✅ IBAN / Wallet format valid
  - ✅ Sanctions screening: CLEAR
  - ✅ Currency compatibility: PASS
  - ✅ Rail availability: CONFIRMED
- [ ] MetaMask popup appeared
- [ ] Reviewed transaction details
- [ ] Confirmed transaction in MetaMask
- [ ] Status updates shown:
  - ⏳ Signing transaction...
  - 📡 Transaction submitted
  - ⚙️ Confirming on-chain...
  - ✅ Deposit confirmed
- [ ] Transaction hash displayed and clickable
- [ ] Verified on PolygonScan (clicked hash link)

### Settlement Flow
- [ ] Settlement panel appeared after deposit confirmation
- [ ] Receiver address and amount displayed correctly
- [ ] Clicked "Confirm Settlement & Release Funds"
- [ ] Backend processed settlement (spinner shown)
- [ ] Success message: "✅ Funds Delivered!"
- [ ] Settlement proof displayed
- [ ] Settlement transaction hash shown and clickable

### Transaction Details
- [ ] Transaction details panel displayed
- [ ] All fields populated correctly:
  - Transaction ID
  - Sender address
  - Receiver address
  - Amount in MATIC
  - Block progress bar
  - Confirmed status: ✅
- [ ] Panel auto-refreshes (wait 10+ seconds, see block number update)

### Final Verification
- [ ] Checked receiver wallet balance increased on PolygonScan
- [ ] Verified both transactions (deposit + settlement) on explorer
- [ ] Backend logs show no errors
- [ ] Frontend console shows no errors

## ☑️ Documentation Review

- [ ] Read `README.md` for full documentation
- [ ] Reviewed `QUICKSTART.md` for quick reference
- [ ] Studied `ARCHITECTURE.md` for system design
- [ ] Bookmarked useful links:
  - Polygon Faucet: https://faucet.polygon.technology/
  - Amoy Explorer: https://amoy.polygonscan.com/
  - Polygon Docs: https://docs.polygon.technology/

## ☑️ Security Checklist

### Environment Variables
- [ ] All `.env` files in `.gitignore`
- [ ] Never committed private keys to repository
- [ ] Backend `.env` separate from contract `.env`
- [ ] Contract address publicly shareable (not secret)

### Wallet Safety
- [ ] Using testnet only (no real funds at risk)
- [ ] Private keys stored securely (not in screenshots/logs)
- [ ] Test wallets separate from mainnet wallets
- [ ] MetaMask connected to Amoy testnet only

### Code Security
- [ ] Smart contract has no obvious vulnerabilities
- [ ] No hardcoded private keys in code
- [ ] Backend CORS enabled for development only
- [ ] Frontend validates addresses before sending

## ☑️ Troubleshooting Completed

If you encountered issues, verify you resolved them:

### Common Issues Fixed
- [ ] "Contract not configured" → Added CONTRACT_ADDRESS to backend .env
- [ ] "Wrong network" → Switched MetaMask to Polygon Amoy
- [ ] "Insufficient funds" → Got more test MATIC from faucet
- [ ] "Transaction failed" → Backend wallet had enough MATIC
- [ ] CORS errors → Backend and frontend running on correct ports
- [ ] MetaMask not detected → Installed extension and refreshed page

## 🎉 Deployment Complete!

Congratulations! Your AtlasPay application is now fully deployed and functional.

### What You've Built:
✅ Deployed a smart contract to Polygon Amoy testnet  
✅ Set up a FastAPI backend with Web3 integration  
✅ Created a React frontend with MetaMask integration  
✅ Implemented escrow, settlement, and refund mechanisms  
✅ Built a fintech-style cross-border payment UI  

### Next Steps:
- Test timeout/refund mechanism (see README.md)
- Explore enhancing with Chainlink price feeds
- Add multi-sig settlement authority
- Implement ERC-20 stablecoin support
- Build admin monitoring dashboard

### Share Your Success:
- Take screenshots of the working app
- Share on social media with #Web3 #Polygon #AtlasPay
- Contribute improvements via pull requests

---

**Need Help?**
- Review README.md troubleshooting section
- Check backend terminal logs
- Inspect browser console (F12)
- Verify on PolygonScan explorer

**Built something cool?**
- Fork and enhance the project
- Share your improvements
- Star the repository ⭐

---

AtlasPay © 2026 • Built with ❤️ for the blockchain community
