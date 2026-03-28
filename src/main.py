from data.generator import create_large_sample
from src.engine.graph_builder import build_graph
from src.utils.fx_profiles import generate_bank_spreads
from src.engine.router import find_best_route
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
    source_obj = random.choice(banks)
    target_obj = random.choice(banks)

    while target_obj.name == source_obj.name:
        target_obj = random.choice(banks)

    # 🔥 Choose realistic currencies
    source_currency = random.choice(source_obj.supported_currencies)
    target_currency = random.choice(target_obj.supported_currencies)

    source = (source_obj.name, source_currency)
    target = (target_obj.name, target_currency)

    print(
        f"\nRouting from {source_obj.name} ({source_currency}) "
        f"→ {target_obj.name} ({target_currency})"
    )

    # -------------------------------
    # Find best routes
    # -------------------------------
    result = find_best_route(
        G,
        source,
        target,
        1000,
        mode="balanced",
        k=5
    )

    # -------------------------------
    # Handle errors
    # -------------------------------
    if not isinstance(result, dict):
        print("❌ Unexpected result format from router")
        return

    if "routes" not in result or len(result["routes"]) == 0:
        print("⚠️ No valid routes found")
        return

    # -------------------------------
    # Display results
    # -------------------------------
    print("\n" + "=" * 60)
    print("🚀 TOP ROUTES")
    print("=" * 60)

    for idx, route in enumerate(result["routes"], start=1):
        print(f"\nRoute {idx}")
        print("-" * 40)

        path = route["path"]
        summary = route["summary"]

        # ---- Path visualization ----
        for i, (bank, currency) in enumerate(path):
            if i > 0:
                prev_currency = path[i - 1][1]

                if currency != prev_currency:
                    print("   🔄 FX Conversion")

                print("   ↓")

            print(f"{bank} ({currency})")

        # ---- Summary ----
        print("\nSummary:")
        print(f"💰 Cost : {summary['total_cost']:.2f}")
        print(f"💸 Fees : {summary['total_fee']:.2f}")
        print(f"💱 FX   : {summary['total_fx_loss']:.2f}")

        # 🔥 NEW: final amount after FX
        if "final_amount" in summary:
            print(f"💵 Final Amount Received : {summary['final_amount']:.2f}")

        time_hours = summary['total_time']
        print(f"⏱️  Time : {time_hours:.2f} hrs (~{time_hours/24:.2f} days)")
        print(f"📉 Effective Rate : {summary['effective_rate']:.4f}")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()