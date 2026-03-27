import networkx as nx


def calculate_edge_cost(data, amount, mode="balanced"):
    fee = data['fee']
    fx_rate = data['fx_rate']
    time = data['time']
    edge_type = data.get('type', 'transfer')

    fx_loss = amount * (1 - fx_rate)

    # -------------------------------
    # penalties
    # -------------------------------
    hop_penalty = 1
    fx_penalty = 5 if edge_type == "fx" else 0

    money_cost = fee + fx_loss
    time_cost = time

    # -------------------------------
    # strategy weighting
    # -------------------------------
    if mode == "cheapest":
        total = money_cost + 0.2 * time_cost

    elif mode == "fastest":
        total = time_cost + 0.1 * money_cost

    else:  # balanced
        total = money_cost + 0.5 * time_cost

    total += hop_penalty + fx_penalty

    return total, fee, fx_loss, time


def count_fx_transitions(path):
    count = 0
    for i in range(len(path) - 1):
        if path[i][1] != path[i + 1][1]:
            count += 1
    return count


def find_best_route(G, source, target, amount, mode="balanced"):

    def weight(u, v, d):
        if d['liquidity'] < amount:
            return float('inf')

        total, _, _, _ = calculate_edge_cost(d, amount, mode)
        return total

    try:
        path = nx.shortest_path(G, source, target, weight=weight)
    except nx.NetworkXNoPath:
        return {"error": "No valid route found"}

    # -------------------------------
    # FX CONSTRAINT (NOW APPLIED)
    # -------------------------------
    if count_fx_transitions(path) > 2:
        return {"error": "Route rejected: too many FX conversions"}

    total_cost = 0
    total_fee = 0
    total_fx = 0
    total_time = 0

    edges = []

    for i in range(len(path) - 1):
        data = G[path[i]][path[i + 1]]
        total, fee, fx, time = calculate_edge_cost(data, amount, mode)

        edges.append({
            "from": path[i],
            "to": path[i + 1],
            "type": data.get("type", "transfer"),
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