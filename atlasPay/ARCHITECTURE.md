# AtlasPay Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            USER INTERFACE                                │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    React Frontend (Vite)                         │  │
│  │                    http://localhost:3000                         │  │
│  │                                                                  │  │
│  │  Components:                                                     │  │
│  │  • Header (Wallet Connection)                                    │  │
│  │  • RouteSelector (Payment Comparison)                            │  │
│  │  • PreValidation (Compliance Checks)                             │  │
│  │  • PaymentForm (Transaction Submission)                          │  │
│  │  • SettlementPanel (Fund Release)                                │  │
│  │  • TransactionDetail (Live Tracking)                             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                │                                   │
                │ Ethers.js v6                      │ Axios HTTP
                │ (Direct blockchain calls)         │ (API calls)
                │                                   │
                ▼                                   ▼
┌─────────────────────────────┐    ┌──────────────────────────────────────┐
│   MetaMask Wallet           │    │   FastAPI Backend                    │
│   (User's Browser)          │    │   http://localhost:8000              │
│                             │    │                                      │
│   • Sign Transactions       │    │   Endpoints:                         │
│   • Network Switching       │    │   • GET  /api/health                 │
│   • Balance Management      │    │   • GET  /api/route-options          │
│                             │    │   • POST /api/initiate-payment       │
└─────────────────────────────┘    │   • POST /api/confirm-settlement     │
                │                  │   • GET  /api/transaction/{tx_id}    │
                │                  │                                      │
                │                  │   Dependencies:                       │
                │                  │   • Web3.py (Blockchain interaction)  │
                │                  │   • FastAPI (API framework)          │
                │                  │   • CORS enabled                     │
                └──────────────────┤                                      │
                                   └──────────────────────────────────────┘
                                                   │
                                                   │ Web3.py
                                                   │ (JSON-RPC)
                                                   │
                                                   ▼
                        ┌──────────────────────────────────────────┐
                        │   Polygon Amoy Testnet (Chain ID: 80002) │
                        │   RPC: https://rpc-amoy.polygon.technology│
                        │                                          │
                        │   ┌──────────────────────────────────┐  │
                        │   │  AtlasPayEscrow Smart Contract   │  │
                        │   │  (Solidity ^0.8.20)              │  │
                        │   │                                  │  │
                        │   │  Functions:                      │  │
                        │   │  • deposit() payable             │  │
                        │   │  • confirmSettlement()           │  │
                        │   │  • refund()                      │  │
                        │   │  • getEscrow() view              │  │
                        │   │                                  │  │
                        │   │  Events:                         │  │
                        │   │  • FundsDeposited                │  │
                        │   │  • FundsReleased                 │  │
                        │   │  • FundsRefunded                 │  │
                        │   │                                  │  │
                        │   │  Storage:                        │  │
                        │   │  • mapping(txId => Escrow)       │  │
                        │   └──────────────────────────────────┘  │
                        │                                          │
                        │   Explorer: amoy.polygonscan.com         │
                        └──────────────────────────────────────────┘


DATA FLOW SEQUENCE:
═══════════════════

1. DEPOSIT FLOW:
   User → MetaMask → Smart Contract.deposit() → Emit FundsDeposited(txId)
   
2. QUERY FLOW:
   Frontend → Backend API → Web3.getEscrow(txId) → Return escrow data
   
3. SETTLEMENT FLOW:
   Frontend → Backend API → Backend Wallet → Smart Contract.confirmSettlement(txId)
   → Transfer MATIC to receiver → Emit FundsReleased
   
4. ROUTE COMPARISON FLOW:
   Frontend → Backend API → Simulated route data → Display comparison

SMART CONTRACT STATE:
═══════════════════

Escrow Struct:
┌─────────────────────────────┐
│ txId (bytes32)              │ → Unique transaction identifier
├─────────────────────────────┤
│ sender (address)            │ → Payment sender
│ receiver (address)          │ → Payment receiver
│ amount (uint256)            │ → Escrowed MATIC (wei)
│ timeoutBlock (uint256)      │ → Deadline block number
│ confirmed (bool)            │ → Settlement status
│ refunded (bool)             │ → Refund status
└─────────────────────────────┘

TECHNOLOGY STACK:
════════════════

Frontend:
  • React 18.2.0
  • Vite 5.0.12
  • TailwindCSS 3.4.1
  • Ethers.js 6.10.0
  • Axios 1.6.5

Backend:
  • Python 3.9+
  • FastAPI 0.109.0
  • Web3.py 6.15.0
  • Uvicorn 0.27.0

Blockchain:
  • Solidity 0.8.20
  • Hardhat 2.19.0
  • Polygon Amoy Testnet
  • OpenZeppelin (implicitly via Solidity)

Development:
  • Node.js 18+
  • npm package manager
  • Python venv

NETWORK DETAILS:
═══════════════

Polygon Amoy Testnet
├─ Chain ID: 80002
├─ RPC URL: https://rpc-amoy.polygon.technology
├─ Native Token: MATIC (test)
├─ Block Time: ~2 seconds
├─ Gas Token: MATIC
├─ Explorer: https://amoy.polygonscan.com/
└─ Faucet: https://faucet.polygon.technology/

SECURITY MODEL:
══════════════

Escrow Protection:
  ✅ Funds locked in smart contract (non-custodial)
  ✅ Time-locked with automatic refund mechanism
  ✅ Double-spend protection (txId uniqueness)
  ✅ Reentrancy protection (state changes before transfers)

Settlement Authority:
  ⚠️  Centralized backend wallet (demo only)
  🔐 Production: Use multi-sig or oracle network (Chainlink)

User Safety:
  ✅ MetaMask transaction preview
  ✅ Client-side wallet signing
  ✅ Pre-flight validation checks
  ⚠️  Testnet only (no real value at risk)
```
