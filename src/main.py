from data.generator import create_large_sample
from src.engine.graph_builder import build_graph
from src.engine.router import find_best_route
from src.utils.fx_profiles import generate_bank_spreads
import random


def main():
    print("STARTING PROGRAM")

    banks, channels = create_large_sample(10)

    bank_spreads = generate_bank_spreads(banks)

    G = build_graph(banks, channels, bank_spreads)

    source_bank = random.choice(banks).name
    target_bank = random.choice(banks).name

    while target_bank == source_bank:
        target_bank = random.choice(banks).name

    source = (source_bank, "USD")
    target = (target_bank, "INR")

    print(f"\nRouting from {source} → {target}")

    result = find_best_route(G, source, target, 1000, mode="balanced")

    if "error" in result:
        print(result["error"])
        return

    from data.generator import create_large_sample
from src.engine.graph_builder import build_graph
from src.engine.router import find_best_route
from src.utils.fx_profiles import generate_bank_spreads
import random


def main():
    print("STARTING PROGRAM")

    banks, channels = create_large_sample(10)

    bank_spreads = generate_bank_spreads(banks)

    G = build_graph(banks, channels, bank_spreads)

    source_bank = random.choice(banks).name
    target_bank = random.choice(banks).name

    while target_bank == source_bank:
        target_bank = random.choice(banks).name

    source = (source_bank, "USD")
    target = (target_bank, "INR")

    print(f"\nRouting from {source} → {target}")

    result = find_best_route(G, source, target, 1000, mode="balanced")

    if "error" in result:
        print(result["error"])
        return

    print("\nBest Route:")
    for bank, currency in result["path"]:
        print(f"{bank} ({currency})")

    print("\nSummary:")
    print(result["summary"])


if __name__ == "__main__":
    main()


