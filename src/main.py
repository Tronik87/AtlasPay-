from data.generator import create_large_sample
from src.engine.graph_builder import build_graph
from src.utils.fx_profiles import generate_bank_spreads
from src.engine.router import find_multiple_routes
import random


def main():
    print("STARTING PROGRAM")

    # -------------------------------
    # Generate network
    # -------------------------------
    banks, channels = create_large_sample(10)
    bank_spreads = generate_bank_spreads(banks)

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
    # Get multiple routes
    # -------------------------------
    result = find_multiple_routes(
        G, source, target, 1000,
        mode="balanced",
        k=5
    )

    if "error" in result:
        print(result["error"])
        return
    if len(result["routes"]) == 0:
        print("⚠️ No valid routes found")
        return

    # -------------------------------
    # Output
    # -------------------------------
    print("\n" + "="*60)
    print("🚀 TOP ROUTES")
    print("="*60)

    for idx, route in enumerate(result["routes"], start=1):
        print(f"\nRoute {idx}")
        print("-"*40)

        # Path display
        for i, (bank, currency) in enumerate(route["path"]):
            if i > 0:
                prev_currency = route["path"][i-1][1]

                if currency != prev_currency:
                    print("   🔄 FX Conversion")

                print("   ↓")

            print(f"{bank} ({currency})")

        # Summary
        summary = route["summary"]

        print("\nSummary:")
        print(f"💰 Cost : {summary['total_cost']:.2f}")
        print(f"💸 Fees : {summary['total_fee']:.2f}")
        print(f"💱 FX   : {summary['total_fx_loss']:.2f}")

        time_hours = summary['total_time']
        print(f"⏱️  Time : {time_hours:.2f} hrs (~{time_hours/24:.2f} days)")

    print("\n" + "="*60)


if __name__ == "__main__":
    main()