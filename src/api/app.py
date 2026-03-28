from fastapi import FastAPI
from data.generator import create_large_sample
from src.engine.graph_builder import build_graph
from src.engine.router import find_best_route
from src.utils.fx_profiles import generate_bank_spreads

app = FastAPI()

@app.get("/simulate")
def simulate():

    banks, channels = create_large_sample(10)
    spreads = generate_bank_spreads(banks)
    G = build_graph(banks, channels, spreads)

    source = (banks[0].name, banks[0].supported_currencies[0])
    target = (banks[1].name, banks[1].supported_currencies[1])

    result = find_best_route(G, source, target, 1000, k=5)

    return result