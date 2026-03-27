import networkx as nx
from src.utils.fx import get_fx_rate
from src.utils.liquidity import generate_liquidity


def build_graph(banks, channels, bank_spreads):
    G = nx.DiGraph()

    rail_cost = {
        "SWIFT": 10,
        "SEPA": 2,
        "RTGS": 5
    }

    # Transfer edges
    for ch in channels:
        liquidity = generate_liquidity()
        fee = rail_cost.get(ch.rail, 8)

        G.add_edge(
            (ch.from_bank, ch.currency),
            (ch.to_bank, ch.currency),
            fee=fee,
            fx_rate=1.0,
            time=ch.time,
            liquidity=liquidity,
            type="transfer",
            rail=ch.rail
        )

    # FX edges
    currencies = ["USD", "EUR", "INR", "GBP"]

    for bank in banks:
        for c1 in currencies:
            for c2 in currencies:
                if c1 == c2:
                    continue

                try:
                    rate = get_fx_rate(c1, c2)
                except:
                    rate = 1.0

                spread = bank_spreads.get(bank.name, 0.995)

                G.add_edge(
                    (bank.name, c1),
                    (bank.name, c2),
                    fee=2,
                    fx_rate=rate * spread,
                    time=0.5,
                    liquidity=generate_liquidity(),
                    type="fx"
                )

    return G