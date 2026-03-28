import random
from src.models.bank import Bank
from src.models.channel import Channel
from src.utils.time_model import estimate_time


currencies = ["USD", "EUR", "INR", "GBP"]
rails = ["SWIFT", "SEPA", "RTGS"]

countries = [
    "USA", "UK", "India", "Germany", "France",
    "UAE", "Singapore", "Japan", "Australia"
]

region_map = {
    "USA": "NA",
    "UK": "EU",
    "Germany": "EU",
    "France": "EU",
    "India": "IN",
    "UAE": "ME",
    "Singapore": "ASIA",
    "Japan": "ASIA",
    "Australia": "ASIA"
}


def generate_banks(n=50):
    banks = []

    for i in range(n):
        name = f"Bank{i}"
        country = random.choice(countries)

        bank = Bank(name, country)
        bank.region = region_map.get(country, "OTHER")

        for _ in range(3):
            currency = random.choice(currencies)
            partner = f"Bank{random.randint(0, n-1)}"
            balance = random.randint(10000, 500000)

            bank.add_nostro(currency, partner, balance)

        banks.append(bank)

    return banks


def generate_channels(banks, density=0.05):
    channels = []
    n = len(banks)

    # Backbone
    for i in range(n - 1):
        b1 = banks[i]
        b2 = banks[i + 1]

        rail = "SWIFT"
        currency = random.choice(currencies)
        time = estimate_time(b1, b2, rail)

        channels.append(Channel(b1.name, b2.name, currency, rail, time))
        channels.append(Channel(b2.name, b1.name, currency, rail, time))

    # Region logic
    for bank in banks:
        for other in banks:
            if bank.name == other.name:
                continue

            if bank.region == other.region:
                if random.random() < 0.3:
                    if bank.region == "EU":
                        rail = "SEPA"
                    elif bank.region == "IN":
                        rail = "RTGS"
                    else:
                        rail = "SWIFT"

                    currency = random.choice(currencies)
                    time = estimate_time(bank, other, rail)

                    channels.append(Channel(bank.name, other.name, currency, rail, time))

            else:
                if random.random() < 0.05:
                    rail = "SWIFT"
                    currency = random.choice(currencies)
                    time = estimate_time(bank, other, rail)

                    channels.append(Channel(bank.name, other.name, currency, rail, time))

    return channels


def create_large_sample(n_banks=500):
    banks = generate_banks(n_banks)
    channels = generate_channels(banks)
    return banks, channels