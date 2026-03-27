# src/api/server.py

from fastapi import FastAPI
from pydantic import BaseModel

from src.engine.router import find_best_route # adjust import
from data.sample_data import create_sample_data

app = FastAPI()
G = create_sample_data()


class Transaction(BaseModel):
    sender: str
    receiver: str
    amount: float
    currency: str

@app.post("/simulate")
def simulate(tx: Transaction):
    result = find_best_route(G, tx.sender, tx.receiver, tx.amount, tx.currency)
    return result