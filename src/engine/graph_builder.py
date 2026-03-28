import random
import networkx as nx
from src.utils.fx import get_fx_rate
from src.utils.liquidity import generate_liquidity
from src.policy.sanctions import is_sanctioned  # ✅ NEW


def build_graph(banks, channels, bank_spreads):
    G = nx.MultiDiGraph()

    rail_cost = {
        "SWIFT": 10,
        "SEPA": 2,
        "RTGS": 5
    }

    # -------------------------------
    # Add nodes (bank, currency)
    # -------------------------------
    for bank in banks:
        for currency in bank.supported_currencies:
            G.add_node((bank.name, currency))

    # -------------------------------
    # Transfer edges (RAILS)
    # -------------------------------
    for ch in channels:
        from_bank = next(b for b in banks if b.name == ch.from_bank)
        to_bank = next(b for b in banks if b.name == ch.to_bank)

        common_currencies = set(from_bank.supported_currencies).intersection(
            to_bank.supported_currencies
        )

        for currency in common_currencies:

            # Select rail
            if from_bank.region == to_bank.region:
                if from_bank.region == "EU" and currency == "EUR":
                    rail = "SEPA"
                elif from_bank.region == "IN" and currency == "INR":
                    rail = "RTGS"
                else:
                    rail = "SWIFT"
            else:
                rail = "SWIFT"

            liquidity = generate_liquidity()
            fee = rail_cost.get(rail, 8)

            # ✅ SANCTION CHECK
            sanctioned = is_sanctioned(
                from_bank,
                to_bank,
                currency,
                currency
            )

            # Optional: risk levels
            risk_level = "high" if sanctioned else "normal"

            G.add_edge(
                (from_bank.name, currency),
                (to_bank.name, currency),
                fee=fee,
                fx_rate=1.0,
                time=ch.time * (1.5 if rail == "SWIFT" else 1),
                liquidity=liquidity,
                type="transfer",
                rail=rail,
                sanctioned=sanctioned,   # ✅ NEW
                risk_level=risk_level   # ✅ NEW
            )

    # -------------------------------
    # FX edges (INTRA-BANK)
    # -------------------------------
    for bank in banks:
        for c1 in bank.supported_currencies:
            for c2 in bank.supported_currencies:
                if c1 == c2:
                    continue

                try:
                    rate = get_fx_rate(c1, c2)
                except:
                    rate = 1.0

                spread = bank_spreads.get(
                    bank.name,
                    random.uniform(0.97, 0.995)
                )

                # ✅ SANCTION CHECK (currency-level)
                sanctioned = is_sanctioned(
                    bank,
                    bank,
                    c1,
                    c2
                )

                risk_level = "high" if sanctioned else "normal"

                G.add_edge(
                    (bank.name, c1),
                    (bank.name, c2),
                    fee=2,
                    fx_rate=rate * spread,
                    time=random.uniform(0.5, 2),
                    liquidity=generate_liquidity(),
                    type="fx",
                    rail="FX",
                    sanctioned=sanctioned,   # ✅ NEW
                    risk_level=risk_level   # ✅ NEW
                )

    return G