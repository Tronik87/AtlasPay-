import networkx as nx
import concurrent.futures
from functools import partial
from src.utils.fx import get_fx_rate, prefetch_fx_rates
from src.utils.liquidity import generate_liquidity


def build_graph(banks, channels, bank_spreads):
    G = nx.DiGraph()

    rail_cost = {"SWIFT": 10, "SEPA": 2, "RTGS": 5}

    # Add transfer edges in parallel
    def add_transfer_edge(ch):
        liquidity = generate_liquidity()
        fee = rail_cost.get(ch.rail, 8)
        return (
            (ch.from_bank, ch.currency),
            (ch.to_bank, ch.currency),
            {
                "fee": fee,
                "fx_rate": 1.0,
                "time": ch.time,
                "liquidity": liquidity,
                "type": "transfer",
                "rail": ch.rail,
            },
        )

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        transfer_edges = list(executor.map(add_transfer_edge, channels))

    for src, dst, data in transfer_edges:
        G.add_edge(src, dst, **data)

    # Add FX edges - use cached rates
    currencies = ["USD", "INR", "EUR"]

    for bank in banks:
        spread = bank_spreads.get(bank.name, 0.995)

        for c1 in currencies:
            for c2 in currencies:
                if c1 == c2:
                    continue

                rate = get_fx_rate(c1, c2)
                liquidity = generate_liquidity()

                G.add_edge(
                    (bank.name, c1),
                    (bank.name, c2),
                    fee=2,
                    fx_rate=rate * spread,
                    time=0.5,
                    liquidity=liquidity,
                    type="fx",
                )

    return G


def build_graph_optimized(banks, channels, bank_spreads):
    import logging
    import time
    logger = logging.getLogger(__name__)
    
    start_time = time.time()
    G = nx.DiGraph()

    rail_cost = {"SWIFT": 10, "SEPA": 2, "RTGS": 5}

    # Prefetch FX rates once
    currencies = ["USD", "INR", "EUR", "GBP"]
    prefetch_fx_rates(currencies)

    # Batch add transfer edges
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
            rail=ch.rail,
        )

    # Batch add FX edges using pre-cached rates
    fx_edge_count = 0
    for bank in banks:
        spread = bank_spreads.get(bank.name, 0.995)

        for c1 in currencies:
            for c2 in currencies:
                if c1 == c2:
                    continue

                rate = get_fx_rate(c1, c2)
                liquidity = generate_liquidity()

                G.add_edge(
                    (bank.name, c1),
                    (bank.name, c2),
                    fee=2,
                    fx_rate=rate * spread,
                    time=0.5,
                    liquidity=liquidity,
                    type="fx",
                )
                fx_edge_count += 1

    logger.info(f"Built graph in {time.time() - start_time:.2f}s: "
                f"{G.number_of_nodes()} nodes, {G.number_of_edges()} edges "
                f"({fx_edge_count} FX edges)")
    return G
