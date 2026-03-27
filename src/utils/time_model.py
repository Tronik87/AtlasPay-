import random

def estimate_time(from_bank, to_bank, rail):
    base_time = {
        "SWIFT": random.uniform(24, 72),
        "SEPA": random.uniform(0.1, 2),
        "RTGS": random.uniform(0.01, 0.5)
    }

    time = base_time.get(rail, 24)

    if from_bank.region != to_bank.region:
        time *= 1.5

    time *= random.uniform(0.9, 1.2)

    return time