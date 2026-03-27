import random
from src.models.bank import Bank
from src.models.channel import Channel


currencies = ["USD", "EUR", "INR", "GBP"]
rails = ["SWIFT", "SEPA", "RTGS"]

countries = [
    "USA", "UK", "India", "Germany", "France",
    "UAE", "Singapore", "Japan", "Australia"
]


# -------------------------------
# 1. GENERATE BANKS
# -------------------------------
def generate_banks(n=200):
    banks = []

    for i in range(n):
        name = f"Bank{i}"
        country = random.choice(countries)

        bank = Bank(name, country)

        # random nostro balances - more for Bank0 (Hub)
        nostro_count = 10 if i == 0 else 3
        for _ in range(nostro_count):
            currency = random.choice(currencies)
            target_idx = random.randint(0, n-1)
            if target_idx == i: continue
            partner = f"Bank{target_idx}"
            balance = random.randint(50000, 1000000) if i == 0 else random.randint(10000, 500000)

            bank.add_nostro(currency, partner, balance)

        banks.append(bank)

    return banks


# -------------------------------
# 2. GENERATE CHANNELS (CONNECTED)
# -------------------------------
def generate_channels(banks, density=0.03):
    channels = []
    n = len(banks)

    # Backbone (ensures connectivity)
    for i in range(n - 1):
>>>>>>> parent of 60f34b3 (Added regions, time v/s cost based routing.)
        b1 = banks[i]
        b2 = banks[i + 1]

        currency = random.choice(currencies)
        rail = random.choice(rails)
        time = random.uniform(0.5, 2)

        channels.append(
            Channel(b1.name, b2.name, currency, rail, time)
        )

        channels.append(
            Channel(b2.name, b1.name, currency, rail, time)
        )

    # Random edges
    for bank in banks:
        for other in banks:
            if bank.name == other.name:
                continue

            if random.random() < density:
                currency = random.choice(currencies)
                rail = random.choice(rails)
                time = random.uniform(0.5, 3)

                channels.append(
                    Channel(bank.name, other.name, currency, rail, time)
                )

    return channels  # ✅ FIXED


# -------------------------------
# 3. MAIN GENERATOR FUNCTION
# -------------------------------
def create_large_sample(n_banks=200):
    banks = generate_banks(n_banks)
    channels = generate_channels(banks)

    return banks, channels