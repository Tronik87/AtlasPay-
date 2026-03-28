import random

import networkx as nx


# -------------------------------
# COST FUNCTION (per edge)
# -------------------------------
def calculate_edge_cost(data, amount, mode="balanced"):
    fee = data['fee']
    fx_rate = data['fx_rate']
    time = data['time']
    edge_type = data.get('type', 'transfer')

    # amount AFTER this edge
    converted_amount = amount * fx_rate
    fx_loss = amount - converted_amount

    # fee deducted AFTER conversion
    new_amount = converted_amount - fee

    # prevent negative amounts
    if new_amount < 0:
        new_amount = 0

    # penalties
    hop_penalty = 1
    fx_penalty = 0.02 * amount if edge_type == "fx" else 0

    money_cost = fx_loss + fx_penalty + fee
    time_cost = time

    if mode == "cheapest":
        total = money_cost + 0.2 * time_cost
    elif mode == "fastest":
        total = time_cost + 0.1 * money_cost
    else:
        total = money_cost + 0.5 * time_cost

    total += hop_penalty

    return total, fee, fx_loss, time, new_amount


# -------------------------------
# FX COUNT
# -------------------------------
def count_fx_transitions(path):
    count = 0
    for i in range(len(path) - 1):
        if path[i][1] != path[i + 1][1]:
            count += 1
    return count


# -------------------------------
# MULTIGRAPH → SIMPLE GRAPH
# -------------------------------
def convert_to_simple_graph(G_multi, amount, mode):
    
    G_simple = nx.DiGraph()

    for u, v, data in G_multi.edges(data=True):
        if data.get("sanctioned", False):
            
            total *= 1000 #heavy penalty to effectively remove from consideration

        if data.get('liquidity', 0) < amount * 0.5:
            continue

        total, _, _, _, _ = calculate_edge_cost(data, amount, mode)

        # ✅ keep multiple paths but store best weight per edge
        if G_simple.has_edge(u, v):
            # slightly randomize to allow diversity
            existing = G_simple[u][v]['weight']
            new_weight = total * random.uniform(0.95, 1.05)

            if new_weight < existing:
                G_simple[u][v]['weight'] = new_weight
        else:
            G_simple.add_edge(
                u,
                v,
                weight=total * random.uniform(0.95, 1.05)
            )

    return G_simple
# -------------------------------
# MAIN ROUTING FUNCTION
# -------------------------------
def find_best_route(G, source, target, amount, mode="balanced", k=5):

    G_simple = convert_to_simple_graph(G, amount, mode)

    try:
        paths = nx.shortest_simple_paths(G_simple, source, target, weight='weight')
    except nx.NetworkXNoPath:
        return {
            "best_route": None,
            "total_routes": 0,
            "routes": []
        }

    results = []
    count = 0
    initial_amount = amount
    current_amount = amount
    
    seen_paths = set()

    for path in paths:

        if count >= k:
            break

        path_signature = tuple(path)
        if path_signature in seen_paths:
            continue
        seen_paths.add(path_signature)

        if len(path) < 3 and count > 0:
            continue

        if count_fx_transitions(path) > 5:
            continue

        total_cost = 0
        total_fee = 0
        total_fx = 0
        total_time = 0

        edges = []
        valid = True

        current_amount = amount

        for i in range(len(path) - 1):

            edges_between = G.get_edge_data(path[i], path[i + 1])

            best_edge = None
            best_cost = float('inf')

            for key in edges_between:
                d = edges_between[key]

                if d.get('liquidity', 0) < current_amount * 0.5:
                    continue

                total, _, _, _, _ = calculate_edge_cost(d, current_amount, mode)

                if total < best_cost:
                    best_cost = total
                    best_edge = d

            if best_edge is None:
                valid = False
                break

            data = best_edge

            total, fee, fx, time, new_amount = calculate_edge_cost(
                data, current_amount, mode
            )

            edges.append({
        "from": path[i],
        "to": path[i + 1],
        "rail": data.get("rail", "FX"),
        "type": data.get("type", "transfer"),
        "fee": round(fee, 2),
        "fx_loss": round(fx, 2),
        "time": round(time, 2),
        "fx_rate": data['fx_rate'],
        "amount_after": round(new_amount, 2),

        # ✅ ADD THIS
        "sanctioned": data.get("sanctioned", False)
    })

            total_cost += total
            total_fee += fee
            total_fx += fx
            total_time += time

            current_amount = new_amount

        if not valid:
            continue

        effective_rate = current_amount / initial_amount if initial_amount > 0 else 0

        is_best = (count == 0)

        results.append({
            "route_id": count + 1,
            "is_best": is_best,
            "path": path,
            "edges": edges,
            "summary": {
                "final_amount": round(current_amount, 2),
                "effective_rate": round(effective_rate, 4),
                "total_cost": round(total_cost, 2),
                "total_fee": round(total_fee, 2),
                "total_fx_loss": round(total_fx, 2),
                "total_time": round(total_time, 2)
            }
        })

        count += 1

    # AFTER LOOP
    best_route = results[0] if len(results) > 0 else None

    return {
        "best_route": best_route,
        "total_routes": len(results),
        "routes": results
    }
def find_routes_multi_mode(G, source, target, amount, k=3):

    modes = ["cheapest", "fastest", "balanced"]
    results = {}

    for mode in modes:
        results[mode] = find_best_route(
            G, source, target, amount, mode=mode, k=k
        )

    return results