from data.generator import create_large_sample
from src.engine.graph_builder import build_graph
from src.engine.router import find_best_route
from src.utils.fx_profiles import generate_bank_spreads

def main():
    print("STARTING PROGRAM")
    banks, channels = create_large_sample(5)

    banks, channels = create_large_sample(10)
    bank_spreads = generate_bank_spreads(banks)

    G = build_graph(banks, channels, bank_spreads)

# pick random source and target banks
    source_bank = banks[0].name
    target_bank = banks[-1].name

    source = (source_bank, "USD")
    target = (target_bank, "INR")
    try:
        path, total, fee, fx, time = find_best_route(
        G, source, target, 1000
    )
    except:
        print("No route found. Try again.")
        return

    from data.generator import create_large_sample
from src.engine.graph_builder import build_graph
from src.engine.router import find_best_route
from src.utils.fx_profiles import generate_bank_spreads
import random


def main():
    print("STARTING PROGRAM")

    # -------------------------------
    # Generate network
    # -------------------------------
    banks, channels = create_large_sample(10)

    # FX profiles
    bank_spreads = generate_bank_spreads(banks)

    # Build graph
    G = build_graph(banks, channels, bank_spreads)

    # -------------------------------
    # Pick random source & target
    # -------------------------------
    source_bank = random.choice(banks).name
    target_bank = random.choice(banks).name

    while target_bank == source_bank:
        target_bank = random.choice(banks).name

    source = (source_bank, "USD")
    target = (target_bank, "INR")

    print(f"\nRouting from {source} → {target}")

    # -------------------------------
    # Run routing
    # -------------------------------
    result = find_best_route(G, source, target, 1000, mode="cheapest") #fastest, balanced,cheapest

    if "error" in result:
        print(result["error"])
        return

    # -------------------------------
    # Output
    # -------------------------------
    print("\nBest Route:")
    for bank, currency in result["path"]:
        print(f"{bank} ({currency})")

    print("\nEdge Breakdown:")
    for edge in result["edges"]:
        print(f"{edge['from']} → {edge['to']} | fee={edge['fee']:.2f}, fx_loss={edge['fx_loss']:.2f}")

    print("\nSummary:")
    print(f"Total Cost: {result['summary']['total_cost']:.2f}")
    print(f"Fees: {result['summary']['total_fee']:.2f}")
    print(f"FX Loss: {result['summary']['total_fx_loss']:.2f}")
    time_hours = result['summary']['total_time']

    print(f"Time: {time_hours:.2f} hours (~{time_hours/24:.2f} days)")


if __name__ == "__main__":
    main()