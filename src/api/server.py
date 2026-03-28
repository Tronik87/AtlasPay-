# src/api/server.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random

from src.engine.router import find_multiple_routes
from data.generator import create_large_sample
from src.engine.graph_builder import build_graph
from src.utils.fx_profiles import generate_bank_spreads
import networkx as nx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize network
banks, channels = create_large_sample(n_banks=50) # Increased from 10 to ensure better country coverage
bank_spreads = generate_bank_spreads(banks)
G = build_graph(banks, channels, bank_spreads)


class Transaction(BaseModel):
    sender: str
    receiver: str
    amount: float
    currency: str

class RouteRequest(BaseModel):
    sender_country: str
    receiver_country: str
    amount: str
    currency: str
    crypto: str

@app.post("/simulate")
def simulate(tx: Transaction):
    result = find_multiple_routes(G, tx.sender, tx.receiver, tx.amount, mode="balanced", k=5)
    return result

@app.post("/route")
def calculate_route(req: RouteRequest):
    # Try finding banks in requested countries
    sender_banks = [b for b in banks if getattr(b, "country", None) == req.sender_country]
    receiver_banks = [b for b in banks if getattr(b, "country", None) == req.receiver_country]

    if not sender_banks or not receiver_banks:
        return {"routes": []}

    source_bank = random.choice(sender_banks).name
    target_bank = random.choice(receiver_banks).name

    amount = float(req.amount)
    source = (source_bank, req.currency)
    
    curr_map = {
        "India": "INR", "UK": "GBP", "Germany": "EUR", "France": "EUR", 
        "Singapore": "SGD", "USA": "USD", "China": "CNY", "Canada": "CAD"
    }
    target_curr = curr_map.get(req.receiver_country, "INR")
    if target_curr == req.currency and req.sender_country != req.receiver_country:
        target_curr = "INR"

    target = (target_bank, target_curr)
    
    try:
        result = find_multiple_routes(
            G, source, target, amount,
            mode="balanced",
            k=5
        )
    except Exception as e:
        print(f"Routing Error: {e}")
        return {"routes": []}
    
    if "error" in result:
        return {"routes": []}
        
    return result