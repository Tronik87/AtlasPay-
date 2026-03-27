from src.utils.fees import calculate_fee
def calculate_edge_cost(data, amount):
    fee = calculate_fee(amount)
    fx_rate = data['fx_rate']
    time = data['time']

    fx_loss = amount * (1 - fx_rate)

    total = fee + fx_loss + time

    return total, fee, fx_loss, time


def find_best_route(G, source, target, amount):
    import networkx as nx

    def weight(u, v, d):
        def weight(u, v, d):
            if d['liquidity'] < amount:
                return float('inf')  # block this route

        total, _, _, _ = calculate_edge_cost(d, amount)
        return total
        
    path = nx.shortest_path(G, source, target, weight=weight)
    def count_fx_transitions(path):
        count = 0
        for i in range(len(path)-1):
            if path[i][1] != path[i+1][1]:
                count += 1
        return count
    if count_fx_transitions(path) > 1:
        print("⚠️ Warning: Too many FX conversions (will fix next)")

    # Now compute breakdown
    total_cost = 0
    total_fee = 0
    total_fx = 0
    total_time = 0

    for i in range(len(path) - 1):
        data = G[path[i]][path[i+1]]
        total, fee, fx, time = calculate_edge_cost(data, amount)

        total_cost += total
        total_fee += fee
        total_fx += fx
        total_time += time

    return path, total_cost, total_fee, total_fx, total_time