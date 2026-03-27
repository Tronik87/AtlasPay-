from src.utils.fees import calculate_fee
import networkx as nx

def calculate_edge_cost(data, amount):
    fee = calculate_fee(amount)
    fx_rate = data['fx_rate']
    time = data['time']

    fx_loss = amount * (1 - fx_rate)
    total = fee + fx_loss + time

    return total, fee, fx_loss, time


def find_best_route(G, source, target, amount):

    def weight(u, v, d):
        if d['liquidity'] < amount:
            return float('inf')

        total, _, _, _ = calculate_edge_cost(d, amount)
        return total

    try:
        path = nx.shortest_path(G, source, target, weight=weight)
    except nx.NetworkXNoPath:
        return {
            "error": "No valid route found"
        }

    total_cost = 0
    total_fee = 0
    total_fx = 0
    total_time = 0

    edges = []

    for i in range(len(path) - 1):
        data = G[path[i]][path[i+1]]
        total, fee, fx, time = calculate_edge_cost(data, amount)

        edges.append({
            "from": path[i],
            "to": path[i+1],
            "fee": fee,
            "fx_loss": fx,
            "time": time,
            "fx_rate": data['fx_rate']
        })

        total_cost += total
        total_fee += fee
        total_fx += fx
        total_time += time

    return {
        "path": path,
        "edges": edges,
        "summary": {
            "total_cost": total_cost,
            "total_fee": total_fee,
            "total_fx_loss": total_fx,
            "total_time": total_time
        }
    }