from data.generator import create_large_sample
from src.engine.graph_builder import build_graph_optimized
from src.engine.router import find_best_route
from src.utils.fx_profiles import generate_bank_spreads
import time


def main():
    print("STARTING PROGRAM (SCALED SANDBOX)")

    n_banks = 200

    start = time.time()
    banks, channels = create_large_sample(n_banks)
    print(
        f"Generated {n_banks} banks and {len(channels)} channels in {time.time() - start:.2f}s"
    )

<<<<<<< HEAD
    start = time.time()
    bank_spreads = generate_bank_spreads(banks)

    G = build_graph_optimized(banks, channels, bank_spreads)
    # Logging is now handled inside build_graph_optimized

    # Use Bank0 as a reliable hub for testing
    source_bank = "Bank0"
    target_bank = f"Bank{n_banks - 1}"

    source = (source_bank, "USD")
    target = (target_bank, "INR")

    print(f"\nRouting from {source} to {target}...")

    try:
        path, total, fee, fx, time_cost = find_best_route(G, source, target, 1000)
    except Exception as e:
        print(f"Error finding route: {e}")
        # Try a different target if the last one failed
        target_bank = f"Bank{n_banks // 2}"
        target = (target_bank, "INR")
        print(f"Retrying with target: {target}...")
        try:
            path, total, fee, fx, time_cost = find_best_route(G, source, target, 1000)
        except:
            print("FAILED to find any route even with retry.")
            return

=======
>>>>>>> parent of 60f34b3 (Added regions, time v/s cost based routing.)
    print("\nBest Route:")
    for bank, currency in path:
        print(f"{bank} ({currency})")

    print(f"\nTotal Cost: {total:.2f}")
    print(f"Fees: {fee:.2f}")
    print(f"FX Loss: {fx:.2f}")
<<<<<<< HEAD
    print(f"Time Cost: {time_cost:.2f}")
=======
    print(f"Time Cost: {time:.2f}")
>>>>>>> parent of 60f34b3 (Added regions, time v/s cost based routing.)


if __name__ == "__main__":
    main()
