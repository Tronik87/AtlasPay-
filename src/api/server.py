# src/api/server.py

from fastapi import FastAPI
from pydantic import BaseModel

from src.engine.router import run_routing   # adjust import

app = FastAPI()

class Transaction(BaseModel):
    sender: str
    receiver: str
    amount: float
    currency: str

@app.post("/simulate")
def simulate(tx: Transaction):
    result = run_routing(tx.sender, tx.receiver, tx.amount, tx.currency)
    return result