import networkx as nx


def calculate_edge_cost(data, amount, mode="balanced"):
    fee = data['fee']
    fx_rate = data['fx_rate']
    time = data['time']
    edge_type = data.get('type', 'transfer')

    fx_loss = amount * (1 - fx_rate)

    hop_penalty = 1
    fx_penalty = 5 if edge_type == "fx" else 0

    money_cost = fee + fx_loss
    time_cost = time

    if mode == "cheapest":
        total = money_cost + 0.2 * time_cost
    elif mode == "fastest":
        total = time_cost + 0.1 * money_cost
    else:
        total = money_cost + 0.5 * time_cost

    total += hop_penalty + fx_penalty

    return total, fee, fx_loss, time


def count_fx_transitions(path):
    count = 0
    for i in range(len(path) - 1):
        if path[i][1] != path[i + 1][1]:
            count += 1
    return count


# -------------------------------
# Convert MultiGraph → DiGraph
# -------------------------------
def convert_to_simple_graph(G_multi, amount, mode):
    G_simple = nx.DiGraph()

    for u, v, data in G_multi.edges(data=True):

        if data.get('liquidity', 0) < amount:
            continue

        total, _, _, _ = calculate_edge_cost(data, amount, mode)

        if G_simple.has_edge(u, v):
            if total < G_simple[u][v]['weight']:
                G_simple[u][v]['weight'] = total
        else:
            G_simple.add_edge(u, v, weight=total)

    return G_simple


# -------------------------------
# MULTI ROUTE FUNCTION
# -------------------------------
def find_multiple_routes(G, source, target, amount, mode="balanced", k=5):
    print("DEBUG: starting route search")

    G_simple = convert_to_simple_graph(G, amount, mode)

    try:
        paths = nx.shortest_simple_paths(G_simple, source, target, weight='weight')
    except nx.NetworkXNoPath:
        return {"error": "No routes found"}

    results = []
    count = 0

    for path in paths:
        print("DEBUG PATH:", path)

        if count >= k:
            break

        if count_fx_transitions(path) > 100:
            continue

        total_cost = 0
        total_fee = 0
        total_fx = 0
        total_time = 0

        edges = []
        valid = True

        for i in range(len(path) - 1):

            edges_between = G.get_edge_data(path[i], path[i + 1])

            best_edge = None
            best_cost = float('inf')

            for key in edges_between:
                d = edges_between[key]

                if d.get('liquidity', 0) < amount * 0.5:
                    continue

                total, _, _, _ = calculate_edge_cost(d, amount, mode)

                if total < best_cost:
                    best_cost = total
                    best_edge = d

            if best_edge is None:
                valid = False
                break

            data = best_edge
            total, fee, fx, time = calculate_edge_cost(data, amount, mode)

            edges.append({
                "from": path[i],
                "to": path[i + 1],
                "rail": data.get("rail", "FX"),
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

        if not valid:
            continue

        results.append({
            "path": path,
            "edges": edges,
            "summary": {
                "total_cost": total_cost,
                "total_fee": total_fee,
                "total_fx_loss": total_fx,
                "total_time": total_time
            }
        })

        count += 1

    print("DEBUG: total valid routes =", len(results))

    return {
        "routes": results
    }

