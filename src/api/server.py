# src/api/server.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from data.generator import create_large_sample
from src.engine.graph_builder import build_graph
from src.utils.fx_profiles import generate_bank_spreads
from src.engine.router import find_best_route


# -------------------------------
# App setup
# -------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Build graph ONCE
# -------------------------------
banks, channels = create_large_sample(15)
bank_spreads = generate_bank_spreads(banks)
G = build_graph(banks, channels, bank_spreads)

# Helper: name → bank object
bank_map = {bank.name: bank for bank in banks}


# -------------------------------
# Request Schema
# -------------------------------
class Transaction(BaseModel):
    sender: str
    receiver: str
    amount: float
    currency: str  # source currency


# -------------------------------
# Endpoints
# -------------------------------
@app.get("/banks")
def get_banks():
    return [
        {
            "name": bank.name,
            "country": bank.country,
            "currencies": bank.supported_currencies
        }
        for bank in banks
    ]


@app.post("/simulate")
def simulate(tx: Transaction):

    # -------------------------------
    # Validate banks
    # -------------------------------
    if tx.sender not in bank_map or tx.receiver not in bank_map:
        return {"error": "Invalid bank name"}

    sender_bank = bank_map[tx.sender]
    receiver_bank = bank_map[tx.receiver]

    # -------------------------------
    # Choose currencies properly
    # -------------------------------
    source_currency = tx.currency

    if source_currency not in sender_bank.supported_currencies:
        return {"error": "Sender does not support this currency"}

    # pick a realistic target currency
    target_currency = receiver_bank.primary_currency

    source = (sender_bank.name, source_currency)
    target = (receiver_bank.name, target_currency)

    # -------------------------------
    # Run routing
    # -------------------------------
    result = find_best_route(
        G,
        source,
        target,
        tx.amount,
        mode="balanced",
        k=5
    )

    # -------------------------------
    # Return result
    # -------------------------------
    return result