from data.generator import create_large_sample
from src.engine.graph_builder import build_graph_optimized
from src.engine.router import find_best_route
from src.utils.fx_profiles import generate_bank_spreads
import time


def benchmark():
    print("=" * 60)
    print("SCALABILITY BENCHMARK")
    print("=" * 60)

    test_sizes = [10, 50, 100, 500, 1000]

    for n_banks in test_sizes:
        print(f"\n--- Testing with {n_banks} banks ---")

        start = time.time()
        banks, channels = create_large_sample(n_banks)
        gen_time = time.time() - start
        print(f"  Generated banks/channels: {gen_time:.2f}s")

        start = time.time()
        bank_spreads = generate_bank_spreads(banks)
        G = build_graph_optimized(banks, channels, bank_spreads)
        build_time = time.time() - start
        print(
            f"  Built graph ({G.number_of_nodes()} nodes, {G.number_of_edges()} edges): {build_time:.2f}s"
        )

        # Test routing
        source = (banks[0].name, "USD")
        target = (banks[-1].name, "INR")

        start = time.time()
        try:
            path, total, fee, fx, time_cost = find_best_route(G, source, target, 1000)
            route_time = time.time() - start
            print(f"  Route found ({len(path)} hops): {route_time:.4f}s")
            print(f"  Total cost: {total:.2f}")
        except Exception as e:
            route_time = time.time() - start
            print(f"  No route found: {route_time:.4f}s")

        print(f"  TOTAL: {gen_time + build_time + route_time:.2f}s")


if __name__ == "__main__":
    benchmark()
