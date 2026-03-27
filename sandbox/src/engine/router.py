from src.utils.fees import calculate_fee
import heapq


def calculate_edge_cost(data, amount):
    fee = calculate_fee(amount)
    fx_rate = data["fx_rate"]
    time_cost = data["time"]

    fx_loss = amount * (1 - fx_rate)
    total = fee + fx_loss + time_cost

    return total, fee, fx_loss, time_cost


def find_best_route(G, source, target, amount):
    import networkx as nx

    def weight(u, v, d):
        if d["liquidity"] < amount:
            return float("inf")
        total, _, _, _ = calculate_edge_cost(d, amount)
        # Dijkstra requires non-negative weights
        return max(0.0001, total)

    try:
        path = nx.shortest_path(G, source, target, weight=weight)
    except nx.NetworkXNoPath:
        raise ValueError("No route found")

    def count_fx_transitions(path):
        count = 0
        for i in range(len(path) - 1):
            if path[i][1] != path[i + 1][1]:
                count += 1
        return count

    if count_fx_transitions(path) > 1:
        print("Warning: Too many FX conversions")

    total_cost = 0
    total_fee = 0
    total_fx = 0
    total_time = 0

    for i in range(len(path) - 1):
        data = G[path[i]][path[i + 1]]
        total, fee, fx, time_cost = calculate_edge_cost(data, amount)

        total_cost += total
        total_fee += fee
        total_fx += fx
        total_time += time_cost

    return path, total_cost, total_fee, total_fx, total_time


def find_best_route_dijkstra(G, source, target, amount):
    """
    Custom Dijkstra implementation for better control over large graphs.
    """
    edges = {source: (None, 0)}
    visited = set()
    heap = [(0, source)]

    while heap:
        cost, node = heapq.heappop(heap)

        if node in visited:
            continue

        visited.add(node)

        if node == target:
            break

        for neighbor in G.neighbors(node):
            if neighbor in visited:
                continue

            data = G[node][neighbor]

            if data["liquidity"] < amount:
                continue

            edge_cost, _, _, _ = calculate_edge_cost(data, amount)
            new_cost = cost + edge_cost

            if neighbor not in edges or new_cost < edges[neighbor][1]:
                edges[neighbor] = (node, new_cost)
                heapq.heappush(heap, (new_cost, neighbor))

    if target not in edges:
        raise ValueError("No route found")

    path = []
    node = target
    while node:
        path.append(node)
        node = edges[node][0]
    path.reverse()

    total_cost = 0
    total_fee = 0
    total_fx = 0
    total_time = 0

    for i in range(len(path) - 1):
        data = G[path[i]][path[i + 1]]
        total, fee, fx, time_cost = calculate_edge_cost(data, amount)

        total_cost += total
        total_fee += fee
        total_fx += fx
        total_time += time_cost

    return path, total_cost, total_fee, total_fx, total_time
