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

    print("\nBest Route:")
    for bank, currency in path:
        print(f"{bank} ({currency})")

    print(f"\nTotal Cost: {total:.2f}")
    print(f"Fees: {fee:.2f}")
    print(f"FX Loss: {fx:.2f}")
    print(f"Time Cost: {time:.2f}")


if __name__ == "__main__":
    main()