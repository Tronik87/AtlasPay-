from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from web3 import Web3
from dotenv import load_dotenv
import os
from typing import Optional

load_dotenv()

app = FastAPI(title="AtlasPay API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Web3 setup
POLYGON_AMOY_RPC = os.getenv("POLYGON_AMOY_RPC", "https://rpc-amoy.polygon.technology")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

w3 = Web3(Web3.HTTPProvider(POLYGON_AMOY_RPC))

# Contract ABI (simplified for the functions we need)
CONTRACT_ABI = [
    {
        "inputs": [{"internalType": "address", "name": "_receiver", "type": "address"}, {"internalType": "uint256", "name": "_timeoutBlocks", "type": "uint256"}],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "_txId", "type": "bytes32"}],
        "name": "confirmSettlement",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "_txId", "type": "bytes32"}],
        "name": "getEscrow",
        "outputs": [
            {"internalType": "address", "name": "sender", "type": "address"},
            {"internalType": "address", "name": "receiver", "type": "address"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"},
            {"internalType": "uint256", "name": "timeoutBlock", "type": "uint256"},
            {"internalType": "bool", "name": "confirmed", "type": "bool"},
            {"internalType": "bool", "name": "refunded", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "bytes32", "name": "txId", "type": "bytes32"},
            {"indexed": True, "internalType": "address", "name": "sender", "type": "address"},
            {"indexed": True, "internalType": "address", "name": "receiver", "type": "address"},
            {"indexed": False, "internalType": "uint256", "name": "amount", "type": "uint256"},
            {"indexed": False, "internalType": "uint256", "name": "timeout", "type": "uint256"}
        ],
        "name": "FundsDeposited",
        "type": "event"
    }
]

if not CONTRACT_ADDRESS:
    print("⚠️  Warning: CONTRACT_ADDRESS not set in .env")

contract = None
if CONTRACT_ADDRESS and w3.is_address(CONTRACT_ADDRESS):
    contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=CONTRACT_ABI)

# Pydantic models
class InitiatePaymentRequest(BaseModel):
    sender_address: str
    receiver_address: str
    amount_matic: float
    sender_private_key: str

class ConfirmSettlementRequest(BaseModel):
    tx_id: str

class RouteOption(BaseModel):
    rail: str
    estimated_time: str
    fee_usd: float
    fx_spread_percent: float
    recommended: bool

# Endpoints
@app.get("/api/health")
async def health():
    """Health check endpoint"""
    try:
        current_block = w3.eth.block_number
        return {
            "status": "healthy",
            "contract_address": CONTRACT_ADDRESS,
            "current_block": current_block,
            "network": "Polygon Amoy Testnet",
            "chain_id": 80002
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Web3 connection error: {str(e)}")

@app.get("/api/route-options")
async def get_route_options(sender_country: str, receiver_country: str, amount: float):
    """Get payment route options"""
    routes = [
        {
            "rail": "SWIFT",
            "estimated_time": "3-5 business days",
            "fee_usd": 25.00 + (amount * 0.02),
            "fx_spread_percent": 2.5,
            "recommended": False
        },
        {
            "rail": "UPI (India only)",
            "estimated_time": "Instant - 2 hours",
            "fee_usd": 0.50,
            "fx_spread_percent": 0.5,
            "recommended": False if receiver_country.lower() != "india" else True
        },
        {
            "rail": "Stablecoin-Polygon",
            "estimated_time": "2-5 minutes",
            "fee_usd": 0.10,
            "fx_spread_percent": 0.1,
            "recommended": True
        },
        {
            "rail": "Western Union",
            "estimated_time": "1-2 business days",
            "fee_usd": 15.00 + (amount * 0.015),
            "fx_spread_percent": 3.0,
            "recommended": False
        }
    ]
    
    return {
        "sender_country": sender_country,
        "receiver_country": receiver_country,
        "amount_usd": amount,
        "routes": routes
    }

@app.post("/api/initiate-payment")
async def initiate_payment(request: InitiatePaymentRequest):
    """Initiate a payment by depositing funds into escrow"""
    if not contract:
        raise HTTPException(status_code=500, detail="Contract not configured")
    
    try:
        # Validate addresses
        if not w3.is_address(request.sender_address):
            raise HTTPException(status_code=400, detail="Invalid sender address")
        if not w3.is_address(request.receiver_address):
            raise HTTPException(status_code=400, detail="Invalid receiver address")
        
        sender_address = Web3.to_checksum_address(request.sender_address)
        receiver_address = Web3.to_checksum_address(request.receiver_address)
        amount_wei = w3.to_wei(request.amount_matic, 'ether')
        
        # Timeout: 100 blocks (~5 minutes on Polygon)
        timeout_blocks = 100
        
        # Build transaction
        account = w3.eth.account.from_key(request.sender_private_key)
        
        if account.address.lower() != sender_address.lower():
            raise HTTPException(status_code=400, detail="Private key does not match sender address")
        
        nonce = w3.eth.get_transaction_count(sender_address)
        
        # Estimate gas
        gas_estimate = contract.functions.deposit(
            receiver_address,
            timeout_blocks
        ).estimate_gas({
            'from': sender_address,
            'value': amount_wei
        })
        
        # Build transaction
        transaction = contract.functions.deposit(
            receiver_address,
            timeout_blocks
        ).build_transaction({
            'from': sender_address,
            'value': amount_wei,
            'gas': gas_estimate + 10000,
            'gasPrice': w3.eth.gas_price,
            'nonce': nonce,
            'chainId': 80002
        })
        
        # Sign and send
        signed_txn = w3.eth.account.sign_transaction(transaction, request.sender_private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        
        # Wait for receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        # Extract txId from event logs
        tx_id = None
        for log in receipt['logs']:
            try:
                event = contract.events.FundsDeposited().process_log(log)
                tx_id = event['args']['txId'].hex()
                break
            except:
                continue
        
        current_block = w3.eth.block_number
        
        return {
            "status": "success",
            "tx_hash": tx_hash.hex(),
            "tx_id": tx_id,
            "block_number": receipt['blockNumber'],
            "current_block": current_block,
            "estimated_confirmation_time": "2-5 minutes",
            "gas_used": receipt['gasUsed']
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transaction failed: {str(e)}")

@app.post("/api/confirm-settlement")
async def confirm_settlement(request: ConfirmSettlementRequest):
    """Confirm settlement and release funds to receiver"""
    if not contract:
        raise HTTPException(status_code=500, detail="Contract not configured")
    
    if not PRIVATE_KEY:
        raise HTTPException(status_code=500, detail="Backend private key not configured")
    
    try:
        # Convert tx_id to bytes32
        if request.tx_id.startswith('0x'):
            tx_id_bytes = bytes.fromhex(request.tx_id[2:])
        else:
            tx_id_bytes = bytes.fromhex(request.tx_id)
        
        account = w3.eth.account.from_key(PRIVATE_KEY)
        nonce = w3.eth.get_transaction_count(account.address)
        
        # Build transaction
        transaction = contract.functions.confirmSettlement(
            tx_id_bytes
        ).build_transaction({
            'from': account.address,
            'gas': 100000,
            'gasPrice': w3.eth.gas_price,
            'nonce': nonce,
            'chainId': 80002
        })
        
        # Sign and send
        signed_txn = w3.eth.account.sign_transaction(transaction, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        
        # Wait for receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        return {
            "status": "settled",
            "tx_hash": tx_hash.hex(),
            "block_number": receipt['blockNumber'],
            "settlement_proof": f"Settlement confirmed on-chain at block {receipt['blockNumber']}. Tx: {tx_hash.hex()}",
            "gas_used": receipt['gasUsed']
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Settlement confirmation failed: {str(e)}")

@app.get("/api/transaction/{tx_id}")
async def get_transaction(tx_id: str):
    """Get transaction details from contract"""
    if not contract:
        raise HTTPException(status_code=500, detail="Contract not configured")
    
    try:
        # Convert tx_id to bytes32
        if tx_id.startswith('0x'):
            tx_id_bytes = bytes.fromhex(tx_id[2:])
        else:
            tx_id_bytes = bytes.fromhex(tx_id)
        
        # Get escrow data
        escrow_data = contract.functions.getEscrow(tx_id_bytes).call()
        current_block = w3.eth.block_number
        
        sender, receiver, amount, timeout_block, confirmed, refunded = escrow_data
        
        # Calculate status
        if confirmed:
            status = "settled"
        elif refunded:
            status = "refunded"
        elif current_block > timeout_block:
            status = "expired"
        else:
            status = "pending"
        
        return {
            "tx_id": tx_id,
            "sender": sender,
            "receiver": receiver,
            "amount_wei": str(amount),
            "amount_matic": float(w3.from_wei(amount, 'ether')),
            "timeout_block": timeout_block,
            "current_block": current_block,
            "blocks_remaining": max(0, timeout_block - current_block),
            "confirmed": confirmed,
            "refunded": refunded,
            "status": status,
            "exists": amount > 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch transaction: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
