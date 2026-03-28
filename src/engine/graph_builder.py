import random
import networkx as nx
from src.utils.fx import get_fx_rate
from src.utils.liquidity import generate_liquidity


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

        # Common currencies only
        common_currencies = set(from_bank.supported_currencies).intersection(
            to_bank.supported_currencies
        )

        for currency in common_currencies:

            # Choose correct rail (DO NOT randomize blindly)
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

            G.add_edge(
                (from_bank.name, currency),
                (to_bank.name, currency),
                fee=fee,
                fx_rate=1.0,
                time=ch.time * (1.5 if rail == "SWIFT" else 1),
                liquidity=liquidity,
                type="transfer",
                rail=rail
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

                G.add_edge(
                    (bank.name, c1),
                    (bank.name, c2),
                    fee=2,
                    fx_rate=rate * spread,
                    time=random.uniform(0.5, 2),
                    liquidity=generate_liquidity(),
                    type="fx",
                    rail="FX"
                )

    return G