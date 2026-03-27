import random

def estimate_time(from_bank, to_bank, rail):
    # Base times (in hours)
    base_time = {
        "SWIFT": random.uniform(24, 72),   # 1–3 days
        "SEPA": random.uniform(0.1, 2),    # minutes to hours
        "RTGS": random.uniform(0.01, 0.5)  # near instant
    }

    time = base_time.get(rail, 24)

    # Region effect
    if from_bank.region != to_bank.region:
        time *= 1.5  # cross-border penalty

    # Random delay (processing, batching)
    time *= random.uniform(0.9, 1.2)

    return time