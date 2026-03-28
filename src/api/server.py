# src/api/server.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from data.generator import create_large_sample
from src.engine.graph_builder import build_graph
from src.utils.fx_profiles import generate_bank_spreads
from src.engine.router import find_routes_multi_mode

from src.db.db import cursor, conn
import json

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
banks, channels = create_large_sample(25)
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
    currency: str


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
    # Validate currency
    # -------------------------------
    source_currency = tx.currency

    if source_currency not in sender_bank.supported_currencies:
        return {"error": "Sender does not support this currency"}

    # target currency = receiver’s primary
    target_currency = receiver_bank.primary_currency

    source = (sender_bank.name, source_currency)
    target = (receiver_bank.name, target_currency)

    # -------------------------------
    # Run MULTI-MODE routing
    # -------------------------------
    results = find_routes_multi_mode(
        G,
        source,
        target,
        tx.amount,
        k=3   # 3 routes per mode (can increase later)
    )

    # -------------------------------
    # Optional: metadata (nice for frontend)
    # -------------------------------
    response = {
        "transaction": {
            "sender": tx.sender,
            "receiver": tx.receiver,
            "amount": tx.amount,
            "source_currency": source_currency,
            "target_currency": target_currency
        },
        "routes_by_mode": results
    }

    


    # pick balanced mode for logging (most realistic)
    balanced = results.get("balanced", {})

    if balanced and balanced.get("routes"):
        best = balanced["routes"][0]

        route_str = " → ".join([b[0] for b in best["path"]])
        cost = best["summary"]["total_cost"]
        time = best["summary"]["total_time"]

        # simple risk logic
        risk = "HIGH" if cost > 20 else "LOW"

        cursor.execute(
            "INSERT INTO transactions (route, total_cost, total_time, risk) VALUES (?, ?, ?, ?)",
            (route_str, cost, time, risk)
        )
        conn.commit()
   
    return response


@app.get("/transactions")
def get_transactions():
    rows = cursor.execute("SELECT * FROM transactions ORDER BY id DESC").fetchall()

    return [
        {
            "id": row[0],
            "route": row[1],
            "cost": row[2],
            "time": row[3],
            "risk": row[4],
            "timestamp": row[5]
        }
        for row in rows
    ]
    
@app.get("/metrics")
def get_metrics():
    rows = cursor.execute("SELECT total_cost, risk FROM transactions").fetchall()

    avg_cost = sum(r[0] for r in rows) / len(rows) if rows else 0
    high_risk = sum(1 for r in rows if r[1] == "HIGH")

    return {
        "avg_cost": avg_cost,
        "high_risk": high_risk,
        "total": len(rows)
    }