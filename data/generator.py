import random
from src.models.bank import Bank
from src.models.channel import Channel
from src.utils.time_model import estimate_time
from src.config.constants import region_map, COUNTRY_TO_CURRENCY


REAL_BANKS = [
    ("JPMorgan", "USA"),
    ("Bank of America", "USA"),
    ("Citibank", "USA"),
    ("Goldman Sachs", "USA"),

    ("HSBC", "UK"),
    ("Barclays", "UK"),
    ("Standard Chartered", "UK"),

    ("Deutsche Bank", "Germany"),
    ("Commerzbank", "Germany"),

    ("BNP Paribas", "France"),
    ("Société Générale", "France"),

    ("UBS", "Switzerland"),
    ("Credit Suisse", "Switzerland"),

    ("Mitsubishi UFJ", "Japan"),
    ("Sumitomo Mitsui", "Japan"),

    ("ICBC", "China"),
    ("Bank of China", "China"),

    ("HDFC Bank", "India"),
    ("ICICI Bank", "India"),
    ("State Bank of India", "India"),

    ("DBS Bank", "Singapore"),
    ("OCBC Bank", "Singapore"),

    ("ANZ", "Australia"),
    ("Westpac", "Australia"),

    # 🔴 Add sanction-relevant countries (IMPORTANT)
    ("Tehran Central Bank", "Iran"),
    ("Moscow Financial Bank", "Russia"),
    ("Pyongyang Credit Bank", "North Korea"),
]


def generate_banks(n_banks=25):
    banks = []

    selected = REAL_BANKS[:n_banks]

    for name, country in selected:
        bank = Bank(name, country)

        bank.region = region_map.get(country, "GLOBAL")

        primary_currency = COUNTRY_TO_CURRENCY.get(country, "USD")
        bank.currency = primary_currency

        bank.supported_currencies = list(set([
            primary_currency,
            "USD",
            "EUR"
        ]))

        # ✅ Optional: risk metadata (used by policy engine)
        if country in ["Iran", "Russia", "North Korea"]:
            bank.risk_profile = "high"
        else:
            bank.risk_profile = "normal"

        banks.append(bank)

    return banks


def generate_channels(banks, density=0.3):
    channels = []
    n = len(banks)

    # Backbone (ensures connectivity)
    for i in range(n - 1):
        b1 = banks[i]
        b2 = banks[i + 1]

        rail = "SWIFT"
        time = estimate_time(b1, b2, rail)

        channels.append(Channel(b1.name, b2.name, rail, time))
        channels.append(Channel(b2.name, b1.name, rail, time))

    # Region-based connections
    for bank in banks:
        for other in banks:
            if bank.name == other.name:
                continue

            if bank.region == other.region:
                if random.random() < density:
                    if bank.region == "EU":
                        rail = "SEPA"
                    elif bank.region == "IN":
                        rail = "RTGS"
                    else:
                        rail = "SWIFT"

                    time = estimate_time(bank, other, rail)
                    channels.append(Channel(bank.name, other.name, rail, time))

            else:
                if random.random() < density / 2:
                    rail = "SWIFT"
                    time = estimate_time(bank, other, rail)
                    channels.append(Channel(bank.name, other.name, rail, time))

    return channels


def create_large_sample(n_banks=25):
    banks = generate_banks(n_banks)
    channels = generate_channels(banks)
    return banks, channels